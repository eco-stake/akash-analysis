import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { getFriendlyProposalType } from "@src/utils/proposals";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgSubmitProposal: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing ProposalId, ProposalType, Title
  // ###################
  return (
    <>
      <LabelValue
        label="Initial Deposit"
        value={
          <>
            {coinsToAmount(message?.data?.initialDeposit, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <LabelValue
        label="Proposer"
        value={
          <Link href={UrlService.address(message?.data?.proposer)}>
            <a>{message?.data?.proposer}</a>
          </Link>
        }
      />
      {/* <MessageLabelValue
        label="Proposal Id"
        value={
          <Link href="TODO">
            <a>{message?.data?.proposalId}</a>
          </Link>
        }
      /> */}
      <LabelValue label="Proposal Type" value={getFriendlyProposalType(message?.data?.content.typeUrl)} />
      {/* <MessageLabelValue label="Title" value={"TODO"} /> */}
    </>
  );
};
