import { GetStaticProps, GetStaticPaths } from "next";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import Error from "@src/components/shared/Error";
import { chartPaths, useChartInfo } from "@src/utils/paths";
import { TimeRange } from "@src/components/shared/TimeRange";
import dynamic from "next/dynamic";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/router";
import { cx } from "@emotion/css";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import { IGraphDataPoint } from "@src/types";
import { useState } from "react";

const LineChart = dynamic(() => import("../../components/shared/LineChart"), {
  ssr: false
});

type Props = {
  chartId?: string;
  graphData: IGraphDataPoint[];
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

const StaticPropsDetail = ({ chartId, graphData, errors }: Props) => {
  if (errors) return <Error errors={errors} />;

  const [selectedRange, setSelectedRange] = useState(7);
  const { classes } = useStyles();
  const router = useRouter();
  const { title, showDecimals } = useChartInfo(chartId);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  let slicedGraphData = graphData;
  if (graphData && selectedRange) {
    slicedGraphData = graphData.slice(Math.max(graphData.length - selectedRange, 0));
  }

  const onBackClick = () => {
    router.back();
  };

  return (
    <Layout title={`${title} Chart`} appendGenericTitle>
      <PageContainer>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={onBackClick}>
              <ArrowBackIosNewIcon fontSize={matches ? "small" : "medium"} />
            </IconButton>
            <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
              {title}
            </Typography>
          </Box>

          <div>
            <TimeRange onRangeChange={newRange => setSelectedRange(newRange)} />
          </div>
        </Box>

        <Paper sx={{ height: matches ? "300px" : "400px", padding: 2 }}>
          <LineChart showDecimals={showDecimals} data={slicedGraphData.map(data => ({ x: data.date, y: data.value }))} />
        </Paper>
      </PageContainer>
    </Layout>
  );
};

export default StaticPropsDetail;

// export const getStaticPaths: GetStaticPaths = async () => {
//   // Get the paths we want to pre-render based on users
//   const paths = chartPaths.map(chartId => ({
//     params: { slug: chartId }
//   }));

//   // We'll pre-render only these paths at build time.
//   // { fallback: false } means other routes should 404.
//   return { paths, fallback: false };
// };

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries.
// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   try {
//     const id = params?.slug;
//     // TODO get the chart data for current path
//     const chartId = chartPaths.find(data => data === id);
//     // By returning { props: item }, the StaticPropsDetail component
//     // will receive `item` as a prop at build time
//     return { props: { chartId } };
//   } catch (err: any) {
//     return { props: { errors: err.message } };
//   }
// };

export async function getServerSideProps({ params }) {
  const graphData = await fetchGraphData(params?.slug);

  return {
    props: {
      chartId: params?.slug,
      graphData
    }
  };
}

async function fetchGraphData(graphId) {
  console.log("Fetching graph data for " + graphId);
  const response = await fetch(`${BASE_API_URL}/graph/${graphId}`);
  const data = await response.json();
  return data;
}
