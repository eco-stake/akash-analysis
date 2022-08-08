import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgRevokeCertificate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.id?.owner)}>
            <a>{message?.data?.id?.owner}</a>
          </Link>
        }
      />
      <LabelValue label="Serial" value={message?.data?.id?.serial} />
    </>
  );
};
