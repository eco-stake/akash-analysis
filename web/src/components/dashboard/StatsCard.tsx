import React from "react";
import HelpIcon from "@mui/icons-material/Help";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useMediaQueryContext } from "@src/context/MediaQueryProvider";
import { makeStyles } from "tss-react/mui";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { DiffNumber } from "../shared/DiffNumber";
import { DiffPercentageChip } from "../shared/DiffPercentageChip";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";
import { cx } from "@emotion/css";
import { customColors } from "@src/utils/colors";

interface IStatsCardProps {
  number: React.ReactNode;
  text: string;
  diffNumber?: number;
  diffNumberUnit?: string;
  diffPercent?: number;
  tooltip?: string | React.ReactNode;
  graphPath?: string;
  actionButton?: string | React.ReactNode;
}

const useStyles = makeStyles()(theme => ({
  root: {
    position: "relative",
    height: "100%",
    flexGrow: 1,
    borderRadius: ".5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  rootSmall: {
    height: "auto"
  },
  number: {
    fontSize: "1.5rem",
    fontWeight: "bold"
  },
  cardHeader: { width: "100%", padding: "1rem", textAlign: "center" },
  title: {
    fontSize: "1rem",
    fontWeight: 300,
    margin: 0,
    color: theme.palette.mode === "dark" ? theme.palette.grey[400] : theme.palette.grey[700],
    paddingBottom: "3px"
  },
  extraText: {
    fontWeight: "bold",
    fontSize: 12,
    display: "block"
  },
  cardContent: {
    padding: "0 1rem .5rem",
    textAlign: "center",
    flexGrow: 1
  },
  tooltip: {
    fontSize: "1.1rem",
    margin: "8px",
    position: "absolute",
    top: 0,
    right: 0
  },
  subHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: ".7rem"
  },
  actionIcon: {
    fontSize: "1rem"
  },
  actionButtonLabel: {
    fontSize: ".7rem",
    fontStyle: "italic",
    color: customColors.link
  }
}));

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    boxShadow: theme.shadows[1],
    fontSize: "1rem"
  }
}));

export const StatsCard: React.FunctionComponent<IStatsCardProps> = ({
  number,
  text,
  tooltip,
  actionButton,
  graphPath,
  diffNumber,
  diffPercent,
  diffNumberUnit
}) => {
  const { classes } = useStyles();
  const mediaQuery = useMediaQueryContext();

  return (
    <Card className={cx(classes.root, { [classes.rootSmall]: mediaQuery.smallScreen })} elevation={2}>
      <CardHeader
        classes={{ title: classes.number, root: classes.cardHeader, subheader: classes.subHeader }}
        title={number}
        subheader={
          diffNumber && (
            <>
              <DiffNumber value={diffNumber} unit={diffNumberUnit} />
              &nbsp;
              <DiffPercentageChip value={diffPercent} />
            </>
          )
        }
      />
      <div className={classes.cardContent}>
        <p className={classes.title}>{text}</p>
      </div>

      <CardActions>
        {tooltip && (
          <CustomTooltip arrow enterTouchDelay={0} leaveTouchDelay={10000} title={tooltip}>
            <HelpIcon className={classes.tooltip} />
          </CustomTooltip>
        )}
        {graphPath && (
          <Link href={graphPath} passHref>
            <Button aria-label="graph" size="small" classes={{ text: classes.actionButtonLabel }}>
              <Box component="span" marginRight=".5rem">
                Graph
              </Box>
              <TimelineIcon className={classes.actionIcon} />
            </Button>
          </Link>
        )}

        {actionButton}
      </CardActions>
    </Card>
  );
};
