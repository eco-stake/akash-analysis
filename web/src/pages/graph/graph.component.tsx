import { Box, Typography } from "@mui/material";
import { LineCanvasProps, ResponsiveLineCanvas } from "@nivo/line";
import { useMediaQueryContext } from "@src/context/MediaQueryProvider";
import { GraphResponse, Snapshots, SnapshotValue } from "@src/types";
import { SelectedRange } from "@src/utils/constants";
import { nFormatter, roundDecimal } from "@src/utils/mathHelpers";
import { FormattedDate, useIntl } from "react-intl";
import { useStyles } from "./Graph.styles";

interface IGraphProps {
  rangedData: SnapshotValue[];
  snapshotMetadata: {
    unitFn: (number: any) => number;
  };
  snapshotData: GraphResponse;
  snapshot: Snapshots | "NOT_FOUND";
  selectedRange: SelectedRange;
}

const Graph: React.FunctionComponent<IGraphProps> = ({ rangedData, snapshotMetadata, snapshotData, snapshot, selectedRange }) => {
  const intl = useIntl();
  const theme = getTheme();
  const mediaQuery = useMediaQueryContext();
  const { classes } = useStyles();

  const minValue = rangedData && snapshotMetadata.unitFn(rangedData.map(x => x.value).reduce((a, b) => (a < b ? a : b)));
  const maxValue = snapshotData && snapshotMetadata.unitFn(rangedData.map(x => x.value).reduce((a, b) => (a > b ? a : b)));
  const graphData = snapshotData
    ? [
        {
          id: snapshot,
          color: "rgb(1,0,0)",
          data: rangedData.map(snapshot => ({
            x: snapshot.date,
            y: roundDecimal(snapshotMetadata.unitFn(snapshot.value))
          }))
        }
      ]
    : null;
  const graphMetadata = getGraphMetadataPerRange(selectedRange);

  return (
    <div className={classes.graphContainer}>
      <Box className={classes.watermark}>
        <Typography variant="caption">akashlytics.com</Typography>
      </Box>
      <ResponsiveLineCanvas
        theme={theme}
        data={graphData}
        curve="linear"
        margin={{ top: 30, right: 35, bottom: 50, left: 45 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: minValue * 0.98,
          max: maxValue * 1.02
        }}
        yFormat=" >-1d"
        // @ts-ignore will be fixed in 0.69.1
        axisBottom={{
          tickRotation: mediaQuery.mobileView ? 45 : 0,
          format: dateStr => intl.formatDate(dateStr, { day: "numeric", month: "short", timeZone: "utc" }),
          tickValues: getTickValues(rangedData, graphMetadata.xModulo)
        }}
        // @ts-ignore will be fixed in 0.69.1
        axisLeft={{
          format: val => nFormatter(val, 2)
        }}
        axisTop={null}
        axisRight={null}
        colors={"#e41e13"}
        pointSize={graphMetadata.size}
        pointBorderColor="#e41e13"
        pointColor={"#ffffff"}
        pointBorderWidth={graphMetadata.border}
        isInteractive={true}
        tooltip={props => (
          <div className={classes.graphTooltip}>
            <Typography variant="caption">
              <FormattedDate value={new Date(props.point.data.x)} day="numeric" month="long" timeZone="UTC" />
            </Typography>
            <Box>{nFormatter(props.point.data.y as number, 2)}</Box>
          </div>
        )}
        enableGridX={false}
        enableCrosshair={true}
      />
    </div>
  );
};

const getTheme = () => {
  return {
    textColor: "#FFFFFF",
    fontSize: 14,
    axis: {
      domain: {
        line: {
          stroke: "#FFFFFF",
          strokeWidth: 1
        }
      },
      ticks: {
        line: {
          stroke: "#FFFFFF",
          strokeWidth: 1
        }
      }
    },
    grid: {
      line: {
        stroke: "#FFFFFF",
        strokeWidth: 0.5
      }
    }
  };
};

const getGraphMetadataPerRange = (range: SelectedRange): { size: number; border: number; xModulo: number } => {
  switch (range) {
    case SelectedRange["7D"]:
      return {
        size: 10,
        border: 3,
        xModulo: 1
      };
    case SelectedRange["1M"]:
      return {
        size: 6,
        border: 2,
        xModulo: 3
      };
    case SelectedRange["ALL"]:
      return {
        size: 3,
        border: 1,
        xModulo: 5
      };

    default:
      return {
        size: 10,
        border: 3,
        xModulo: 1
      };
  }
};

const getTickValues = (rangedData: SnapshotValue[], modulo: number) => {
  const values = rangedData.reverse().filter((data, i) => i % modulo === 0);
  const maxLength = 10;

  if (values.length > maxLength) {
    const mod = Math.round(rangedData.length / maxLength);
    return rangedData.filter((data, i) => i % mod === 0).map(data => data.date);
  } else {
    return values.map(data => data.date);
  }
};

export default Graph;
