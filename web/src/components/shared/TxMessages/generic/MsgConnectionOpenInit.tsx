import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgConnectionOpenInit: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue label="Client Id" value={message?.data?.clientId} />
      <LabelValue label="Counterparty Client Id" value={message?.data?.counterparty?.clientId} />
      <LabelValue label="Connection Id" value={message?.data?.counterparty?.connectionId} />
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
