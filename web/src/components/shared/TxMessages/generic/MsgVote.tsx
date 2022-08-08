import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgVote: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="Proposal Id"
        value={
          <Link href={UrlService.proposal(message?.data?.proposalId)}>
            <a>#{message?.data?.proposalId}</a>
          </Link>
        }
      />
      <LabelValue
        label="Voter"
        value={
          <Link href={UrlService.address(message?.data?.voter)}>
            <a>{message?.data?.voter}</a>
          </Link>
        }
      />
      <LabelValue label="Option" value={getVoteDescription(message?.data?.option)} />
    </>
  );
};

function getVoteDescription(voteOption: string) {
  switch (voteOption) {
    case "VOTE_OPTION_YES":
      return "Yes";
    case "VOTE_OPTION_NO":
      return "No";
    case "VOTE_OPTION_ABSTAIN":
      return "Abstain";
    case "VOTE_OPTION_NO_WITH_VETO":
      return "No with veto";
    default:
      return null;
  }
}
