import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import { TransactionDetail } from "@src/types";
import { FormattedDate, FormattedRelativeTime } from "react-intl";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { getSplitText } from "@src/hooks/useShortText";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { TxMessageRow } from "@src/components/shared/TxMessages/TxMessageRow";
import { FormattedDecimal } from "@src/components/shared/FormattedDecimal";
import { LabelValue } from "@src/components/shared/LabelValue";
import { Title } from "@src/components/shared/Title";

type Props = {
  errors?: string;
  hash: string;
  transaction: TransactionDetail;
};

const useStyles = makeStyles()(theme => ({}));

const TransactionDetailPage: React.FunctionComponent<Props> = ({ transaction, errors, hash }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const splittedTxHash = getSplitText(hash, 6, 6);

  return (
    <Layout title={`Tx ${splittedTxHash}`} appendGenericTitle>
      <PageContainer>
        <Title value="Transaction Details" />

        <Paper sx={{ padding: 2 }} elevation={2}>
          <LabelValue label="Hash" value={transaction.hash} />
          <LabelValue label="Status" value={transaction.isSuccess ? "Success" : "Failed"} />
          <LabelValue
            label="Height"
            value={
              <Link href={UrlService.block(transaction.height)}>
                <a>{transaction.height}</a>
              </Link>
            }
          />
          <LabelValue
            label="Time"
            value={
              <>
                <FormattedRelativeTime
                  value={(new Date(transaction.datetime).getTime() - new Date().getTime()) / 1000}
                  numeric="auto"
                  unit="second"
                  updateIntervalInSeconds={7}
                />
                &nbsp;(
                <FormattedDate value={transaction.datetime} year="numeric" month="2-digit" day="2-digit" hour="2-digit" minute="2-digit" second="2-digit" />)
              </>
            }
          />
          <LabelValue
            label="Fee"
            value={
              <>
                <FormattedDecimal value={udenomToDenom(transaction.fee, 6)} />
                &nbsp;
                <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                  AKT
                </Box>
              </>
            }
          />
          <LabelValue label="Gas (used/wanted)" value={transaction.gasUsed / transaction.gasWanted} />
          <LabelValue label="Memo" value={transaction.memo} />
        </Paper>

        <Box sx={{ mt: "1rem" }}>
          <Title value="Messages" subTitle sx={{ marginBottom: "1rem" }} />

          {transaction.messages.map(msg => (
            <Paper key={msg.id} sx={{ padding: 0, mb: 2 }}>
              <TxMessageRow message={msg} />
            </Paper>
          ))}
        </Box>
      </PageContainer>
    </Layout>
  );
};

export default TransactionDetailPage;

export async function getServerSideProps({ params }) {
  const transaction = await fetchTransactionData(params?.hash);

  return {
    props: {
      hash: params?.hash,
      transaction
    }
  };
}

async function fetchTransactionData(hash: string) {
  console.log(`${BASE_API_URL}/api/transactions/${hash}`);
  const response = await axios.get(`${BASE_API_URL}/api/transactions/${hash}`);
  return response.data;
}
