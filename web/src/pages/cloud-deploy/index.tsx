import { Box, Button, Chip, CircularProgress, Grid, Paper, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player/lazy";
import { DiscordIcon } from "@src/components/shared/icons";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import { GradientText } from "@src/components/shared/GradientText";
import Image from "next/image";
import { makeStyles } from "tss-react/mui";

export interface IDeployProps {}

export const useStyles = makeStyles()(theme => ({
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "3rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.5rem"
    }
  },
  actionButtonContainer: {
    margin: ".5rem auto",
    display: "flex",
    justifyContent: "center",
    maxWidth: "640px"
  },
  actionButton: {
    margin: ".5rem",
    padding: ".7rem 2rem",
    textTransform: "initial",
    fontSize: "1.2rem",
    flexBasis: "50%"
  },
  actionButtonLabel: {
    display: "flex",
    flexDirection: "column",
    "& small": {
      fontSize: ".7rem"
    }
  },
  disclaimerTitle: {
    fontWeight: "bold",
    marginBottom: "1rem"
  },
  disclaimerList: {
    textDecoration: "none"
  },
  link: {
    fontWeight: "bold",
    textDecoration: "underline"
  },
  socials: {
    textAlign: "center"
  },
  socialLink: {
    padding: "1rem",
    transition: ".3s all ease",
    "& path": {
      fill: theme.palette.mode === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main,
      transition: ".3s all ease"
    },
    "&:hover": {
      color: theme.palette.secondary.main,
      "& path": {
        fill: theme.palette.secondary.main
      }
    }
  },
  socialIcon: {
    height: "3rem",
    width: "3rem",
    fontSize: "3rem",
    display: "block",
    margin: "0 auto"
  },
  alert: {
    margin: "1rem auto",
    maxWidth: 640
  },
  loading: { textAlign: "center", marginTop: "4rem", marginBottom: "1rem" },
  releaseNote: {
    textAlign: "left",
    maxWidth: 640,
    margin: "auto"
  }
}));

export const Deploy: React.FunctionComponent<IDeployProps> = ({}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [releaseInfo, setReleaseInfo] = useState(null);
  const theme = useTheme();
  const { classes } = useStyles();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/api/latestDeployToolVersion`);
        const data = await response.json();

        setReleaseInfo(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Layout title="Proposals" appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={classes.title}>
          <GradientText>Decentralized Cloud Hosting</GradientText>
        </Typography>
        <Box sx={{ textAlign: "center", padding: "1rem" }}>
          <Image
            alt="Cloudmos Logo"
            src={theme.palette.mode === "dark" ? "/images/akash-logo-flat-dark.png" : "/images/akash-logo-flat-light.png"}
            quality={100}
            width={256}
            height={31}
            priority
          />
        </Box>

        <Box textAlign="center" maxWidth="640px" margin="0 auto">
          <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "1.1rem", marginBottom: "4px" }}>
            Deploy any docker container in a few clicks!
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 300 }}>
            Akashlytics Deploy is a desktop app GUI that greatly simplifies and enhances deployments on the Akash Network.
          </Typography>

          {!isLoading && releaseInfo && (
            <Box marginTop="2rem">
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Download
              </Typography>

              <div className={classes.actionButtonContainer}>
                {releaseInfo.windowsUrl && (
                  <Button
                    size="large"
                    variant="outlined"
                    color="secondary"
                    classes={{ root: classes.actionButton }}
                    component="a"
                    href={releaseInfo.windowsUrl}
                  >
                    Windows
                  </Button>
                )}

                {releaseInfo.macUrl && (
                  <Button size="large" variant="outlined" color="secondary" classes={{ root: classes.actionButton }} component="a" href={releaseInfo.macUrl}>
                    macOS
                  </Button>
                )}

                {releaseInfo.linuxUrl && (
                  <Button size="large" variant="outlined" color="secondary" classes={{ root: classes.actionButton }} component="a" href={releaseInfo.linuxUrl}>
                    Linux
                  </Button>
                )}
              </div>

              <Box display="flex" alignItems="center" justifyContent="center">
                <Chip color="secondary" label="BETA" size="small" sx={{ height: "1rem", fontSize: ".5rem", fontWeight: "bold" }} />
                &nbsp;&nbsp;
                <Typography variant="caption">{releaseInfo.version}</Typography>
              </Box>
            </Box>
          )}
          {!isLoading && !releaseInfo && (
            <Box marginTop={2}>
              <Typography variant="caption">
                You can find the latest version of the deploy tool on{" "}
                <a className={classes.link} target="_blank" rel="noopener noreferrer" href="https://github.com/Akashlytics/akashlytics-deploy/releases">
                  Github.
                </a>
              </Typography>
            </Box>
          )}
          {isLoading && (
            <>
              <div className={classes.loading}>
                <CircularProgress size={80} color="secondary" />
              </div>
            </>
          )}
        </Box>

        <Box margin="1rem auto" display="flex" justifyContent="center">
          <ReactPlayer url="https://www.youtube.com/watch?v=KscVdyESSm4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
        </Box>

        {!isLoading && releaseInfo && (
          <Paper sx={{ margin: "2rem auto", textAlign: "left", maxWidth: "640px", padding: "1rem", borderRadius: ".5rem" }} elevation={2}>
            <Typography variant="h6">Release Note ({releaseInfo.version})</Typography>
            <div className={classes.releaseNote}>
              <ReactMarkdown linkTarget="_blank" remarkPlugins={[]} className="markdownContainer">
                {releaseInfo.note}
              </ReactMarkdown>
            </div>
          </Paper>
        )}

        <Box margin="3rem auto 5rem" maxWidth="640px">
          <Box textAlign="center">
            <Typography variant="h5" className={classes.disclaimerTitle}>
              <GradientText>Follow our progress</GradientText>
            </Typography>
          </Box>

          <Grid container spacing={1} className={classes.socials}>
            <Grid item xs={6} sm={3}>
              <a href="https://discord.gg/rXDFNYnFwv" target="_blank" className={classes.socialLink}>
                <DiscordIcon className={classes.socialIcon} />
              </a>
            </Grid>
            <Grid item xs={6} sm={3}>
              <a href="https://www.youtube.com/channel/UC1rgl1y8mtcQoa9R_RWO0UA?sub_confirmation=1" target="_blank" className={classes.socialLink}>
                <YouTubeIcon className={classes.socialIcon} />
              </a>
            </Grid>
            <Grid item xs={6} sm={3}>
              <a href="https://twitter.com/akashlytics" target="_blank" className={classes.socialLink}>
                <TwitterIcon className={classes.socialIcon} />
              </a>
            </Grid>
            <Grid item xs={6} sm={3}>
              <a href="https://github.com/Akashlytics/akashlytics-deploy" target="_blank" className={classes.socialLink}>
                <GitHubIcon className={classes.socialIcon} />
              </a>
            </Grid>
          </Grid>
        </Box>

        <Box margin="5rem auto" maxWidth="640px">
          <Typography variant="h4" className={classes.disclaimerTitle}>
            Disclaimer
          </Typography>

          <u className={classes.disclaimerList}>
            <li>
              Akashlytics Deploy is currently in BETA. We strongly suggest you start with a new wallet and a small amount of AKT until we further stabilize the
              product.
            </li>
            <li>We're not responsible for any loss or damages related to using the app.</li>
            <li>The app has a high chance of containing bugs since it's in BETA, use at your own risk.</li>
          </u>
        </Box>
      </PageContainer>
    </Layout>
  );
};

export default Deploy;
