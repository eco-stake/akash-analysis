import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgDeposit: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing Validator
  // ###################
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
        label="Depositor Address"
        value={
          <Link href={UrlService.address(message?.data?.depositor)}>
            <a>{message?.data?.depositor}</a>
          </Link>
        }
      />
      <LabelValue
        label="Amount"
        value={
          <>
            {coinsToAmount(message?.data?.amount, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
    </>
  );
};
