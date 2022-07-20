import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgDeleteProviderAttributes: React.FunctionComponent<TxMessageProps> = ({ message }) => {
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
        label="Auditor"
        value={
          <Link href="TODO">
            <a>{message?.data?.auditor}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Keys" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.keys))} />} />
    </>
  );
};
