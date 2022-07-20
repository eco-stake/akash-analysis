import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { cx } from "@emotion/css";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import { BlockDetail, TransactionDetail } from "@src/types";
import { FormattedDate, FormattedRelativeTime } from "react-intl";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { TransactionRow } from "@src/components/shared/TransactionRow";
import { useSplitText } from "@src/hooks/useShortText";
import { udenomToDemom } from "@src/utils/mathHelpers";
import { TxMessageRow } from "@src/components/shared/TxMessages/TxMessageRow";

type Props = {
  errors?: string;
  hash: string;
  transaction: TransactionDetail;
};

const useStyles = makeStyles()(theme => ({
  root: {
    paddingTop: "2rem",
    paddingBottom: "2rem",
    marginLeft: "0"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginLeft: ".5rem",
    marginBottom: "1rem"
  },
  titleSmall: {
    fontSize: "1.1rem"
  },
  blockInfoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    "&:last-child": {
      marginBottom: 0
    }
  },
  label: {
    fontWeight: "bold",
    maxWidth: "15rem",
    flex: "1 1 0px",
    flexBasis: 0
  },
  value: {
    wordBreak: "break-all",
    overflowWrap: "anywhere"
  }
}));

const TransactionDetailPage: React.FunctionComponent<Props> = ({ transaction, errors, hash }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const splittedTxHash = useSplitText(hash, 6, 6);

  return (
    <Layout title={`Tx ${splittedTxHash}`} appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
          Transaction Details
        </Typography>

        <Paper sx={{ padding: 2 }}>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Hash</div>
            <div className={classes.value}>{transaction.hash}</div>
          </div>

          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Status</div>
            <div className={classes.value}>{transaction.isSuccess ? "Success" : "Failed"}</div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Height</div>
            <div className={classes.value}>
              <Link href={UrlService.block(transaction.height)}>
                <a>{transaction.height}</a>
              </Link>
            </div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Status</div>
            <div className={classes.value}>
              <FormattedRelativeTime
                value={(new Date(transaction.datetime).getTime() - new Date().getTime()) / 1000}
                numeric="auto"
                unit="second"
                updateIntervalInSeconds={7}
              />
              &nbsp;(
              <FormattedDate value={transaction.datetime} year="numeric" month="2-digit" day="2-digit" hour="2-digit" minute="2-digit" second="2-digit" />)
            </div>
          </div>

          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Fee</div>
            <div className={classes.value}>
              {udenomToDemom(transaction.fee, 6)}&nbsp;
              <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                AKT
              </Box>
            </div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Gas (used/wanted)</div>
            <div className={classes.value}>
              {transaction.gasUsed}/{transaction.gasWanted}
            </div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Memo</div>
            <div className={classes.value}>{transaction.memo}</div>
          </div>
        </Paper>

        <Box sx={{ mt: "1rem" }}>
          <Typography variant="h3" sx={{ fontSize: "1.5rem", mb: "1rem", fontWeight: "bold", marginLeft: ".5rem" }}>
            Messages
          </Typography>

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
