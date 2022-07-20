import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgPauseGroup: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Owner"
        value={
          <Link href="TODO">
            <a>{message?.data?.id?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="dseq"
        value={
          <Link href="TODO">
            <a>{message?.data?.id?.dseq}</a>
          </Link>
        }
      />
      <MessageLabelValue label="gseq" value={message?.data?.id?.gseq} />
    </>
  );
};
