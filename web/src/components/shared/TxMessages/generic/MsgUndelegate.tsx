import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgUndelegate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing auto claim reward
  // ###################
  return (
    <>
      <MessageLabelValue
        label="Delegator Address"
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
            <a>{message?.data?.validatorAddress}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Amount"
        value={
          <>
            {coinsToAmount(message?.data?.amount, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <MessageLabelValue
        label="Auto Claim Reward"
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
