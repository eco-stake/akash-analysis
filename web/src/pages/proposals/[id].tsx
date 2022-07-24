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
import { FormattedNumber, FormattedTime } from "react-intl";
import { ProposalDetail } from "@src/types/proposal";
import ReactMarkdown from "react-markdown";
import { getFriendlyProposalStatus, getProposalParamChangeValue } from "@src/utils/proposals";

type Props = {
  errors?: string;
  id: string;
  proposal: ProposalDetail;
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
  proposalInfoRow: {
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

const ProposalDetailPage: React.FunctionComponent<Props> = ({ id, proposal, errors }) => {
  if (errors) return <Error errors={errors} />;

  const { classes } = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Layout title={`Proposal #${id}`} appendGenericTitle>
      <PageContainer>
        <Typography variant="h1" className={cx(classes.title, { [classes.titleSmall]: matches })}>
          Details for Proposal #{id}
        </Typography>

        <Paper sx={{ padding: 2 }}>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>ID</div>
            <div className={classes.value}>#{proposal.id}</div>
          </div>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Title</div>
            <div className={classes.value}>{proposal.title}</div>
          </div>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Submit Time</div>
            <div className={classes.value}>
              <FormattedTime value={proposal.submitTime} day={"numeric"} month="numeric" year="numeric" />
            </div>
          </div>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Voting Start</div>
            <div className={classes.value}>
              <FormattedTime value={proposal.votingStartTime} day={"numeric"} month="numeric" year="numeric" />
            </div>
          </div>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Voting End</div>
            <div className={classes.value}>
              <FormattedTime value={proposal.votingEndTime} day={"numeric"} month="numeric" year="numeric" />
            </div>
          </div>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Total Deposit</div>
            <div className={classes.value}>
              <FormattedNumber value={udenomToDenom(proposal.totalDeposit)} />
              &nbsp;
              <AKTLabel />
            </div>
          </div>
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Final Status</div>
            <div className={classes.value}>
              {getFriendlyProposalStatus(proposal.status)}
              <br />
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
            </div>
          </div>
          {proposal.paramChanges.length > 0 && (
            <div className={classes.proposalInfoRow}>
              <div className={classes.label}>Parameter Changes</div>
              <div className={classes.value}>
                {proposal.paramChanges.map(paramChange => (
                  <div key={paramChange.subspace + paramChange.subspace}>
                    {paramChange.key}: {getProposalParamChangeValue(paramChange.value)}
                    <br />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={classes.proposalInfoRow}>
            <div className={classes.label}>Details</div>
            <div className={classes.value}>
              <ReactMarkdown linkTarget="_blank" remarkPlugins={[]} className="markdownContainer">
                {proposal.description}
              </ReactMarkdown>
            </div>
          </div>
        </Paper>
      </PageContainer>
    </Layout>
  );
};

export default ProposalDetailPage;

export async function getServerSideProps({ params }) {
  const proposal = await fetchProposalData(params?.id);

  return {
    props: {
      id: params?.id,
      proposal
    }
  };
}

async function fetchProposalData(id: string) {
  const response = await axios.get(`${BASE_API_URL}/api/proposals/${id}`);
  return response.data;
}
