import { SelectedRange } from "@src/utils/constants";
import { ReactNode, useState } from "react";
import { makeStyles } from "tss-react/mui";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { cx } from "@emotion/css";

type Props = {
  children?: ReactNode;
  onRangeChange?: (selectedRange: SelectedRange) => void;
};

const useStyles = makeStyles()(theme => ({
  selected: {
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main,
    color: theme.palette.mode === "dark" ? theme.palette.primary.main : theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main
    }
  },
  notSelected: {
    color: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main,
    borderColor: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main,
    "&:hover": {
      borderColor: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main
    }
  },
  graphRangeSelect: {
    [theme.breakpoints.down("xs")]: {
      margin: "0 auto"
    }
  }
}));

export const TimeRange: React.FunctionComponent<Props> = ({ onRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState(SelectedRange["7D"]);
  const { classes } = useStyles();

  const _onRangeChange = (selectedRange: SelectedRange) => {
    setSelectedRange(selectedRange);

    if (onRangeChange) {
      onRangeChange(selectedRange);
    }
  };

  return (
    <ButtonGroup size="small" aria-label="Graph range select" className={classes.graphRangeSelect}>
      <Button
        variant={selectedRange === SelectedRange["7D"] ? "contained" : "outlined"}
        onClick={() => _onRangeChange(SelectedRange["7D"])}
        className={cx({ [classes.notSelected]: selectedRange !== SelectedRange["7D"], [classes.selected]: selectedRange === SelectedRange["7D"] })}
      >
        7D
      </Button>
      <Button
        variant={selectedRange === SelectedRange["1M"] ? "contained" : "outlined"}
        onClick={() => _onRangeChange(SelectedRange["1M"])}
        className={cx({ [classes.notSelected]: selectedRange !== SelectedRange["1M"], [classes.selected]: selectedRange === SelectedRange["1M"] })}
      >
        1M
      </Button>
      <Button
        variant={selectedRange === SelectedRange["ALL"] ? "contained" : "outlined"}
        onClick={() => _onRangeChange(SelectedRange["ALL"])}
        className={cx({ [classes.notSelected]: selectedRange !== SelectedRange["ALL"], [classes.selected]: selectedRange === SelectedRange["ALL"] })}
      >
        ALL
      </Button>
    </ButtonGroup>
  );
};
