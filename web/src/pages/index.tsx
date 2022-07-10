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
  const { data: dashboardData, status } = useDashboardData();
  const mediaQuery = useMediaQueryContext();

  return (
    <Layout title="Dashboard" appendGenericTitle>
      <PageContainer>
        <Box mb={4}>
          <Typography variant="h1" className={classes.title}>
            Dashboard
          </Typography>
        </Box>

        <Box>
          {dashboardData ? (
            <>
              <Dashboard dashboardData={dashboardData} />

              <div className="row mt-5">
                <div
                  className={cx("col-12", classes.refreshDate, {
                    "text-center": mediaQuery.smallScreen
                  })}
                >
                  Last updated: <FormattedDate value={dashboardData.now.date} /> <FormattedTime value={dashboardData.now.date} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <CircularProgress size={80} />
            </div>
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
