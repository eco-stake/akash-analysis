import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DnsIcon from "@mui/icons-material/Dns";
import { ReactNode } from "react";
import { ColorModeSwitch } from "./ColorModeSwitch";
import Image from "next/image";
import Link from "next/link";
import { cx } from "@emotion/css";
import { useRouter } from "next/router";
import { drawerWidth } from "@src/utils/constants";
import getConfig from "next/config";
import { makeStyles } from "tss-react/mui";
import { UrlService } from "@src/utils/urlUtils";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PollIcon from "@mui/icons-material/Poll";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SavingsIcon from "@mui/icons-material/Savings";
import HelpIcon from "@mui/icons-material/Help";
import CloudIcon from "@mui/icons-material/Cloud";
import HubIcon from "@mui/icons-material/Hub";
import { Tooltip } from "@mui/material";

const { publicRuntimeConfig } = getConfig();

const useStyles = makeStyles()(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    width: "100%"
  },
  list: {
    padding: 0,
    overflow: "hidden",
    width: "100%"
  },
  notSelected: {
    color: theme.palette.grey[500],
    fontWeight: "normal"
  },
  selected: {
    fontWeight: "bold"
  },
  version: {
    fontSize: ".7rem",
    fontWeight: "bold",
    color: theme.palette.grey[500],
    textAlign: "left"
  },
  comingSoonTooltip: {
    backgroundColor: theme.palette.secondary.main
  }
}));

type Props = {
  children?: ReactNode;
  isMobileOpen: boolean;
  handleDrawerToggle: () => void;
};

export const Sidebar: React.FunctionComponent<Props> = ({ isMobileOpen, handleDrawerToggle }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const router = useRouter();

  const routes = [
    {
      title: "Dashboard",
      icon: props => <DashboardIcon {...props} />,
      url: UrlService.dashboard(),
      activeRoutes: [UrlService.dashboard()]
    },
    {
      title: "Deploy",
      icon: props => <CloudUploadIcon {...props} />,
      url: UrlService.deploy(),
      activeRoutes: [UrlService.deploy()]
    },
    {
      title: "Deployments",
      icon: props => <CloudIcon {...props} />,
      url: UrlService.deployments(),
      activeRoutes: [UrlService.deployments()]
    },
    {
      title: "Providers",
      icon: props => <DnsIcon {...props} />,
      url: UrlService.providers(),
      activeRoutes: [UrlService.providers()]
    },
    {
      title: "Blocks",
      icon: props => <ViewInArIcon {...props} />,
      url: UrlService.blocks(),
      activeRoutes: [UrlService.blocks()]
    },
    {
      title: "Transactions",
      icon: props => <ReceiptIcon {...props} />,
      url: UrlService.transactions(),
      activeRoutes: [UrlService.transactions()]
    },
    {
      title: "Validators",
      icon: props => <HubIcon {...props} />,
      url: UrlService.validators(),
      activeRoutes: [UrlService.validators()]
    },
    {
      title: "Proposals",
      icon: props => <PollIcon {...props} />,
      url: UrlService.proposals(),
      activeRoutes: [UrlService.proposals()]
    },
    {
      title: "Price Compare",
      icon: props => <SavingsIcon {...props} />,
      url: UrlService.priceCompare(),
      activeRoutes: [UrlService.priceCompare()]
    },
    {
      title: "FAQ",
      icon: props => <HelpIcon {...props} />,
      url: UrlService.faq(),
      activeRoutes: [UrlService.faq()]
    }
  ];

  const drawer = (
    <div className={classes.root} style={{ width: drawerWidth }}>
      <div className={classes.nav}>
        <Box sx={{ height: "70px", width: "210px", paddingTop: ".5rem", marginBottom: { xs: 0, md: "2rem" }, alignSelf: "flex-start" }}>
          <Image
            alt="Cloudmos Logo"
            src={theme.palette.mode === "dark" ? "/images/cloudmos-logo.png" : "/images/cloudmos-logo-light.png"}
            layout="responsive"
            quality={100}
            width={160}
            height={40}
            priority
          />
        </Box>

        <Box paddingTop="1rem" width="100%">
          <List className={classes.list}>
            {routes.map(route => {
              const isSelected = route.url === UrlService.dashboard() ? router.pathname === "/" : route.activeRoutes.some(x => router.pathname.startsWith(x));

              const button = (
                <Button
                  startIcon={route.icon({ color: isSelected ? "secondary" : "disabled" })}
                  fullWidth
                  color="inherit"
                  className={cx({
                    [classes.selected]: isSelected,
                    [classes.notSelected]: !isSelected
                  })}
                  sx={{
                    justifyContent: "flex-start",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    textTransform: "initial"
                  }}
                >
                  <Box sx={{ marginLeft: ".5rem" }}>{route.title}</Box>
                </Button>
              );

              return (
                <ListItem key={route.title} sx={{ padding: "4px 0" }}>
                  <Link href={route.url} passHref>
                    {button}
                  </Link>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </div>

      <Box sx={{ padding: "0 1rem 2rem", width: "100%" }}>
        {/* <Box sx={{ mb: 2 }}>
          <KeplrWalletStatus />
        </Box> */}

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ColorModeSwitch />

          <Box sx={{ padding: "1rem", flexGrow: 1, textAlign: "center" }}>
            <Image
              alt="Akash Network Logo"
              src={theme.palette.mode === "dark" ? "/images/akash-logo-dark.png" : "/images/akash-logo-light.png"}
              quality={100}
              layout="fixed"
              height="49px"
              width="128px"
              priority
            />
          </Box>
        </Box>

        <Box sx={{ padding: "0 1rem" }}>
          <small className={classes.version}>v{publicRuntimeConfig?.version}</small>
        </Box>
      </Box>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="mailbox folders">
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, overflow: "hidden" }
        }}
        PaperProps={{
          sx: {
            border: "none"
          }
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "none", md: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, overflow: "hidden" }
        }}
        PaperProps={{
          sx: {
            border: "none"
          }
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
