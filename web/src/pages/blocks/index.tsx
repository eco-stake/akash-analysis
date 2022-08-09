import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
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
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";

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

const BlocksPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const { data: blocks, isLoading } = useBlocks(20, {
    refetchInterval: 7000
  });

  return (
    <Layout>
      <NextSeo title="Blocks" />

      <PageContainer>
        <Title value="Blocks" />

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
                    <TableCell width="5%">Height</TableCell>
                    <TableCell align="center" width="10%">
                      Proposer
                    </TableCell>
                    <TableCell align="center" width="45%">
                      Transactions
                    </TableCell>
                    <TableCell align="center" width="10%">
                      Time
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {blocks?.map(block => (
                    <BlockRow key={block.height} block={block} />
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

export default BlocksPage;

export async function getServerSideProps({ params }) {
  return {
    props: {}
  };
}
