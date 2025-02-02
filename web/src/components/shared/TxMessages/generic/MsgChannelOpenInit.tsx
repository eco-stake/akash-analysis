import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { DynamicReactJson } from "../../DynamicJsonView";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgChannelOpenInit: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue label="Port Id" value={message?.data?.portId} />
      <LabelValue label="State" value={message?.data?.channel?.state} />
      <LabelValue label="Ordering" value={message?.data?.channel?.ordering} />
      <LabelValue label="Channel Id" value={message?.data?.channel?.counterparty?.channelId} />
      <LabelValue label="Connection Hops" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.channel?.connectionHops))} />} />
      <LabelValue label="Version" value={message?.data?.channel?.version} />
      <LabelValue
        label="Signer"
        value={
          <Link href={UrlService.address(message?.data?.signer)}>
            <a>{message?.data?.signer}</a>
          </Link>
        }
      />
    </>
  );
};
