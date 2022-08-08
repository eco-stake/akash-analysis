import { Box } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(theme => ({
  infoRow: {
    display: "flex",
    marginBottom: "1rem",
    "&:last-child": {
      marginBottom: 0
    },
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start"
    }
  },
  label: {
    fontWeight: "bold",
    flexShrink: 0,
    wordBreak: "break-all",
    color: theme.palette.grey[600]
  },
  value: {
    wordBreak: "break-all",
    overflowWrap: "anywhere",
    flexGrow: 1
  }
}));

type LabelValueProps = {
  label: any;
  value: any;
  labelWidth?: string | number;
};
export const LabelValue: React.FunctionComponent<LabelValueProps> = ({ label, value, labelWidth = "15rem" }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.infoRow}>
      <Box className={classes.label} sx={{ width: labelWidth }}>
        {label}
      </Box>
      <div className={classes.value}>{value}</div>
    </div>
  );
};
