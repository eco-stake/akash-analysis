import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Link from "next/link";
import { udenomToDenom } from "@src/utils/mathHelpers";
import { AKTLabel } from "@src/components/shared/AKTLabel";
import { FormattedNumber, FormattedTime } from "react-intl";
import { UrlService } from "@src/utils/urlUtils";
import { ProposalSummary } from "@src/types/proposal";
import { getFriendlyProposalStatus } from "@src/utils/proposals";

type Props = {
  errors?: string;
  proposal: ProposalSummary;
};

export const ProposalRow: React.FunctionComponent<Props> = ({ proposal }) => {
  return (
    <TableRow>
      <TableCell>#{proposal.id}</TableCell>
      <TableCell>
        <Link href={UrlService.proposal(proposal.id)}>
          <a>{proposal.title}</a>
        </Link>
      </TableCell>
      <TableCell>{getFriendlyProposalStatus(proposal.status)}</TableCell>
      <TableCell>
        <FormattedTime value={proposal.submitTime} day={"numeric"} month="numeric" year="numeric" />
      </TableCell>
      <TableCell>
        <FormattedTime value={proposal.votingEndTime} day={"numeric"} month="numeric" year="numeric" />
      </TableCell>
      <TableCell>
        <FormattedNumber value={udenomToDenom(proposal.totalDeposit)} />
        &nbsp;
        <AKTLabel />
      </TableCell>
    </TableRow>
  );
};
