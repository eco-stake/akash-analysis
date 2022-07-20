import { AKTLabel } from "@src/components/shared/AKTLabel";
import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateBid: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Provider"
        value={
          <Link href="TODO">
            <a>{message?.data?.provider}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Owner"
        value={
          <Link href="TODO">
            <a>{message?.data?.order?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="dseq"
        value={
          <Link href="TODO">
            <a>{message?.data?.order?.dseq}</a>
          </Link>
        }
      />
      <MessageLabelValue label="gseq" value={message?.data?.order?.dseq} />
      <MessageLabelValue label="oseq" value={message?.data?.order?.dseq} />
      <MessageLabelValue
        label="Price"
        value={
          <>
            {coinsToAmount(message?.data?.price, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <MessageLabelValue
        label="Deposit"
        value={
          <>
            {coinsToAmount(message?.data?.deposit, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
    </>
  );
};
