import { AKTLabel } from "@src/components/shared/AKTLabel";
import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgUpdateDeployment: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO group resources from base 64
  // ###################
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
      <MessageLabelValue label="Version" value={message?.data?.version} />
      <MessageLabelValue label="Groups" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.groups))} />} />
    </>
  );
};
