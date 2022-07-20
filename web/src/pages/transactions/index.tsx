import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { cx } from "@emotion/css";
import PageContainer from "@src/components/shared/PageContainer";
import { useBlocks } from "@src/queries/useBlocksQuery";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { BlockRow } from "@src/components/shared/BlockRow";
import CircularProgress from "@mui/material/CircularProgress";
import { useTransactions } from "@src/queries/useTransactionsQuery";
import { TransactionRow } from "@src/components/shared/TransactionRow";

type Props = {
  errors?: string;
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
    marginBottom: "2px"
  },
  titleSmall: {
    fontSize: "1.1rem"
  }
}));

const TransactionsPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: transactions, isLoading } = useTransactions(20, {
    refetchInterval: 7000
  });

  return (
    <Layout title="Transactions" appendGenericTitle>
      <PageContainer>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
            Transactions
          </Typography>
        </Box>

        <Paper sx={{ padding: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
              <CircularProgress sx={{ color: theme.palette.secondary.main }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%">Tx Hash</TableCell>
                    <TableCell align="center" width="20%">
                      Type
                    </TableCell>
                    <TableCell align="center" width="10%">Result</TableCell>
                    <TableCell align="center" width="10%">Amount</TableCell>
                    <TableCell align="center" width="10%">Fee</TableCell>
                    <TableCell align="center" width="5%">Height</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {transactions?.map(tx => (
                    <TransactionRow key={tx.hash} transaction={tx} blockHeight={tx.height} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </PageContainer>
    </Layout>
  );
};

export default TransactionsPage;

export async function getServerSideProps({ params }) {
  return {
    props: {}
  };
}
