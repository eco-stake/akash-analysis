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
import { FormattedRelativeTime } from "react-intl";
import { toUTC } from "@src/utils/dateUtils";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { BlockRow } from "@src/components/shared/BlockRow";

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

const BlocksPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: blocks } = useBlocks(20, {
    refetchInterval: 7000
  });

  return (
    <Layout title="Blocks" appendGenericTitle>
      <PageContainer>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
            Blocks
          </Typography>
        </Box>

        <Paper sx={{ padding: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
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
