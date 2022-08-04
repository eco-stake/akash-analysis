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
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { ValidatorDetail } from "@src/types/validator";
import { FormattedNumber } from "react-intl";
import { useEffect, useState } from "react";
import { Avatar, Badge, Box } from "@mui/material";
import { GradientText } from "@src/components/shared/GradientText";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { FormattedDecimal } from "@src/components/shared/FormattedDecimal";

type Props = {
  errors?: string;
  address: string;
  validator: ValidatorDetail;
};

const useStyles = makeStyles()(theme => ({
  root: {
    paddingTop: "2rem",
    paddingBottom: "2rem",
    marginLeft: "0"
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginLeft: ".5rem",
    marginBottom: "1rem"
  },
  titleSmall: {
    fontSize: "1.1rem"
  },
  validatorInfoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1rem",
    "&:last-child": {
      marginBottom: 0
    }
  },
  label: {
    fontWeight: "bold",
    width: "15rem",
    flexShrink: 0
  },
  value: {
    wordBreak: "break-all",
    overflowWrap: "anywhere"
  }
}));

const ValidatorDetailPage: React.FunctionComponent<Props> = ({ address, validator, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Layout title={`Validator ${validator.moniker}`} appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
          <GradientText>Validator Details</GradientText>
        </Typography>

        <Paper sx={{ padding: 2 }} elevation={2}>
          <div className={classes.validatorInfoRow}>
            <Box style={{ display: "flex", alignItems: "center" }}>
              <Box mr={2}>
                <Badge color="secondary" badgeContent={validator.rank} overlap="circular">
                  <Avatar src={validator.keybaseAvatarUrl} sx={{ width: "5rem", height: "5rem" }} />
                </Badge>
              </Box>
              <Typography variant="h3" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {validator.moniker}
              </Typography>
            </Box>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Operator Address</div>
            <div className={classes.value}>{validator.operatorAddress}</div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Address</div>
            <div className={classes.value}>
              <Link href={UrlService.address(validator.address)}>
                <a>{validator.address}</a>
              </Link>
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Voting Power</div>
            <div className={classes.value}>
              <FormattedDecimal value={udenomToDenom(validator.votingPower, 6)} />
              &nbsp;
              <AKTLabel />
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Commission</div>
            <div className={classes.value}>
              <FormattedNumber style="percent" value={validator.commission} minimumFractionDigits={2} />
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Max Commission</div>
            <div className={classes.value}>
              <FormattedNumber style="percent" value={validator.maxCommission} minimumFractionDigits={2} />
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Max Commission Change</div>
            <div className={classes.value}>
              <FormattedNumber style="percent" value={validator.maxCommissionChange} minimumFractionDigits={2} />
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Website</div>
            <div className={classes.value}>
              {validator.website && (
                <a href={validator.website} target="_blank">
                  {validator.website}
                </a>
              )}
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Identity</div>
            <div className={classes.value}>
              {validator?.keybaseUsername ? (
                <a href={"https://keybase.io/" + validator?.keybaseUsername} target="_blank">
                  {validator.identity}
                </a>
              ) : (
                <>{validator.identity}</>
              )}
            </div>
          </div>
          <div className={classes.validatorInfoRow}>
            <div className={classes.label}>Description</div>
            <div className={classes.value}>{validator.description}</div>
          </div>
        </Paper>
      </PageContainer>
    </Layout>
  );
};

export default ValidatorDetailPage;

export async function getServerSideProps({ params }) {
  const validator = await fetchValidatorData(params?.address);

  return {
    props: {
      address: params?.address,
      validator
    }
  };
}

async function fetchValidatorData(address: string) {
  const response = await axios.get(`${BASE_API_URL}/api/validators/${address}`);
  return response.data;
}
