import Layout from "../components/layout/Layout";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ReactNode } from "react";
import PageContainer from "@src/components/shared/PageContainer";
import { useDashboardData } from "@src/queries/useDashboardData";
import { Dashboard } from "@src/components/dashboard/Dashboard";
import { FormattedDate, FormattedTime } from "react-intl";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";

type Props = {
  children?: ReactNode;
};

const IndexPage: React.FunctionComponent<Props> = ({}) => {
  const { data: dashboardData, isLoading } = useDashboardData();
  const theme = useTheme();

  return (
    <Layout>
      <NextSeo title="Dashboard" />

      <PageContainer>
        <Title value="Dashboard" />

        <div>
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
        </div>
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
