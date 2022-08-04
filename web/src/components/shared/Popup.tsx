import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";
import { ButtonProps, DialogProps, IconButton, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from "tss-react/mui";
import { default as MuiDialogTitle } from "@mui/material/DialogTitle";
import { cx } from "@emotion/css";

const useStyles = makeStyles()(theme => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.grey[500]
  },
  dialogTitle: {
    position: "relative"
  },
  dailogTitleText: {
    fontSize: "1.5rem",
    fontWeight: "normal"
  },
  dialogContent: {
    padding: "1.5rem !important",
    margin: 0
  },
  justifyContentBetween: {
    justifyContent: "space-between"
  },
  genericDialogActions: {},
  genericDialogActionButton: {
    textTransform: "initial"
  },
  dialogActionSpaced: {
    "& > :not(:first-child)": {
      marginLeft: ".5rem"
    }
  },
  fixedTopPosition: {
    position: "absolute"
  },
  fixedTopPosition10: {
    top: "10%"
  },
  fixedTopPosition15: {
    top: "15%"
  },
  fixedTopPosition20: {
    top: "20%"
  },
  fixedTopPosition25: {
    top: "25%"
  }
}));

type MessageProps = {
  variant: "message";
  onValidate: () => void;
};

type ConfirmProps = {
  variant: "confirm";
  onValidate: () => void;
  onCancel: () => void;
};

type PromptProps = {
  variant: "prompt";
  onValidate: (data: string) => void;
  onCancel: () => void;
};

type CustomPrompt = {
  variant: "custom";
  actions: ActionButton[];
};

export type TOnCloseHandler = {
  (event: any, reason: "backdropClick" | "escapeKeyDown" | "action"): void;
};

type CommonProps = {
  title?: string | React.ReactNode;
  message?: string;
  open?: boolean;
  onClose?: TOnCloseHandler;
  fullWidth?: boolean;
  dividers?: boolean;
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
  dialogProps?: React.HTMLAttributes<any>;
  fixedTopPosition?: boolean;
  fixedTopPositionHeight?: "10%" | "15%" | "20%" | "25%";
  enableCloseOnBackdropClick?: boolean;
};

export type ActionButtonSide = "left" | "right";

export type ActionButton = ButtonProps & { label: string | React.ReactNode; side: ActionButtonSide };

export type PopupProps = (MessageProps | ConfirmProps | PromptProps | CustomPrompt) & CommonProps;

export interface DialogTitleProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const DialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;
  const { classes } = useStyles();

  return (
    <MuiDialogTitle className={classes.dialogTitle} {...other}>
      <Typography variant="body1" className={classes.dailogTitleText}>
        {children}
      </Typography>
      {onClose ? (
        // TODO => onTouchStart added to handle the touch, onClick was not enough. Investigated how to handle both in one way
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose} onTouchStart={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

export const Popup: React.FC<PopupProps> = props => {
  const [promptInput, setPromptInput] = React.useState("");
  const component = [] as JSX.Element[];
  const { classes } = useStyles();

  const onClose: TOnCloseHandler = (event, reason) => {
    setPromptInput("");
    props.onClose?.(event, reason);
  };

  const ConfirmButtonLabel = "Confirm";
  const CancelButtonLabel = "Cancel";

  const dialogProps = {
    disableEscapeKeyDown: true,
    open: !!props.open,
    fullWidth: props.fullWidth,
    maxWidth: props.maxWidth,
    onClose: props.onClose,
    ...props.dialogProps
  } as DialogProps;

  if (props.title) {
    component.push(
      <DialogTitle key="dialog-title" onClose={() => onClose(null, "action")}>
        {props.title}
      </DialogTitle>
    );
  }

  if (props.message && props.variant !== "prompt") {
    component.push(
      <DialogContent key="dialog-content" className={classes.dialogContent} dividers={props.dividers}>
        <DialogContentText>{props.message}</DialogContentText>
      </DialogContent>
    );
  } else {
    component.push(
      <DialogContent key="dialog-content" className={classes.dialogContent} dividers={props.dividers}>
        {props.variant === "prompt" ? (
          <TextField
            label={props.message}
            value={promptInput}
            // eslint-disable-next-line no-void
            onChange={_ => void setPromptInput(_.target.value)}
            fullWidth
          />
        ) : (
          props.children
        )}
      </DialogContent>
    );
  }

  switch (props.variant) {
    case "confirm":
      component.push(
        <DialogActions key="dialog-actions" className={cx(classes.genericDialogActions, classes.justifyContentBetween)}>
          <Button
            variant="text"
            className={classes.genericDialogActionButton}
            disableElevation
            onClick={() => {
              onClose(null, "action");
              props.onCancel();
            }}
          >
            {CancelButtonLabel}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={classes.genericDialogActionButton}
            disableElevation
            onClick={() => {
              onClose(null, "action");
              props.onValidate();
            }}
          >
            {ConfirmButtonLabel}
          </Button>
        </DialogActions>
      );
      break;
    case "prompt":
      component.push(
        <DialogActions key="DialogActions" className={cx(classes.genericDialogActions, classes.justifyContentBetween)}>
          <Button
            variant="text"
            className={classes.genericDialogActionButton}
            disableElevation
            onClick={() => {
              props.onCancel();
              onClose(null, "action");
            }}
          >
            {CancelButtonLabel}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={classes.genericDialogActionButton}
            disableElevation
            onClick={() => {
              props.onValidate(promptInput);
              onClose(null, "action");
            }}
          >
            {ConfirmButtonLabel}
          </Button>
        </DialogActions>
      );
      break;
    case "message":
      component.push(
        <DialogActions key="DialogActions" className={classes.genericDialogActions}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.genericDialogActionButton}
            disableElevation
            onClick={() => {
              props.onValidate();
              onClose(null, "action");
            }}
          >
            {ConfirmButtonLabel}
          </Button>
        </DialogActions>
      );
      break;
    case "custom": {
      const leftButtons = props.actions
        ?.filter(x => x.side === "left")
        .map((_, idx) => (
          <Button key={`dialog-action-button-${idx}`} className={classes.genericDialogActionButton} disableElevation {..._}>
            {_.label}
          </Button>
        ));
      const rightButtons = props.actions
        ?.filter(x => x.side === "right")
        .map((_, idx) => (
          <Button key={`dialog-action-button-${idx}`} className={classes.genericDialogActionButton} disableElevation {..._}>
            {_.label}
          </Button>
        ));
      component.push(
        <DialogActions className={cx(classes.genericDialogActions, classes.justifyContentBetween)}>
          <div className={classes.dialogActionSpaced}>{leftButtons}</div>
          <div className={classes.dialogActionSpaced}>{rightButtons}</div>
        </DialogActions>
      );
      break;
    }
  }

  const getFixedPositionHeightClass = () => {
    switch (props.fixedTopPositionHeight) {
      case "10%":
        return classes.fixedTopPosition10;
      case "15%":
        return classes.fixedTopPosition15;
      case "20%":
        return classes.fixedTopPosition20;
      case "25%":
        return classes.fixedTopPosition25;

      default:
        break;
    }
  };

  /**
   * Prevent close because of click on backdrop unless enabled through the setting 'enableCloseOnBackdropClick'.
   */
  const handleOnClose = (event, reason) => {
    if ((props.enableCloseOnBackdropClick || reason !== "backdropClick") && props.onClose) {
      props.onClose(event, reason);
    }
  };

  return (
    <Dialog
      key="Dialog"
      PaperComponent={Paper}
      classes={{
        paper: `${props.fixedTopPosition && props.fixedTopPositionHeight && classes.fixedTopPosition} ${getFixedPositionHeightClass()}`
      }}
      {...dialogProps}
      onClose={handleOnClose}
    >
      <ErrorBoundary FallbackComponent={ErrorFallback}>{component}</ErrorBoundary>
    </Dialog>
  );
};
