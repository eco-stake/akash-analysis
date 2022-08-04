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
import { Avatar, Box, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { useFriendlyMessageType } from "@src/hooks/useFriendlyMessageType";
import { getSplitText } from "@src/hooks/useShortText";
import { FormattedNumber, FormattedTime } from "react-intl";
import { humanFileSize } from "@src/utils/unitUtils";
import { DeploymentDetail } from "@src/types/deployment";
import { GradientText } from "@src/components/shared/GradientText";
import { Address } from "@src/components/shared/Address";
import { LeaseSpecDetail } from "@src/components/shared/LeaseSpecDetail";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";

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
    marginBottom: "2rem"
  },
  titleSmall: {
    fontSize: "1.1rem"
  },
  subTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    marginLeft: ".5rem",
    color: theme.palette.mode === "dark" ? theme.palette.grey[500] : theme.palette.grey[800]
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
    width: "12rem",
    flexShrink: 0
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
          <GradientText>Deployment Detail</GradientText>
        </Typography>

        <Grid container spacing={2}>
          <Grid item md={6}>
            <Typography variant="h3" className={classes.subTitle}>
              Summary
            </Typography>
            <Paper sx={{ padding: 2, marginBottom: "1rem" }} elevation={2}>
              <div className={classes.deploymentInfoRow}>
                <div className={classes.label}>Owner</div>
                <div className={classes.value}>
                  <Link href={UrlService.address(deployment.owner)}>
                    <a>
                      <Address address={deployment.owner} />
                    </a>
                  </Link>
                </div>
              </div>
              <div className={classes.deploymentInfoRow}>
                <div className={classes.label}>Status</div>
                <div className={classes.value}>
                  <Chip label={deployment.status} color={deployment.status === "active" ? "success" : "error"} size="small" />
                </div>
              </div>
              <div className={classes.deploymentInfoRow}>
                <div className={classes.label}>DSEQ</div>
                <div className={classes.value}>{deployment.dseq}</div>
              </div>
              <div className={classes.deploymentInfoRow}>
                <div className={classes.label}>Balance</div>
                <div className={classes.value}>
                  {udenomToDenom(deployment.balance, 6)}&nbsp;
                  <AKTLabel />
                </div>
              </div>
              {deployment.leases.length > 0 && (
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Total Cost</div>
                  <div className={classes.value}>
                    <Typography variant="body1">
                      <FormattedNumber style="currency" currency="USD" value={deployment.totalMonthlyCostUSD} /> per month
                    </Typography>
                    <Typography variant="caption">
                      <FormattedNumber value={deployment.totalMonthlyCostAKT} /> $AKT per month
                    </Typography>
                  </div>
                </div>
              )}
            </Paper>

            <Typography variant="h3" className={classes.subTitle}>
              Timeline
            </Typography>

            <Paper sx={{ padding: 2 }} elevation={2}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction</TableCell>
                      <TableCell align="center">Event</TableCell>
                      <TableCell align="center">Date</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {deployment.events.map((event, i) => (
                      <TableRow key={`${event.txHash}_${i}`}>
                        <TableCell>
                          <Link href={UrlService.transaction(event.txHash)}>
                            <a target="_blank">{getSplitText(event.txHash, 6, 6)}</a>
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
            <Typography variant="h3" className={classes.subTitle}>
              Leases
            </Typography>
            {deployment.leases.length === 0 && <>This deployment has no lease</>}
            {deployment.leases.map(lease => (
              <Paper key={lease.oseq + "_" + lease.gseq} sx={{ padding: "1rem", marginBottom: "1rem" }} elevation={2}>
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
                  <div className={classes.value}>
                    <Chip label={lease.status} color={lease.status === "active" ? "success" : "error"} size="small" />
                  </div>
                </div>

                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Total Cost</div>
                  <div className={classes.value}>
                    <Typography variant="body1">
                      <FormattedNumber style="currency" currency="USD" value={lease.monthlyCostUSD} /> per month
                    </Typography>
                    <Typography variant="caption">
                      <FormattedNumber value={lease.monthlyCostAKT} /> $AKT per month
                    </Typography>
                  </div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Specs</div>
                  <div className={classes.value}>
                    <LeaseSpecDetail type="cpu" value={lease.cpuUnits / 1_000} />
                    <LeaseSpecDetail type="ram" value={humanFileSize(lease.memoryQuantity, true)} />
                    <LeaseSpecDetail type="storage" value={humanFileSize(lease.storageQuantity, true)} />
                  </div>
                </div>
                <div className={classes.deploymentInfoRow}>
                  <div className={classes.label}>Provider</div>
                  <div className={classes.value}>
                    <Link href={UrlService.address(lease.provider.address)}>
                      <a title={lease.provider.address}>{getSplitText(lease.provider.address, 10, 10)}</a>
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
