import { useSnackbar } from "notistack";
import { Snackbar } from "./Snackbar";
import { cx } from "@emotion/css";
import { makeStyles } from "tss-react/mui";
import React, { ReactNode, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import FileCopy from "@mui/icons-material/FileCopy";
import { copyTextToClipboard } from "@src/utils/copyClipboard";

type Props = {
  address: string;
  isCopyable?: boolean;
  disableTruncate?: boolean;
  showIcon?: boolean;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  root: { display: "inline-flex", alignItems: "center", transition: "all .3s ease" },
  copy: {
    cursor: "pointer",
    "&:hover": {
      color: theme.palette.info.dark
    }
  },
  copyIcon: {
    fontSize: "1rem",
    marginLeft: ".5rem",
    opacity: 0,
    transition: "all .3s ease"
  },
  showIcon: {
    opacity: 100
  },
  tooltip: {
    fontSize: ".8rem",
    whiteSpace: "nowrap",
    maxWidth: "fit-content"
  }
}));

export const Address: React.FunctionComponent<Props> = ({ address, isCopyable, disableTruncate, showIcon, ...rest }) => {
  const [isOver, setIsOver] = useState(false);
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const formattedAddress = disableTruncate ? address : [address?.slice(0, 8), "...", address?.slice(address?.length - 5)].join("");

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isCopyable) {
      event.preventDefault();
      event.stopPropagation();

      copyTextToClipboard(address);
      enqueueSnackbar(<Snackbar title="Address copied to clipboard!" iconVariant="success" />, {
        variant: "success",
        autoHideDuration: 2000
      });
    }
  };

  return (
    <Tooltip classes={{ tooltip: classes.tooltip }} arrow title={address}>
      <Box
        className={cx(classes.root, { [classes.copy]: isCopyable })}
        component="span"
        onClick={onClick}
        onMouseOver={() => setIsOver(true)}
        onMouseOut={() => setIsOver(false)}
        {...rest}
      >
        <span>{formattedAddress}</span>

        {isCopyable && <FileCopy className={cx(classes.copyIcon, { [classes.showIcon]: isOver || showIcon })} />}
      </Box>
    </Tooltip>
  );
};
