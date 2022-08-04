import Layout from "../components/layout/Layout";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";
import PageContainer from "@src/components/shared/PageContainer";
import { useDashboardData } from "@src/queries/useDashboardData";
import { Dashboard } from "@src/components/dashboard/Dashboard";
import { cx } from "@emotion/css";
import { FormattedDate, FormattedTime } from "react-intl";
import CircularProgress from "@mui/material/CircularProgress";
import { useMediaQueryContext } from "@src/context/MediaQueryProvider";
import { GradientText } from "@src/components/shared/GradientText";
import { useMediaQuery, useTheme } from "@mui/material";

type Props = {
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  subTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  refreshDate: {
    fontSize: ".7rem",
    fontStyle: "italic"
  }
}));

const IndexPage: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const { data: dashboardData, isLoading } = useDashboardData();
  const theme = useTheme();

  return (
    <Layout title="Dashboard" appendGenericTitle>
      <PageContainer>
        <Box mb={4}>
          <Typography variant="h1" className={classes.title}>
            <GradientText>Dashboard</GradientText>
          </Typography>
        </Box>

        <Box>
          {isLoading && !dashboardData && (
            <Box sx={{ display: "flex", alignItems: "center", padding: "1rem" }}>
              <CircularProgress size={60} color="secondary" />
            </Box>
          )}

          {dashboardData && (
            <>
              <Dashboard dashboardData={dashboardData} />

              <Box
                sx={{
                  mt: 5,
                  [theme.breakpoints.down("md")]: {
                    textAlign: "center"
                  }
                }}
              >
                <Typography variant="caption" sx={{ fontStyle: "italic", color: theme.palette.grey[500] }}>
                  Last updated: <FormattedDate value={dashboardData.now.date} /> <FormattedTime value={dashboardData.now.date} />
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </PageContainer>
    </Layout>
  );
};

export async function getServerSideProps() {
  return {
    props: {}
    //revalidate: 20
  };
}

export default IndexPage;
