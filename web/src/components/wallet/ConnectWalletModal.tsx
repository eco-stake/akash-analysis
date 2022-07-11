import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import React, { ReactNode, useState } from "react";
import { makeStyles } from "tss-react/mui";
import Image from "next/image";
import { CustomDialogTitle } from "@src/components/shared/CustomDialogTitle";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { CircularProgress, Typography } from "@mui/material";
import { useKeplr } from "@src/context/KeplrWalletProvider";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

type Props = {
  onClose: () => void;
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.main : theme.palette.primary.contrastText
  },
  content: {
    padding: "1rem"
  },
  dialogActions: {
    display: "flex",
    justifyContent: "space-between"
  },
  connectWalletLoading: {
    marginLeft: "1rem",
    color: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main
  },
  connectionContainer: {
    padding: "1rem",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: theme.palette.mode === "dark" ? theme.palette.primary.main : theme.palette.grey[200]
    }
  }
}));

const keplrUrl = "https://www.keplr.app/";

export const ConnectWalletModal: React.FunctionComponent<Props> = ({ onClose }) => {
  const { isKeplrInstalled, connectWallet } = useKeplr();
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const { classes } = useStyles();

  const onConnectKeplrClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (isConnectingWallet) return;

    if (isKeplrInstalled) {
      setIsConnectingWallet(true);
      await connectWallet();
    } else {
      window.open(keplrUrl, "_blank").focus();
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth open={true} onClose={onClose} classes={{ paper: classes.root }}>
      <CustomDialogTitle onClose={onClose}>
        Connect Wallet
        {isConnectingWallet && <CircularProgress size="1rem" className={classes.connectWalletLoading} />}
      </CustomDialogTitle>
      <DialogContent className={classes.content}>
        <Paper className={classes.connectionContainer} sx={{ mb: "1rem" }} onClick={onConnectKeplrClick}>
          <Image alt="Keplr Wallet Logo" src="/images/keplr-logo.png" quality={100} layout="fixed" width="64px" height="64px" priority />

          <Box sx={{ padding: "0 1rem" }}>
            <Typography variant="h6">
              <Box component="strong" sx={{ display: "flex", alignItems: "center" }}>
                {isKeplrInstalled ? (
                  "Keplr Wallet"
                ) : (
                  <>
                    Install Keplr&nbsp;
                    <OpenInNewIcon fontSize="small" />
                  </>
                )}
              </Box>
            </Typography>

            <Typography variant="body2">{isKeplrInstalled ? "Keplr Browser Extension" : keplrUrl}</Typography>
          </Box>
        </Paper>

        <Paper className={classes.connectionContainer}>
          <Image alt="Wallet Connect Logo" src="/images/wallet-connect-logo.png" quality={100} layout="fixed" width="64px" height="64px" priority />

          <Box sx={{ padding: "0 1rem" }}>
            <Typography variant="h6">
              <strong>WalletConnect</strong>
            </Typography>

            <Typography variant="body2">Keplr Mobile</Typography>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
