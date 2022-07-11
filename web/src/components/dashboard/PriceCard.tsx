import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ReactNode, useState } from "react";
import { GridItem } from "../GridItem";
import { makeStyles } from "tss-react/mui";
import dynamic from "next/dynamic";
import { FormattedNumber } from "react-intl";

type HistoricalPriceData = {
  date: Date;
  price: number;
}

const CardChart = dynamic(() => import("./CardChart"), {
  ssr: false
});

type Props = {
  label: string;
  price: number;
  graphData: HistoricalPriceData[],
  color: string;
  logo: ReactNode;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "1.5rem",
    lineHeight: "1.5rem",
    fontWeight: "bold"
  },
  logo: { position: "absolute", top: theme.spacing(1), right: theme.spacing(1), height: "30px", width: "30px" }
}));

export const PriceCard: React.FunctionComponent<Props> = ({ children, price, graphData, color, logo, label }) => {
  const { classes } = useStyles();
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  return (
    <GridItem height="100px">
      <Typography variant="h3" className={classes.title}>
        <FormattedNumber value={isHovering && hoveredPoint ? hoveredPoint.data.y : price} style="currency" currency="USD" />
      </Typography>

      <div className={classes.logo}>
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>{logo}</Box>
      </div>

      <Typography variant="caption">{label}</Typography>

      <CardChart
        color={color}
        data={(graphData || []).map(({ date, price }) => ({ x: date, y: price }))}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={point => setHoveredPoint(point)}
      />
    </GridItem>
  );
};

export default PriceCard;
