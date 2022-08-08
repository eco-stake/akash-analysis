import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgChannelOpenConfirm: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue label="Port Id" value={message?.data?.portId} />
      <LabelValue label="Channel Id" value={message?.data?.channelId} />
      <LabelValue label="Proof Ack" value={message?.data?.proofAck} />
      <LabelValue label="Revision Number" value={message?.data?.proofHeight?.revisionNumber} />
      <LabelValue label="Revision Height" value={message?.data?.proofHeight?.revisionHeight} />
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
