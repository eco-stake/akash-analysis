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
import { FormattedNumber, FormattedTime } from "react-intl";
import { ProposalDetail } from "@src/types/proposal";
import ReactMarkdown from "react-markdown";
import { getFriendlyProposalStatus } from "@src/utils/proposals";
import { useProposalStatusColor } from "@src/hooks/useProposalStatusColor";
import { Box, Chip } from "@mui/material";
import Link from "next/link";
import { UrlService } from "@src/utils/urlUtils";
import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { LabelValue } from "@src/components/shared/LabelValue";
import { Title } from "@src/components/shared/Title";
import { NextSeo } from "next-seo";

type Props = {
  id: string;
  proposal: ProposalDetail;
};

const useStyles = makeStyles()(theme => ({}));

const ProposalDetailPage: React.FunctionComponent<Props> = ({ id, proposal }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const status = getFriendlyProposalStatus(proposal.status);
  const statusColor = useProposalStatusColor(status);
  const isValidator = !!proposal.proposer.operatorAddress;

  return (
    <Layout>
      <NextSeo title={`Proposal #${id}`} />

      <PageContainer>
        <Title value="Proposal Detail" />

        <Paper sx={{ padding: 2 }} elevation={2}>
          <Box
            sx={{
              paddingBottom: "1rem",
              marginBottom: "1rem",
              borderBottom: `1px solid ${theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200]}`
            }}
          >
            <Typography variant="h3" sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              #{proposal.id}&nbsp;-&nbsp;{proposal.title}
            </Typography>
          </Box>

          <LabelValue
            label="Proposer"
            value={
              <Link href={isValidator ? UrlService.validator(proposal.proposer.operatorAddress) : UrlService.address(proposal.proposer.address)}>
                <a>{isValidator ? proposal.proposer.moniker : proposal.proposer.address}</a>
              </Link>
            }
            labelWidth="10rem"
          />
          <LabelValue
            label="Submit Time"
            value={<FormattedTime value={proposal.submitTime} day={"numeric"} month="numeric" year="numeric" />}
            labelWidth="10rem"
          />
          <LabelValue
            label="Voting Start"
            value={<FormattedTime value={proposal.votingStartTime} day={"numeric"} month="numeric" year="numeric" />}
            labelWidth="10rem"
          />
          <LabelValue
            label="Voting End"
            value={<FormattedTime value={proposal.votingEndTime} day={"numeric"} month="numeric" year="numeric" />}
            labelWidth="10rem"
          />
          <LabelValue
            label="Total Deposit"
            value={
              <>
                <FormattedNumber value={udenomToDenom(proposal.totalDeposit)} />
                &nbsp;
                <AKTLabel />
              </>
            }
            labelWidth="10rem"
          />
          <LabelValue
            label="Final Status"
            value={
              <>
                <Box sx={{ marginBottom: ".5rem" }}>
                  <Chip label={status} size="small" sx={{ backgroundColor: statusColor, color: theme.palette.secondary.contrastText }} />
                </Box>
                Yes: <FormattedNumber value={udenomToDenom(proposal.finalTally.yes)} maximumFractionDigits={0} />
                &nbsp;
                <AKTLabel /> (<FormattedNumber style="percent" value={proposal.finalTally.yes / proposal.finalTally.total} minimumFractionDigits={2} />)
                <br />
                No: <FormattedNumber value={udenomToDenom(proposal.finalTally.no)} maximumFractionDigits={0} />
                &nbsp;
                <AKTLabel /> (<FormattedNumber style="percent" value={proposal.finalTally.no / proposal.finalTally.total} minimumFractionDigits={2} />)
                <br />
                No (veto): <FormattedNumber value={udenomToDenom(proposal.finalTally.noWithVeto)} maximumFractionDigits={0} />
                &nbsp;
                <AKTLabel /> (<FormattedNumber style="percent" value={proposal.finalTally.noWithVeto / proposal.finalTally.total} minimumFractionDigits={2} />)
                <br />
                Abstain: <FormattedNumber value={udenomToDenom(proposal.finalTally.abstain)} maximumFractionDigits={0} />
                &nbsp;
                <AKTLabel /> (<FormattedNumber style="percent" value={proposal.finalTally.abstain / proposal.finalTally.total} minimumFractionDigits={2} />)
              </>
            }
            labelWidth="10rem"
          />
          {proposal.paramChanges.length > 0 && (
            <LabelValue label="Parameter Changes" value={<DynamicReactJson src={JSON.parse(JSON.stringify(proposal.paramChanges))} />} labelWidth="10rem" />
          )}
          <LabelValue
            label="Details"
            value={
              <Paper
                sx={{
                  maxHeight: { xs: "100%", sm: "300px" },
                  overflowY: "auto",
                  padding: "0 1rem",
                  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[200]
                }}
                elevation={0}
              >
                <ReactMarkdown linkTarget="_blank" remarkPlugins={[]} className="markdownContainer">
                  {proposal.description}
                </ReactMarkdown>
              </Paper>
            }
            labelWidth="10rem"
          />
        </Paper>
      </PageContainer>
    </Layout>
  );
};

export default ProposalDetailPage;

export async function getServerSideProps({ params }) {
  try {
    const proposal = await fetchProposalData(params?.id);

    return {
      props: {
        id: params?.id,
        proposal
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

async function fetchProposalData(id: string) {
  const response = await axios.get(`${BASE_API_URL}/api/proposals/${id}`);
  return response.data;
}
