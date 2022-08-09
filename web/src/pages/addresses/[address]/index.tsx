import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import Table from "@mui/material/Table";
import { AddressDetail } from "@src/types/address";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { GradientText } from "@src/components/shared/GradientText";
import { useQRCode } from "next-qrcode";
import { Address } from "@src/components/shared/Address";
import { useState } from "react";
import { Grid, Tab, Tabs } from "@mui/material";
import { a11yTabProps } from "@src/utils/a11y";
import { Delegations } from "@src/components/address/Delegations";
import { Redelegations } from "@src/components/address/Redelegations";
import AddressLayout from "@src/components/layout/AddressLayout";
import { FormattedDecimal } from "@src/components/shared/FormattedDecimal";
import { LabelValue } from "@src/components/shared/LabelValue";
import { Title } from "@src/components/shared/Title";
import { ComingSoon } from "@src/components/ComingSoon";
import { NextSeo } from "next-seo";

type Props = {
  address: string;
  addressDetail: AddressDetail;
};

const useStyles = makeStyles()(theme => ({}));

const AddressDetailPage: React.FunctionComponent<Props> = ({ address, addressDetail }) => {
  const [assetTab, setAssetTab] = useState("delegations");
  const { classes } = useStyles();
  const { Canvas } = useQRCode();
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setAssetTab(newValue);
  };

  return (
    <Layout>
      <NextSeo title={`Account ${address}`} />

      <AddressLayout page="address" address={address}>
        <Paper sx={{ padding: 2 }} elevation={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              [theme.breakpoints.down("sm")]: {
                flexDirection: "column",
                alignItems: "flex-start"
              }
            }}
          >
            <Canvas
              text={address}
              options={{
                type: "image/jpeg",
                quality: 0.3,
                level: "M",
                margin: 2,
                scale: 4,
                width: 175,
                color: {
                  dark: theme.palette.secondary.main,
                  light: theme.palette.primary.main
                }
              }}
            />
            <Box sx={{ paddingLeft: { xs: 0, sm: "1rem" }, paddingTop: { xs: "1rem" }, flexGrow: 1 }}>
              <LabelValue
                label="Address"
                value={
                  <Box sx={{ color: theme.palette.secondary.main }}>
                    <Address address={address} isCopyable disableTruncate />
                  </Box>
                }
                labelWidth="10rem"
              />

              <Box
                sx={{
                  marginBottom: "1rem",
                  paddingBottom: ".5rem",
                  borderBottom: `1px solid ${theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200]}`,
                  fontSize: "1.5rem"
                }}
              >
                <LabelValue
                  label={
                    <GradientText>
                      <strong>AKT</strong>
                    </GradientText>
                  }
                  value={<FormattedDecimal value={udenomToDenom(addressDetail.available + addressDetail.delegated + addressDetail.rewards + addressDetail.commission, 6)} />}
                  labelWidth="10rem"
                />
              </Box>

              <LabelValue label="Available" value={<FormattedDecimal value={udenomToDenom(addressDetail.available, 6)} />} labelWidth="10rem" />
              <LabelValue label="Delegated" value={<FormattedDecimal value={udenomToDenom(addressDetail.delegated, 6)} />} labelWidth="10rem" />
              <LabelValue label="Rewards" value={<FormattedDecimal value={udenomToDenom(addressDetail.rewards, 6)} />} labelWidth="10rem" />
              <LabelValue label="Commission" value={<FormattedDecimal value={udenomToDenom(addressDetail.commission, 6)} />} labelWidth="10rem" />
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: "1rem" }}>
          <Title value="Assets" subTitle sx={{ marginBottom: "1rem" }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ padding: 2, height: "100%" }} elevation={2}>
                {/** TODO improve */}
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="center">Amount</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {addressDetail.assets.map(asset => (
                        <TableRow key={asset.denom}>
                          <TableCell>{asset.denom}</TableCell>
                          <TableCell align="center">{asset.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Paper sx={{ padding: 2, height: "100%" }} elevation={2}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 1 }}>
                  <Tabs value={assetTab} onChange={handleTabChange} aria-label="assets table" textColor="secondary" indicatorColor="secondary">
                    <Tab value="delegations" label="Delegations" {...a11yTabProps("delegation-tab", "delegation-tab-panel", 0)} />
                    <Tab value="redelegations" label="Redelegations" {...a11yTabProps("redelegations-tab", "redelegations-tab-panel", 1)} />
                  </Tabs>
                </Box>

                {assetTab === "delegations" && <Delegations delegations={addressDetail.delegations} />}
                {assetTab === "redelegations" && <Redelegations redelegations={addressDetail.redelegations} />}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: "1rem" }}>
          <Title value="Transactions" subTitle sx={{ marginBottom: "1rem" }} />

          <ComingSoon />
        </Box>
      </AddressLayout>
    </Layout>
  );
};

export default AddressDetailPage;

export const getServerSideProps = async ({ params }) => {
  try {
    const addressDetail = await fetchAddressData(params?.address);

    return {
      props: {
        address: params?.address,
        addressDetail
      }
    };
  } catch (error) {
    if (error.response.status === 404) {
      return {
        notFound: true
      };
    } else {
      throw error;
    }
  }
};

async function fetchAddressData(address: string) {
  const response = await axios.get(`${BASE_API_URL}/api/addresses/${address}`);
  return response.data;
}
