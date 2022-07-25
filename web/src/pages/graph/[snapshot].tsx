import React, { useState } from "react";
import { FormattedNumber } from "react-intl";
import { useStyles } from "./Graph.styles";
import clsx from "clsx";
import { SelectedRange } from "@src/utils/constants";
import { urlParamToSnapshot } from "@src/utils/snapshotsUrlHelpers";
import { GraphResponse, Snapshots, SnapshotsUrlParam } from "@src/types";
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

const Graph = dynamic(() => import("./graph.component"), {
  ssr: false
});

export interface IGraphProps {
  snapshot: string;
}

export const GraphPage: React.FunctionComponent<IGraphProps> = ({ snapshot: snapshotUrlParam }) => {
  const [selectedRange, setSelectedRange] = useState(SelectedRange["7D"]);
  const snapshot = urlParamToSnapshot(snapshotUrlParam as SnapshotsUrlParam);
  const { data: snapshotData, status } = useGraphSnapshot(snapshot);
  const { classes } = useStyles();
  const title = getTitle(snapshot as Snapshots);
  const snapshotMetadata = snapshotData && getSnapshotMetadata(snapshot as Snapshots, snapshotData);
  const rangedData = snapshotData && snapshotData.snapshots.slice(snapshotData.snapshots.length - selectedRange, snapshotData.snapshots.length);

  return (
    <Layout title="Proposals" appendGenericTitle>
      <PageContainer>
        {/* <Helmet title={title} /> */}

        <div>
          <Link href={UrlService.dashboard()} passHref>
            <Button startIcon={<ArrowBackIcon />}>Back</Button>
          </Link>
        </div>

        <div className={clsx("row mt-4 mb-2")}>
          <div className="col-xs-12">
            <Typography variant="h1" className={clsx(classes.title)}>
              {title}
            </Typography>
          </div>
        </div>

        {!snapshotData && status === "loading" && (
          <div className={classes.loading}>
            <CircularProgress size={80} />
          </div>
        )}

        {snapshotData && (
          <>
            <Box className={classes.subTitle}>
              <Box className={classes.subTitleValues}>
                <Typography variant="h3" className={classes.titleValue}>
                  <FormattedNumber value={snapshotMetadata.unitFn(snapshotData.currentValue)} maximumFractionDigits={2} />
                  &nbsp;
                  <DiffPercentageChip value={percIncrease(snapshotData.compareValue, snapshotData.currentValue)} size="medium" />
                  &nbsp;
                  <DiffNumber value={snapshotMetadata.unitFn(snapshotData.currentValue - snapshotData.compareValue)} className={classes.diffNumber} />
                </Typography>
              </Box>

              <ButtonGroup size="small" aria-label="Graph range select" className={classes.graphRangeSelect}>
                <Button variant={selectedRange === SelectedRange["7D"] ? "contained" : "outlined"} onClick={() => setSelectedRange(SelectedRange["7D"])}>
                  7D
                </Button>
                <Button variant={selectedRange === SelectedRange["1M"] ? "contained" : "outlined"} onClick={() => setSelectedRange(SelectedRange["1M"])}>
                  1M
                </Button>
                <Button variant={selectedRange === SelectedRange["ALL"] ? "contained" : "outlined"} onClick={() => setSelectedRange(SelectedRange["ALL"])}>
                  ALL
                </Button>
              </ButtonGroup>
            </Box>

            <Graph rangedData={rangedData} snapshotMetadata={snapshotMetadata} snapshot={snapshot} snapshotData={snapshotData} selectedRange={selectedRange} />
          </>
        )}
      </PageContainer>
    </Layout>
  );
};

const getSnapshotMetadata = (snapshot: Snapshots, snapshotData: GraphResponse): { unitFn: (number) => number } => {
  switch (snapshot) {
    case Snapshots.dailyUAktSpent:
    case Snapshots.totalUAktSpent:
      return { unitFn: x => uaktToAKT(x) };
    case Snapshots.activeCPU:
      return {
        unitFn: x => x / 1000
      };
    case Snapshots.activeMemory:
    case Snapshots.activeStorage:
      return {
        unitFn: x => x / 1024 / 1024 / 1024
      };

    default:
      return {
        unitFn: x => x
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
      return "Number of vCPUs currently leased";
    case Snapshots.activeMemory:
      return "Number of GB of memory currently leased";
    case Snapshots.activeStorage:
      return "Number of GB of disk currently leased";
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
