import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgRecvPacket: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing amount, originAmount, originDenom, receiver, sender, effected
  // ###################
  return (
    <>
      <MessageLabelValue label="Sequence" value={message?.data?.packet?.sequence} />
      <MessageLabelValue
        label="Amount"
        value={
          <>
            {/* {coinsToAmount([message?.data?.amount], "uakt", 6)}&nbsp; */}
            TODO
            <AKTLabel />
          </>
        }
      />
      <MessageLabelValue
        label="Origin Amount"
        value={
          <>
            {/* {coinsToAmount([message?.data?.amount], "uakt", 6)}&nbsp; */}
            TODO
            <AKTLabel />
          </>
        }
      />
      <MessageLabelValue
        label="Origin Denom"
        value={
          <>
            {/* {coinsToAmount([message?.data?.amount], "uakt", 6)}&nbsp; */}
            TODO
            <AKTLabel />
          </>
        }
      />
      <MessageLabelValue label="Source Port" value={message?.data?.packet?.sourcePort} />
      <MessageLabelValue label="Source Channel" value={message?.data?.packet?.sourceChannel} />
      <MessageLabelValue label="Destination Port" value={message?.data?.packet?.destinationPort} />
      <MessageLabelValue label="Destination Channel" value={message?.data?.packet?.destinationChannel} />
      <MessageLabelValue
        label="Signer"
        value={
          <Link href="TODO">
            <a>{message?.data?.signer}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Receiver"
        value={
          <Link href="TODO">
            <a>{message?.data?.signer}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Sender"
        value={
          <Link href="TODO">
            <a>{message?.data?.signer}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Effected" value={message?.data?.effected} />
    </>
  );
};
