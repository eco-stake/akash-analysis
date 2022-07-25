import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { cx } from "@emotion/css";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import MemoryIcon from "@mui/icons-material/Memory";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";
import { Avatar, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { useFriendlyMessageType } from "@src/hooks/useFriendlyMessageType";
import { useSplitText } from "@src/hooks/useShortText";
import { FormattedNumber, FormattedTime } from "react-intl";
import { humanFileSize } from "@src/utils/unitUtils";
import { DeploymentDetail } from "@src/types/deployment";

type Props = {
  errors?: string;
  owner: string;
  dseq: string;
  deployment: DeploymentDetail;
};

const useStyles = makeStyles()(theme => ({
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginLeft: ".5rem",
    marginBottom: "1rem"
  },
  titleSmall: {
    fontSize: "1.1rem"
  },
  deploymentInfoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    "&:last-child": {
      marginBottom: 0
    }
  },
  label: {
    fontWeight: "bold",
    maxWidth: "10rem",
    flex: "1 1 0px",
    flexBasis: 0
  },
  value: {
    wordBreak: "break-all",
    overflowWrap: "anywhere"
  }
}));

const DeploymentDetailPage: React.FunctionComponent<Props> = ({ owner, dseq, deployment, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Layout title={`Deployment ${owner}/${dseq}`} appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
          Details for Deployment {owner}/{dseq}
        </Typography>

        <Grid container spacing={2}>
          <Grid item md={6}>
            <Typography variant="h3" sx={{ fontSize: "1.5rem", mb: "1rem", fontWeight: "bold", marginLeft: ".5rem" }}>
              Summary
            </Typography>
            <Paper sx={{ padding: 2 }}>
              <div className={classes.deploymentInfoRow}>
                <div className={classes.label}>Owner</div>
                <div className={classes.value}>
                  <Link href={UrlService.address(deployment.owner)}>
                    <a>{deployment.owner}</a>
                  </Link>
                </div>
              </div>
              <div className={classes.deploymentInfoRow}>
                <div className={classes.label}>DSEQ</div>
                <div className={classes.value}>{deployment.dseq}</div>
              </div>
              {deployment.leases.length > 0 && (
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Total Cost</div>
                  <div className={classes.value}>
                    <FormattedNumber style="currency" currency="USD" value={deployment.totalMonthlyCostUSD} /> per month
                    <br />
                    <small>
                      <FormattedNumber value={deployment.totalMonthlyCostAKT} /> $AKT per month
                    </small>
                  </div>
                </div>
              )}
            </Paper>

            <Typography variant="h3" sx={{ fontSize: "1.5rem", mb: "1rem", fontWeight: "bold", marginLeft: ".5rem" }}>
              Timeline
            </Typography>

            <Paper sx={{ padding: 2 }}>
              <TableContainer sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tx</TableCell>
                      <TableCell align="center">Event</TableCell>
                      <TableCell align="center">Date</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {deployment.events.map(event => (
                      <TableRow key={event.txHash}>
                        <TableCell>
                          <Link href={UrlService.transaction(event.txHash)}>
                            <a>{useSplitText(event.txHash, 6, 6)}</a>
                          </Link>
                        </TableCell>
                        <TableCell align="center">{useFriendlyMessageType(event.type)}</TableCell>
                        <TableCell align="center">
                          <FormattedTime value={event.date} day="2-digit" month="2-digit" year="numeric" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item md={6} xs={12}>
            <Typography variant="h3" sx={{ fontSize: "1.5rem", mb: "1rem", fontWeight: "bold", marginLeft: ".5rem" }}>
              Leases
            </Typography>
            {deployment.leases.length === 0 && <>This deployment has no lease</>}
            {deployment.leases.map(lease => (
              <Paper key={lease.oseq + "_" + lease.gseq} sx={{ padding: 2, marginBottom: 1 }}>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>OSEQ</div>
                  <div className={classes.value}>{lease.oseq}</div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>GSEQ</div>
                  <div className={classes.value}>{lease.gseq}</div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Status</div>
                  <div className={classes.value}>{lease.status}</div>
                </div>

                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Total Cost</div>
                  <div className={classes.value}>
                    <FormattedNumber style="currency" currency="USD" value={lease.monthlyCostUSD} /> per month
                    <br />
                    <small>
                      <FormattedNumber value={lease.monthlyCostAKT} /> $AKT per month
                    </small>
                  </div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Specs</div>
                  <div className={classes.value}>
                    <SpeedIcon />
                    &nbsp;
                    <FormattedNumber value={lease.cpuUnits / 1_000} /> vCPU
                    <br />
                    <MemoryIcon />
                    &nbsp;{humanFileSize(lease.memoryQuantity)}
                    <br />
                    <StorageIcon />
                    &nbsp;{humanFileSize(lease.storageQuantity)}
                  </div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Provider</div>
                  <div className={classes.value}>
                    <Link href={UrlService.address(lease.provider.address)}>
                      <a title={lease.provider.address}>{useSplitText(lease.provider.address, 10, 10)}</a>
                    </Link>
                    <br />
                    {new URL(lease.provider.hostUri).hostname}
                  </div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Provider Attributes</div>
                  <div className={classes.value}>
                    {lease.provider.attributes.map(attribute => (
                      <div key={attribute.key}>
                        {attribute.key}: {attribute.value}
                      </div>
                    ))}
                  </div>
                </div>
              </Paper>
            ))}
          </Grid>
        </Grid>
      </PageContainer>
    </Layout>
  );
};

export default DeploymentDetailPage;

export async function getServerSideProps({ params }) {
  const deployment = await fetchDeploymentData(params?.owner, params?.dseq);

  return {
    props: {
      owner: params?.owner,
      dseq: params?.dseq,
      deployment
    }
  };
}

async function fetchDeploymentData(owner: string, dseq: string) {
  const response = await axios.get(`${BASE_API_URL}/api/deployment/${owner}/${dseq}`);
  return response.data;
}
