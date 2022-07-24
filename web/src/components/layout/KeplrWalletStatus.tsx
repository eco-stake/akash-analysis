import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LogoutIcon from "@mui/icons-material/Logout";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useKeplr } from "@src/context/KeplrWalletProvider";
import { FormattedNumber } from "react-intl";
import React, { ReactNode } from "react";
import { makeStyles } from "tss-react/mui";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { ConnectWalletButton } from "../wallet/ConnectWalletButton";

type Props = {
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  accountBalances: {
    fontSize: ".875rem",
    color: theme.palette.grey[500],
    fontWeight: "bold"
  }
}));

export const KeplrWalletStatus: React.FunctionComponent<Props> = ({}) => {
  const { classes } = useStyles();
  const { isKeplrConnected, walletName, walletBalances, logout } = useKeplr();

  return (
    <>
      {isKeplrConnected ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
            <Box sx={{ padding: "0 1rem" }}>
              <AccountBalanceWalletIcon />
            </Box>

            <Box sx={{ flexGrow: 1, textAlign: "left" }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {walletName}
              </Typography>
              {walletBalances && (
                <div className={classes.accountBalances}>
                  <div>
                    <FormattedNumber value={udenomToDenom(walletBalances.UTODO)} maximumFractionDigits={2} /> $TODO
                  </div>
                </div>
              )}
            </Box>
          </Box>

          <Button variant="outlined" color="secondary" onClick={logout} fullWidth>
            <LogoutIcon />
            <Box component="span" sx={{ marginLeft: ".5rem" }}>
              Logout
            </Box>
          </Button>
        </>
      ) : (
        <ConnectWalletButton fullWidth />
      )}
    </>
  );
};
