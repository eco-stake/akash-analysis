import Typography from "@mui/material/Typography";
import { ReactNode } from "react";
import { GridItem } from "../GridItem";
import { makeStyles } from "tss-react/mui";
import { FormattedNumber } from "react-intl";

type Props = {
  title: string;
  tokenAmount: number;
  tokenValue: number;
  tokenName: string;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "1rem",
    marginBottom: theme.spacing(1)
  },
  subTitle: {
    marginBottom: theme.spacing(0.5)
  }
}));

export const VolumeCard: React.FunctionComponent<Props> = ({ children, title, tokenName, tokenAmount, tokenValue }) => {
  const { classes } = useStyles();

  return (
    <GridItem height="100px">
      <Typography variant="body1" className={classes.title}>
        {title}
      </Typography>

      <Typography variant="body2" className={classes.subTitle}>
        <strong>
          <FormattedNumber value={tokenAmount} style="decimal" minimumFractionDigits={0} maximumFractionDigits={0} />
        </strong>{" "}
        {tokenName}
      </Typography>

      <Typography variant="body2" className={classes.subTitle}>
        <FormattedNumber value={tokenValue} style="currency" currency="USD" minimumFractionDigits={0} maximumFractionDigits={0} />
      </Typography>
    </GridItem>
  );
};

export default VolumeCard;
