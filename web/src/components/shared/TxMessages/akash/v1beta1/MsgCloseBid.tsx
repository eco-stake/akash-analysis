import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCloseBid: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Provider"
        value={
          <Link href="TODO">
            <a>{message?.data?.bidId?.provider}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Owner"
        value={
          <Link href="TODO">
            <a>{message?.data?.bidId?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue label="dseq" value={message?.data?.bidId?.dseq} />
      <MessageLabelValue label="gseq" value={message?.data?.bidId?.gseq} />
      <MessageLabelValue label="oseq" value={message?.data?.bidId?.oseq} />
    </>
  );
};
