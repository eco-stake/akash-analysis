import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgConnectionOpenConfirm: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing everything
  // ###################
  return (
    <>
      <LabelValue label="Connection Id" value={message?.data?.connectionId} />
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
