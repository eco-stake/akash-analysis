import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgConnectionOpenInit: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue label="Client Id" value={message?.data?.clientId} />
      <MessageLabelValue label="Counterparty Client Id" value={message?.data?.counterparty?.clientId} />
      <MessageLabelValue label="Connection Id" value={message?.data?.counterparty?.connectionId} />
      <MessageLabelValue
        label="Signer"
        value={
          <Link href="TODO">
            <a>{message?.data?.signer}</a>
          </Link>
        }
      />
    </>
  );
};
