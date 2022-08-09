import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
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
import { useValidators } from "@src/queries/useValidatorsQuery";
import { ValidatorRow } from "@src/components/shared/ValidatorRow";
import { NextSeo } from "next-seo";
import { Title } from "@src/components/shared/Title";
import { validatorAddress } from "@src/utils/constants";

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

const ValidatorsPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { data: validators, isLoading } = useValidators();
  const cloudmos = validators?.find(v => v.operatorAddress === validatorAddress);

  return (
    <Layout>
      <NextSeo title="Validators" />

      <PageContainer>
        <Title value="Validators" />

        <Paper sx={{ padding: 2 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow className={classes.tableHeader}>
                    <TableCell width="5%">Rank</TableCell>
                    <TableCell>Validator</TableCell>
                    <TableCell align="right">Voting Power</TableCell>
                    <TableCell align="center">Commission</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <ValidatorRow validator={cloudmos} />

                  {validators?.map(validator => (
                    <ValidatorRow key={validator.operatorAddress} validator={validator} />
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

export default ValidatorsPage;

export async function getServerSideProps({ params }) {
  return {
    props: {}
  };
}
