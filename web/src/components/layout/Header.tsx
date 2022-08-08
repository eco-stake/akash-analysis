import React, { ReactNode } from "react";
import { AppBar, Box, Container, Toolbar } from "@mui/material";
import SearchBar from "./SearchBar";
import { makeStyles } from "tss-react/mui";
import { customColors } from "@src/utils/colors";

type Props = {
  children?: ReactNode;
};

const useStyles = makeStyles()(theme => ({
  toolbar: {
    minHeight: 100,
    alignItems: "center",
    backgroundColor: theme.palette.mode === "dark" ? customColors.dark : customColors.lightBg,
    [theme.breakpoints.down("sm")]: {
      minHeight: 70
    }
  }
}));

export const Header: React.FunctionComponent<Props> = () => {
  const { classes } = useStyles();

  return (
    <AppBar position="relative">
      <Toolbar className={classes.toolbar}>
        <Container sx={{ padding: { xs: 0 } }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SearchBar />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};
