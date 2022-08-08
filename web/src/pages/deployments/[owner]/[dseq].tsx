import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import Error from "@src/components/shared/Error";
import { Box, Chip, darken, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { useFriendlyMessageType } from "@src/hooks/useFriendlyMessageType";
import { getSplitText } from "@src/hooks/useShortText";
import { FormattedNumber, FormattedTime } from "react-intl";
import { humanFileSize } from "@src/utils/unitUtils";
import { DeploymentDetail } from "@src/types/deployment";
import { Address } from "@src/components/shared/Address";
import { LeaseSpecDetail } from "@src/components/shared/LeaseSpecDetail";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { LabelValue } from "@src/components/shared/LabelValue";
import { Title } from "@src/components/shared/Title";

type Props = {
  errors?: string;
  owner: string;
  dseq: string;
  deployment: DeploymentDetail;
};

const useStyles = makeStyles()(theme => ({
  tableHeader: {
    "& th": {
      textTransform: "uppercase",
      border: "none",
      opacity: 0.8
    }
  },
  timelineRow: {
    whiteSpace: "nowrap",
    height: "40px",
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.mode === "dark" ? darken(theme.palette.grey[700], 0.5) : theme.palette.action.hover
    },
    "& td": {
      border: "none"
    }
  }
}));

const DeploymentDetailPage: React.FunctionComponent<Props> = ({ owner, dseq, deployment, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <Layout title={`Deployment ${owner}/${dseq}`} appendGenericTitle>
      <PageContainer>
        <Box sx={{ marginBottom: "2rem" }}>
          <Title value="Deployment Details" />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Title value="Summary" subTitle sx={{ marginBottom: "1rem" }} />

            <Paper sx={{ padding: 2, marginBottom: "1rem" }} elevation={2}>
              <LabelValue
                label="Owner"
                value={
                  <Link href={UrlService.address(deployment.owner)}>
                    <a>
                      <Address address={deployment.owner} />
                    </a>
                  </Link>
                }
                labelWidth="12rem"
              />
              <LabelValue
                label="Status"
                value={<Chip label={deployment.status} color={deployment.status === "active" ? "success" : "error"} size="small" />}
                labelWidth="12rem"
              />
              <LabelValue label="DSEQ" value={deployment.dseq} labelWidth="12rem" />
              <LabelValue
                label="Balance"
                value={
                  <>
                    {udenomToDenom(deployment.balance, 6)}&nbsp;
                    <AKTLabel />
                  </>
                }
                labelWidth="12rem"
              />
              {deployment.leases.length > 0 && (
                <LabelValue
                  label="Total Cost"
                  value={
                    <>
                      <Typography variant="body1">
                        <FormattedNumber style="currency" currency="USD" value={deployment.totalMonthlyCostUSD} /> per month
                      </Typography>
                      <Typography variant="caption">
                        <FormattedNumber value={deployment.totalMonthlyCostAKT} /> $AKT per month
                      </Typography>
                    </>
                  }
                  labelWidth="12rem"
                />
              )}
            </Paper>

            <Title value="Timeline" subTitle sx={{ marginBottom: "1rem" }} />

            <Paper sx={{ padding: 2 }} elevation={2}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow className={classes.tableHeader}>
                      <TableCell>Transaction</TableCell>
                      <TableCell align="center">Event</TableCell>
                      <TableCell align="center">Date</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {deployment.events.map((event, i) => (
                      <TableRow key={`${event.txHash}_${i}`} className={classes.timelineRow}>
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
            <Title value="Leases" subTitle sx={{ marginBottom: "1rem" }} />

            {deployment.leases.length === 0 && <>This deployment has no lease</>}
            {deployment.leases.map(lease => (
              <Paper key={lease.oseq + "_" + lease.gseq} sx={{ padding: "1rem", marginBottom: "1rem" }} elevation={2}>
                <LabelValue label="OSEQ" value={lease.oseq} labelWidth="12rem" />
                <LabelValue label="GSEQ" value={lease.gseq} labelWidth="12rem" />
                <LabelValue
                  label="Status"
                  value={<Chip label={lease.status} color={lease.status === "active" ? "success" : "error"} size="small" />}
                  labelWidth="12rem"
                />
                <LabelValue
                  label="Total Cost"
                  value={
                    <>
                      <Typography variant="body1">
                        <FormattedNumber style="currency" currency="USD" value={lease.monthlyCostUSD} /> per month
                      </Typography>
                      <Typography variant="caption">
                        <FormattedNumber value={lease.monthlyCostAKT} /> $AKT per month
                      </Typography>
                    </>
                  }
                  labelWidth="12rem"
                />
                <LabelValue
                  label="Specs"
                  value={
                    <>
                      <LeaseSpecDetail type="cpu" value={lease.cpuUnits / 1_000} />
                      <LeaseSpecDetail type="ram" value={humanFileSize(lease.memoryQuantity, true)} />
                      <LeaseSpecDetail type="storage" value={humanFileSize(lease.storageQuantity, true)} />
                    </>
                  }
                  labelWidth="12rem"
                />
                <LabelValue
                  label="Provider"
                  value={
                    <>
                      <Link href={UrlService.address(lease.provider.address)}>
                        <a title={lease.provider.address}>{getSplitText(lease.provider.address, 10, 10)}</a>
                      </Link>
                      <br />
                      {new URL(lease.provider.hostUri).hostname}
                    </>
                  }
                  labelWidth="12rem"
                />
                <LabelValue
                  label="Provider Attributes"
                  value={lease.provider.attributes.map(attribute => (
                    <div key={attribute.key}>
                      {attribute.key}: {attribute.value}
                    </div>
                  ))}
                  labelWidth="12rem"
                />
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
