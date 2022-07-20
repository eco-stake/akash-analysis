import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgBeginRedelegate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing Auto claim reward
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
        label="Source Validator Address"
        value={
          <Link href="TODO">
            <a>{message?.data?.validatorSrcAddress}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Destination Validator Address"
        value={
          <Link href="TODO">
            <a>{message?.data?.validatorDstAddress}</a>
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
    </>
  );
};
