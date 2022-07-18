import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCloseLease: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Owner"
        value={
          <Link href="TODO">
            <a>{message?.data?.leaseId?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue label="dseq" value={message?.data?.leaseId?.dseq} />
      <MessageLabelValue label="gseq" value={message?.data?.leaseId?.gseq} />
      <MessageLabelValue label="oseq" value={message?.data?.leaseId?.oseq} />
        <MessageLabelValue
          label="Provider"
          value={
            <Link href="TODO">
              <a>{message?.data?.leaseId?.provider}</a>
            </Link>
          }
        />
    </>
  );
};
