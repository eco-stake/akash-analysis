import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgSignProviderAttributes: React.FunctionComponent<TxMessageProps> = ({ message }) => {
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
        label="Owner"
        value={
          <Link href="TODO">
            <a>{message?.data?.auditor}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Attributes" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.attributes))} />} />
    </>
  );
};
