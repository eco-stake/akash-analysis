import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { cx } from "@emotion/css";
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
import { GradientText } from "@src/components/shared/GradientText";

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
    marginBottom: "2px"
  },
  titleSmall: {
    fontSize: "1.1rem"
  },
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
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: validators, isLoading } = useValidators();
  const cloudmos = validators?.find(v => v.moniker === "Akashlytics");

  return (
    <Layout title="Validators" appendGenericTitle>
      <PageContainer>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
            <GradientText>Validators</GradientText>
          </Typography>
        </Box>

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
