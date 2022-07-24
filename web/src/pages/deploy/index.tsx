import { Box, Button, Chip, CircularProgress, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player/lazy";
import { useStyles } from "./index.styles";
import { DiscordIcon } from "@src/components/shared/icons";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";

export interface IDeployProps {}

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
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <Layout title="Proposals" appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={classes.title}>
          Deploy on Akash Network
        </Typography>
        <Typography variant="h3" className={classes.subTitle}>
          In a few clicks!
        </Typography>

        <Box marginTop="1rem" textAlign="center">
          <Typography variant="h5" className={classes.subSubTitle}>
            Akashlytics Deploy is a desktop app that greatly simplifies and enhances deployments on the Akash Network.
          </Typography>

          {!isLoading && releaseInfo && (
            <Box marginTop="2rem">
              <Typography variant="h6">Download</Typography>

              <div className={classes.actionButtonContainer}>
                {releaseInfo.windowsUrl && (
                  <Button size="large" variant="contained" classes={{ root: classes.actionButton }} component="a" href={releaseInfo.windowsUrl}>
                    Windows
                  </Button>
                )}

                {releaseInfo.macUrl && (
                  <Button size="large" variant="contained" classes={{ root: classes.actionButton }} component="a" href={releaseInfo.macUrl}>
                    macOS
                  </Button>
                )}

                {releaseInfo.linuxUrl && (
                  <Button size="large" variant="contained" classes={{ root: classes.actionButton }} component="a" href={releaseInfo.linuxUrl}>
                    Linux
                  </Button>
                )}
              </div>

              <Box display="flex" alignItems="center" justifyContent="center">
                <Chip color="primary" label="BETA" size="small" />
                &nbsp;&nbsp;
                <Typography variant="caption">{releaseInfo.version}</Typography>
              </Box>

              <Typography variant="h6">Release Note ({releaseInfo.version})</Typography>
              <div className={classes.releaseNote}>
                <ReactMarkdown linkTarget="_blank" remarkPlugins={[]} className="markdownContainer">
                  {releaseInfo.note}
                </ReactMarkdown>
              </div>
            </Box>
          )}
          {!isLoading && !releaseInfo && (
            <Box marginTop={2}>
              You can find the latest version of the deploy tool on{" "}
              <a className={classes.link} target="_blank" rel="noopener noreferrer" href="https://github.com/Akashlytics/akashlytics-deploy/releases">
                Github
              </a>
              .
            </Box>
          )}
          {isLoading && (
            <>
              <div className={classes.loading}>
                <CircularProgress size={80} />
              </div>
            </>
          )}
        </Box>

        <Box margin="1rem auto" display="flex" justifyContent="center">
          <ReactPlayer url="https://www.youtube.com/watch?v=KscVdyESSm4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
        </Box>

        <Box margin="3rem auto 5rem" maxWidth="640px">
          <Box textAlign="center">
            <Typography variant="h4" className={classes.disclaimerTitle}>
              Follow our progress
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
