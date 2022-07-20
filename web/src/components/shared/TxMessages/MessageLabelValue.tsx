import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(theme => ({
  blockInfoRow: {
    display: "flex",
    marginBottom: "1rem",
    lineHeight: "1.25rem",
    "&:last-child": {
      marginBottom: 0
    }
  },
  label: {
    fontWeight: "bold",
    width: "15rem",
    flexShrink: 0
  },
  value: {
    wordBreak: "break-all",
    overflowWrap: "anywhere",
    flexGrow: 1
  }
}));

type MessageLabelValueProps = {
  label: string;
  value: any;
};
export const MessageLabelValue: React.FunctionComponent<MessageLabelValueProps> = ({ label, value }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.blockInfoRow}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>{value}</div>
    </div>
  );
};
