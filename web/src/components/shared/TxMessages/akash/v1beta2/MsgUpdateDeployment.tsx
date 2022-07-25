import { AKTLabel } from "@src/components/shared/AKTLabel";
import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgUpdateDeployment: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.id?.owner)}>
            <a>{message?.data?.id?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.id?.owner, message?.data?.id?.dseq)}>
            <a>{message?.data?.id?.dseq}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Version" value={message?.data?.version} />
    </>
  );
};
