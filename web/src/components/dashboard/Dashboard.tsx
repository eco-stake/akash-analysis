import React from "react";
import { useMediaQueryContext } from "@src/context/MediaQueryProvider";
import { FormattedNumber } from "react-intl";
import { DashboardData, SnapshotsUrlParam } from "@src/types";
import Paper from "@mui/material/Paper";
import { makeStyles } from "tss-react/mui";
import Box from "@mui/material/Box";
import { DiffPercentageChip } from "../shared/DiffPercentageChip";
import Typography from "@mui/material/Typography";
import { StatsCard } from "./StatsCard";
import { percIncrease, uaktToAKT } from "@src/utils/mathHelpers";
import { HumanReadableBytes } from "../shared/HumanReadableBytes";
import Grid from "@mui/material/Grid";
import { cx } from "@emotion/css";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Button from "@mui/material/Button";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { BlockRow } from "../shared/BlockRow";
import { GradientText } from "../shared/GradientText";
import { TransactionRow } from "../shared/TransactionRow";
import { bytesToShrink } from "@src/utils/unitUtils";

interface IDashboardProps {
  dashboardData: DashboardData;
}

const useStyles = makeStyles()(theme => ({
  title: {
    fontWeight: "500",
    fontSize: "1.5rem",
    textAlign: "left"
  },
  link: {
    textDecoration: "underline"
  },
  liveChip: {
    "&&": {
      fontWeight: "normal",
      marginLeft: "1rem",
      fontSize: ".8rem",
      height: "20px"
    }
  },
  liveChipIcon: {
    animation: "$flash 1.5s infinite ease-in-out"
  },
  "@keyframes flash": {
    "0%": {
      color: "#00945c" // TODO Theme
    },
    "50%": {
      color: "#00d081"
    },
    "100%": {
      color: "#00945c"
    }
  },
  priceDataContainer: {
    padding: "1rem",
    marginBottom: "1.5rem",
    borderRadius: ".5rem",
    display: "flex",
    alignItems: "center",
    fontSize: "1rem",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "baseline"
    }
  },
  priceData: {
    marginLeft: "1rem",
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      marginLeft: "0"
    }
  },
  priceDataValue: {
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    marginLeft: ".5rem"
  }
}));

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({ dashboardData }) => {
  const { classes } = useStyles();
  const mediaQuery = useMediaQueryContext();
  const memoryDiff = bytesToShrink(dashboardData.now.activeMemory - dashboardData.compare.activeMemory);
  const storageDiff = bytesToShrink(dashboardData.now.activeStorage - dashboardData.compare.activeStorage);

  return (
    <>
      {dashboardData.marketData && (
        <Paper className={classes.priceDataContainer} elevation={2}>
          <div className={classes.priceData}>
            AKT{" "}
            <div className={classes.priceDataValue}>
              <FormattedNumber style="currency" currency="USD" value={dashboardData.marketData.price} />
              <Box display="flex" alignItems="center" fontSize=".8rem" fontWeight={300}>
                <DiffPercentageChip value={dashboardData.marketData.priceChangePercentage24 / 100} />
                <Box component="span" ml=".5rem">
                  (24h)
                </Box>
              </Box>
            </div>
          </div>
          <div className={classes.priceData}>
            <span>Market cap</span>{" "}
            <span className={classes.priceDataValue}>
              <FormattedNumber style="currency" currency="USD" value={dashboardData.marketData.marketCap} minimumFractionDigits={0} maximumFractionDigits={0} />
            </span>
          </div>
          <div className={classes.priceData}>
            <span>Volume (24h)</span>{" "}
            <span className={classes.priceDataValue}>
              <FormattedNumber style="currency" currency="USD" value={dashboardData.marketData.volume} minimumFractionDigits={0} maximumFractionDigits={0} />
            </span>
          </div>
          <div className={classes.priceData}>
            <span>Rank</span> <span className={classes.priceDataValue}>{dashboardData.marketData.marketCapRank}</span>
          </div>
        </Paper>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h3" className={cx(classes.title, { "text-center": mediaQuery.smallScreen })}>
            <GradientText>Network summary</GradientText>
          </Typography>
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={
              <>
                <FormattedNumber value={uaktToAKT(dashboardData.now.dailyUAktSpent)} maximumFractionDigits={2} /> AKT
              </>
            }
            text="Daily AKT spent"
            tooltip="Last 24h"
            graphPath={`/graph/${SnapshotsUrlParam.dailyAktSpent}`}
            diffNumber={uaktToAKT(dashboardData.now.dailyUAktSpent - dashboardData.compare.dailyUAktSpent)}
            diffPercent={percIncrease(dashboardData.compare.dailyUAktSpent, dashboardData.now.dailyUAktSpent)}
          />
        </Grid>
        <Grid item xs={12} lg={3}>
          <StatsCard
            number={
              <>
                <FormattedNumber value={uaktToAKT(dashboardData.now.totalUAktSpent)} maximumFractionDigits={2} /> AKT
              </>
            }
            text="Total spent on decloud"
            tooltip="This is the total amount akt spent to rent computing power on the akash network since the beginning of the network. (March 2021)"
            graphPath={`/graph/${SnapshotsUrlParam.totalAKTSpent}`}
            diffNumber={uaktToAKT(dashboardData.now.totalUAktSpent - dashboardData.compare.totalUAktSpent)}
            diffPercent={percIncrease(dashboardData.compare.totalUAktSpent, dashboardData.now.totalUAktSpent)}
          />
        </Grid>
        <Grid item xs={12} lg={3}>
          <StatsCard
            number={<FormattedNumber value={dashboardData.now.totalLeaseCount - dashboardData.compare.totalLeaseCount} />}
            text="Daily new leases"
            tooltip="Last 24h"
            graphPath={`/graph/${SnapshotsUrlParam.dailyDeploymentCount}`}
            diffNumber={dashboardData.now.dailyLeaseCount - dashboardData.compare.dailyLeaseCount}
            diffPercent={percIncrease(dashboardData.compare.dailyLeaseCount, dashboardData.now.dailyLeaseCount)}
          />
        </Grid>
        <Grid item xs={12} lg={3}>
          <StatsCard
            number={<FormattedNumber value={dashboardData.now.totalLeaseCount} />}
            text="Total lease count"
            tooltip="The total lease count consists of all deployments that were live at some point and that someone paid for. This includes deployments that were deployed for testing or that were meant to be only temporary."
            graphPath={`/graph/${SnapshotsUrlParam.allTimeDeploymentCount}`}
            diffNumber={dashboardData.now.totalLeaseCount - dashboardData.compare.totalLeaseCount}
            diffPercent={percIncrease(dashboardData.compare.totalLeaseCount, dashboardData.now.totalLeaseCount)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h3" className={cx(classes.title, { "text-center": mediaQuery.smallScreen })}>
            <GradientText>Total resources currently leased</GradientText>
          </Typography>
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={<FormattedNumber value={dashboardData.now.activeLeaseCount} />}
            text="Active leases"
            tooltip={
              <>
                <div>This is the number of leases currently active on the network. A deployment can be anything. </div>
                <div>For example: a simple website to a blockchain node or a video game server.</div>
              </>
            }
            graphPath={`/graph/${SnapshotsUrlParam.activeDeployment}`}
            diffNumber={dashboardData.now.activeLeaseCount - dashboardData.compare.activeLeaseCount}
            diffPercent={percIncrease(dashboardData.compare.activeLeaseCount, dashboardData.now.activeLeaseCount)}
          />
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={
              <>
                <FormattedNumber value={dashboardData.now.activeCPU / 1000} maximumFractionDigits={2} />
                <small style={{ paddingLeft: "5px", fontWeight: "bold", fontSize: 16 }}>vCPUs</small>
              </>
            }
            text="Compute"
            graphPath={`/graph/${SnapshotsUrlParam.compute}`}
            diffNumber={(dashboardData.now.activeCPU - dashboardData.compare.activeCPU) / 1000}
            diffPercent={percIncrease(dashboardData.compare.activeCPU, dashboardData.now.activeCPU)}
          />
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={<HumanReadableBytes value={dashboardData.now.activeMemory} />}
            text="Memory"
            graphPath={`/graph/${SnapshotsUrlParam.memory}`}
            diffNumberUnit={memoryDiff.unit}
            diffNumber={memoryDiff.value}
            diffPercent={percIncrease(dashboardData.compare.activeMemory, dashboardData.now.activeMemory)}
          />
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={<HumanReadableBytes value={dashboardData.now.activeStorage} />}
            text="Storage"
            graphPath={`/graph/${SnapshotsUrlParam.storage}`}
            diffNumberUnit={storageDiff.unit}
            diffNumber={storageDiff.value}
            diffPercent={percIncrease(dashboardData.compare.activeStorage, dashboardData.now.activeStorage)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h3" className={cx(classes.title, { "text-center": mediaQuery.smallScreen })}>
            <GradientText>Network Capacity</GradientText>
          </Typography>
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={<FormattedNumber value={dashboardData.networkCapacity.activeProviderCount} />}
            text="Active providers"
            tooltip={
              <>
                <div>This is the number of providers currently active on the network.</div>
              </>
            }
          />
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard
            number={
              <>
                <FormattedNumber value={dashboardData.networkCapacity.totalCPU / 1000} maximumFractionDigits={0} />
                <small style={{ paddingLeft: "5-px", fontWeight: "bold", fontSize: 16 }}>vCPUs</small>
              </>
            }
            text="Compute"
          />
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard number={<HumanReadableBytes value={dashboardData.networkCapacity.totalMemory} />} text="Memory" />
        </Grid>

        <Grid item xs={12} lg={3}>
          <StatsCard number={<HumanReadableBytes value={dashboardData.networkCapacity.totalStorage} />} text="Storage" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: "1rem", borderRadius: ".5rem" }} elevation={2}>
            <Typography variant="h3" sx={{ mb: 0, border: "0 !important" }} className={cx(classes.title, { "text-center": mediaQuery.smallScreen })}>
              <GradientText>Blocks</GradientText>
            </Typography>

            <TableContainer sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="10%">Height</TableCell>
                    <TableCell align="center" width="45%">
                      Proposer
                    </TableCell>
                    <TableCell align="center" width="20%">
                      Txs
                    </TableCell>
                    <TableCell align="center" width="25%">
                      Time
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dashboardData.latestBlocks.map(block => (
                    <BlockRow key={block.height} block={block} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Link href={UrlService.blocks()} passHref>
              <Button variant="outlined" color="secondary" fullWidth>
                Show more
              </Button>
            </Link>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: "1rem", borderRadius: ".5rem" }} elevation={2}>
            <Typography variant="h3" sx={{ mb: 0, border: "0 !important" }} className={cx(classes.title, { "text-center": mediaQuery.smallScreen })}>
              <GradientText>Transactions</GradientText>
            </Typography>

            <TableContainer sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="35%">Tx Hash</TableCell>
                    <TableCell align="center" width="35%">
                      Type
                    </TableCell>
                    <TableCell align="center" width="15%">
                      Height
                    </TableCell>
                    <TableCell align="center" width="15%">
                      Time
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dashboardData.latestTransactions.map(tx => (
                    <TransactionRow key={tx.hash} transaction={tx} isSimple blockHeight={tx.height} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Link href={UrlService.transactions()} passHref>
              <Button variant="outlined" color="secondary" fullWidth>
                Show more
              </Button>
            </Link>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};
