import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import Layout from "@src/components/layout/Layout";
import PageContainer from "@src/components/shared/PageContainer";
import { BASE_API_URL } from "@src/utils/constants";
import axios from "axios";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { ValidatorDetail } from "@src/types/validator";
import { FormattedNumber } from "react-intl";
import { Avatar, Badge, Box } from "@mui/material";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { FormattedDecimal } from "@src/components/shared/FormattedDecimal";
import { LabelValue } from "@src/components/shared/LabelValue";
import { NextSeo } from "next-seo";
import { Title } from "@src/components/shared/Title";

type Props = {
  address: string;
  validator: ValidatorDetail;
};

const useStyles = makeStyles()(theme => ({}));

const ValidatorDetailPage: React.FunctionComponent<Props> = ({ address, validator }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <Layout>
      <NextSeo title={`Validator ${validator.moniker}`} />

      <PageContainer>
        <Title value="Validator Details" />

        <Paper sx={{ padding: 2 }} elevation={2}>
          <Box style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
            <Box mr={2}>
              <Badge color="secondary" badgeContent={validator.rank} overlap="circular">
                <Avatar src={validator.keybaseAvatarUrl} sx={{ width: "5rem", height: "5rem" }} />
              </Badge>
            </Box>
            <Typography variant="h3" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {validator.moniker}
            </Typography>
          </Box>

          <LabelValue label="Operator Address" value={validator.operatorAddress} />
          <LabelValue
            label="Address"
            value={
              <Link href={UrlService.address(validator.address)}>
                <a>{validator.address}</a>
              </Link>
            }
          />
          <LabelValue
            label="Voting Power"
            value={
              <>
                <FormattedDecimal value={udenomToDenom(validator.votingPower, 6)} />
                &nbsp;
                <AKTLabel />
              </>
            }
          />
          <LabelValue label="Commission" value={<FormattedNumber style="percent" value={validator.commission} minimumFractionDigits={2} />} />
          <LabelValue label="Max Commission" value={<FormattedNumber style="percent" value={validator.maxCommission} minimumFractionDigits={2} />} />
          <LabelValue
            label="Max Commission Change"
            value={<FormattedNumber style="percent" value={validator.maxCommissionChange} minimumFractionDigits={2} />}
          />
          <LabelValue
            label="Website"
            value={
              validator.website && (
                <a href={validator.website} target="_blank">
                  {validator.website}
                </a>
              )
            }
          />
          <LabelValue
            label="Identity"
            value={
              validator?.keybaseUsername ? (
                <a href={"https://keybase.io/" + validator?.keybaseUsername} target="_blank">
                  {validator.identity}
                </a>
              ) : (
                <>{validator.identity}</>
              )
            }
          />
          <LabelValue label="Description" value={validator.description} />
        </Paper>
      </PageContainer>
    </Layout>
  );
};

export default ValidatorDetailPage;

export async function getServerSideProps({ params }) {
  try {
    const validator = await fetchValidatorData(params?.address);

    return {
      props: {
        address: params?.address,
        validator
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
}

async function fetchValidatorData(address: string) {
  const response = await axios.get(`${BASE_API_URL}/api/validators/${address}`);
  return response.data;
}
