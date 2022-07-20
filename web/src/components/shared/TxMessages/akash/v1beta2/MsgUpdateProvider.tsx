import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgUpdateProvider: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Owner"
        value={
          <Link href="TODO">
            <a>{message?.data?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Host Uri"
        value={
          <Link href="TODO">
            <a>{message?.data?.hostUri}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Attributes" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.attributes))} />} />
      <MessageLabelValue label="Email" value={message?.data?.info?.email} />
      <MessageLabelValue label="Website" value={message?.data?.info?.website} />
    </>
  );
};
