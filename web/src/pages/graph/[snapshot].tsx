import React, { useState } from "react";
import { FormattedNumber } from "react-intl";
import { SelectedRange } from "@src/utils/constants";
import { urlParamToSnapshot } from "@src/utils/snapshotsUrlHelpers";
import { ISnapshotMetadata, Snapshots, SnapshotsUrlParam } from "@src/types";
import { useGraphSnapshot } from "@src/queries/useGrapsQuery";
import { percIncrease, uaktToAKT } from "@src/utils/mathHelpers";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { Box, Button, ButtonGroup, CircularProgress, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { DiffPercentageChip } from "@src/components/shared/DiffPercentageChip";
import { DiffNumber } from "@src/components/shared/DiffNumber";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import dynamic from "next/dynamic";
import { makeStyles } from "tss-react/mui";
import { GradientText } from "@src/components/shared/GradientText";
import { bytesToShrink } from "@src/utils/unitUtils";

const Graph = dynamic(() => import("../../components/graph/graph.component"), {
  ssr: false
});

export const useStyles = makeStyles()(theme => ({
  root: {
    maxWidth: "800px",
    margin: "auto"
  },
  loading: { textAlign: "center", marginTop: "4rem", marginBottom: "1rem" },
  title: {
    fontSize: "2rem",
    fontWeight: "normal",
    [theme.breakpoints.down("xs")]: {
      textAlign: "center"
    }
  },
  subTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
    [theme.breakpoints.down("xs")]: {
      flexWrap: "wrap"
    }
  },
  subTitleValues: {
    [theme.breakpoints.down("xs")]: {
      flexBasis: "100%",
      marginBottom: "1rem"
    }
  },
  titleValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center"
    }
  },
  diffNumber: {
    fontSize: ".7rem",
    fontWeight: "lighter"
  },
  graphRangeSelect: {
    [theme.breakpoints.down("xs")]: {
      margin: "0 auto"
    }
  }
}));

export interface IGraphProps {
  snapshot: string;
}

export const GraphPage: React.FunctionComponent<IGraphProps> = ({ snapshot: snapshotUrlParam }) => {
  const [selectedRange, setSelectedRange] = useState(SelectedRange["7D"]);
  const snapshot = urlParamToSnapshot(snapshotUrlParam as SnapshotsUrlParam);
  const { data: snapshotData, status } = useGraphSnapshot(snapshot);
  const { classes } = useStyles();
  const title = getTitle(snapshot as Snapshots);
  const snapshotMetadata = snapshotData && getSnapshotMetadata(snapshot as Snapshots);
  const rangedData = snapshotData && snapshotData.snapshots.slice(snapshotData.snapshots.length - selectedRange, snapshotData.snapshots.length);
  const metric = snapshotData && snapshotMetadata.unitFn(snapshotData.currentValue);
  const metricDiff = snapshotData && snapshotMetadata.unitFn(snapshotData.currentValue - snapshotData.compareValue);

  return (
    <Layout title={title} appendGenericTitle>
      <PageContainer>
        {/* <Helmet title={title} /> */}

        <div className={classes.root}>
          <Box sx={{ marginBottom: "2rem" }}>
            <Link href={UrlService.dashboard()} passHref>
              <Button startIcon={<ArrowBackIcon />}>Back</Button>
            </Link>
          </Box>

          <Box sx={{ marginBottom: 1 }}>
            <Typography variant="h1" className={classes.title}>
              <GradientText>{title}</GradientText>
            </Typography>
          </Box>

          {!snapshotData && status === "loading" && (
            <div className={classes.loading}>
              <CircularProgress size={80} color="secondary" />
            </div>
          )}

          {snapshotData && (
            <>
              <Box className={classes.subTitle}>
                <Box className={classes.subTitleValues}>
                  <Typography variant="h3" className={classes.titleValue}>
                    <FormattedNumber value={metric.modifiedValue || metric.value} maximumFractionDigits={2} />
                    &nbsp;{metric.unit}&nbsp;
                    <DiffPercentageChip value={percIncrease(snapshotData.compareValue, snapshotData.currentValue)} size="medium" />
                    &nbsp;
                    <DiffNumber value={metricDiff.modifiedValue || metricDiff.value} unit={metricDiff.unit} className={classes.diffNumber} />
                  </Typography>
                </Box>

                <ButtonGroup size="small" aria-label="Graph range select" className={classes.graphRangeSelect}>
                  <Button
                    variant={selectedRange === SelectedRange["7D"] ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setSelectedRange(SelectedRange["7D"])}
                  >
                    7D
                  </Button>
                  <Button
                    variant={selectedRange === SelectedRange["1M"] ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setSelectedRange(SelectedRange["1M"])}
                  >
                    1M
                  </Button>
                  <Button
                    variant={selectedRange === SelectedRange["ALL"] ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setSelectedRange(SelectedRange["ALL"])}
                  >
                    ALL
                  </Button>
                </ButtonGroup>
              </Box>

              <Graph
                rangedData={rangedData}
                snapshotMetadata={snapshotMetadata}
                snapshot={snapshot}
                snapshotData={snapshotData}
                selectedRange={selectedRange}
              />
            </>
          )}
        </div>
      </PageContainer>
    </Layout>
  );
};

const getSnapshotMetadata = (snapshot: Snapshots): { unitFn: (number) => ISnapshotMetadata, legend?: string } => {
  switch (snapshot) {
    case Snapshots.dailyUAktSpent:
    case Snapshots.totalUAktSpent:
      return { unitFn: x => ({ value: uaktToAKT(x) }) };
    case Snapshots.activeCPU:
      return {
        unitFn: x => ({ value: x / 1000 })
      };
    case Snapshots.activeMemory:
    case Snapshots.activeStorage:
      return {
        unitFn: x => {
          const _ = bytesToShrink(x);
          return {
            value: x / 1000 / 1000 / 1000,
            unit: _.unit,
            modifiedValue: _.value
          };
        },
        legend: "GB"
      };

    default:
      return {
        unitFn: x => ({ value: x })
      };
  }
};

const getTitle = (snapshot: Snapshots): string => {
  switch (snapshot) {
    case Snapshots.activeLeaseCount:
      return "Active leases";
    case Snapshots.totalUAktSpent:
      return "Total AKT spent";
    case Snapshots.totalLeaseCount:
      return "All-time lease count";
    case Snapshots.activeCPU:
      return "vCPUs leased";
    case Snapshots.activeMemory:
      return "Memory leased";
    case Snapshots.activeStorage:
      return "Disk storage leased";
    case Snapshots.dailyUAktSpent:
      return "Daily AKT spent";
    case Snapshots.dailyLeaseCount:
      return "Daily new leases";

    default:
      return "Graph not found.";
  }
};

export async function getServerSideProps({ params }) {
  return {
    props: {
      snapshot: params?.snapshot
    }
  };
}

export default GraphPage;
