import Link from "next/link";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";
import { GridItem } from "../GridItem";
import { makeStyles } from "tss-react/mui";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { cx } from "@emotion/css";
import { FormattedNumber } from "react-intl";

type Props = {
  title: string;
  value: any;
  chartLink?: string;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "1rem",
    marginBottom: theme.spacing(1),
    maxWidth: "100%"
  },
  value: {
    fontSize: "1.5rem",
    lineHeight: "1.5rem",
    fontWeight: "bold"
  },
  chartLinkContainer: {
    position: "absolute",
    bottom: theme.spacing(1),
    right: theme.spacing(1)
  },
  chartLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: ".8rem"
  }
}));

export const SimpleCard: React.FunctionComponent<Props> = ({ children, title, value, chartLink }) => {
  const { classes } = useStyles();

  return (
    <GridItem>
      <Typography variant="body1" className={cx(classes.title, "text-truncate")}>
        {title}
      </Typography>

      <Typography variant="h3" className={classes.value}>
        {typeof value === "number" ? <FormattedNumber maximumFractionDigits={2} value={value} /> : <>{value}</>}
      </Typography>

      {chartLink && (
        <div className={classes.chartLinkContainer}>
          <Link href={chartLink}>
            <a className={classes.chartLink}>
              <ShowChartIcon fontSize="small" />
              &nbsp;Chart
            </a>
          </Link>
        </div>
      )}
    </GridItem>
  );
};

export default SimpleCard;
