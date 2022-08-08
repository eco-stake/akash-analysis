import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import CircularProgress from "@mui/material/CircularProgress";
import { useProposals } from "@src/queries/useProposalsQuery";
import { ProposalRow } from "@src/components/shared/ProposalRow";
import { Title } from "@src/components/shared/Title";

type Props = {
  errors?: string;
};

const useStyles = makeStyles()(theme => ({
  tableHeader: {
    "& th": {
      textTransform: "uppercase",
      border: "none",
      opacity: 0.8
    }
  }
}));

const ProposalsPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: proposals, isLoading } = useProposals();

  return (
    <Layout title="Proposals" appendGenericTitle>
      <PageContainer>
        <Title value="Proposals" />

        <Paper sx={{ padding: 2 }} elevation={2}>
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableHeader}>
                    <TableCell width="5%">ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submit Time</TableCell>
                    <TableCell>Voting End</TableCell>
                    <TableCell align="right">Total Deposit</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {proposals?.map(proposal => (
                    <ProposalRow key={proposal.id} proposal={proposal} />
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

export default ProposalsPage;

export async function getServerSideProps({ params }) {
  return {
    props: {}
  };
}
