import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateCertificate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.owner)}>
            <a>{message?.data?.owner}</a>
          </Link>
        }
      />
      <LabelValue label="Cert" value={message?.data?.cert} />
      <LabelValue label="Pubkey" value={message?.data?.pubkey} />
    </>
  );
};
