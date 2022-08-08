import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgPauseGroup: React.FunctionComponent<TxMessageProps> = ({ message }) => {
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
      <LabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.id?.owner, message?.data?.id?.dseq)}>
            <a>{message?.data?.id?.dseq}</a>
          </Link>
        }
      />
      <LabelValue label="gseq" value={message?.data?.id?.gseq} />
    </>
  );
};
