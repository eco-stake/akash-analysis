import Typography from "@mui/material/Typography";
import { ReactNode } from "react";
import { GridItem } from "../GridItem";
import { makeStyles } from "tss-react/mui";
import dynamic from "next/dynamic";
import ViewPanel from "./ViewPanel";
import { Datum } from "@nivo/line";

const LineChart = dynamic(() => import("./LineChart"), {
  ssr: false
});

type Props = {
  title: string;
  height?: string;
  graphData?: Datum[];
  range?: number;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "1.2rem",
    lineHeight: "1.2rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(1)
  }
}));

export const LineChartCard: React.FunctionComponent<Props> = ({ children, graphData, range, title, height = "240px" }) => {
  const { classes } = useStyles();

  let slicedGraphData = graphData;
  if (graphData && range) {
    slicedGraphData = graphData.slice(Math.max(graphData.length - range, 0));
  }

  return (
    <GridItem height={height} style={{ overflow: "unset" }}>
      <Typography variant="h4" className={classes.title}>
        {title}
      </Typography>

      <ViewPanel isSameAsParent>
        <LineChart data={slicedGraphData} />
      </ViewPanel>
    </GridItem>
  );
};

export default LineChartCard;
