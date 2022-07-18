import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgRevokeCertificate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
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
      <MessageLabelValue label="Serial" value={message?.data?.id?.serial} />
    </>
  );
};
