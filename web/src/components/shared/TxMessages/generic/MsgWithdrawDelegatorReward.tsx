import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgWithdrawDelegatorReward: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing amount
  // ###################
  return (
    <>
      <MessageLabelValue
        label="Delegator Adrress"
        value={
          <Link href="TODO">
            <a>{message?.data?.delegatorAddress}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Validator Address"
        value={
          <Link href="TODO">
            <a>{message?.data?.validatorAddress} (TODO VALIDATOR)</a>
          </Link>
        }
      />
      <MessageLabelValue label="Amount" value={"TODO"} />
    </>
  );
};
