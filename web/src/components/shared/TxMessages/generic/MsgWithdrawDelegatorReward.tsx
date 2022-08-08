import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgWithdrawDelegatorReward: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing amount + validator moniker
  // ###################
  return (
    <>
      <LabelValue
        label="Delegator Adrress"
        value={
          <Link href={UrlService.address(message?.data?.delegatorAddress)}>
            <a>{message?.data?.delegatorAddress}</a>
          </Link>
        }
      />
      <LabelValue
        label="Validator Address"
        value={
          <Link href={UrlService.validator(message?.data?.validatorAddress)}>
            <a>{message?.data?.validatorAddress}</a>
          </Link>
        }
      />
      {/* <MessageLabelValue label="Amount" value={"TODO"} /> */}
    </>
  );
};
