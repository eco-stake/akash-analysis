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
import { BlockDetail } from "@src/types";
import { FormattedDate, FormattedRelativeTime } from "react-intl";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import { TransactionRow } from "@src/components/shared/TransactionRow";

type Props = {
  errors?: string;
  height: string;
  block: BlockDetail;
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
    maxWidth: "10rem",
    flex: "1 1 0px",
    flexBasis: 0
  },
  value: {
    wordBreak: "break-all",
    overflowWrap: "anywhere"
  }
}));

const BlockDetailPage: React.FunctionComponent<Props> = ({ block, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Layout title={`Block #${block.height}`} appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
          Details for Block #{block.height}
        </Typography>

        <Paper sx={{ padding: 2 }}>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Height</div>
            <div className={classes.value}>{block.height}</div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Block Time</div>
            <div className={classes.value}>
              <FormattedRelativeTime
                value={(new Date(block.datetime).getTime() - new Date().getTime()) / 1000}
                numeric="auto"
                unit="second"
                updateIntervalInSeconds={7}
              />
              &nbsp;(
              <FormattedDate value={block.datetime} year="numeric" month="2-digit" day="2-digit" hour="2-digit" minute="2-digit" second="2-digit" />)
            </div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Block Hash</div>
            <div className={classes.value}>{block.hash}</div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}># of Transactions</div>
            <div className={classes.value}>{block.transactions.length}</div>
          </div>
          <div className={classes.blockInfoRow}>
            <div className={classes.label}>Gas wanted / used</div>
            <div className={classes.value}>
              {block.gasUsed} / {block.gasWanted}
            </div>
          </div>
        </Paper>

        <Box sx={{ mt: "1rem" }}>
          <Typography variant="h3" sx={{ fontSize: "1.5rem", mb: "1rem", fontWeight: "bold", marginLeft: ".5rem" }}>
            Transactions
          </Typography>

          <Paper sx={{ padding: 2 }}>
            <TableContainer sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">Tx Hash</TableCell>
                    <TableCell align="center" width="10%">
                      Type
                    </TableCell>
                    <TableCell align="center">Result</TableCell>
                    <TableCell align="center">Amount</TableCell>
                    <TableCell align="center">Fee</TableCell>
                    <TableCell align="center">Height</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {block.transactions.map(transaction => (
                    <TransactionRow key={transaction.hash} transaction={transaction} blockHeight={block.height} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </PageContainer>
    </Layout>
  );
};

export default BlockDetailPage;

export async function getServerSideProps({ params }) {
  const block = await fetchBlockData(params?.height);

  return {
    props: {
      height: params?.height,
      block
    }
  };
}

async function fetchBlockData(height: string) {
  const response = await axios.get(`${BASE_API_URL}/api/blocks/${height}`);
  return response.data;
}
