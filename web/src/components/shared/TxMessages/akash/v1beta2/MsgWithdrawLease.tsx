import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgWithdrawLease: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.bidId?.owner)}>
            <a>{message?.data?.bidId?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Provider"
        value={
          <Link href={UrlService.address(message?.data?.bidId?.provider)}>
            <a>{message?.data?.bidId?.provider}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.bidId?.owner, message?.data?.bidId?.dseq)}>
            <a>{message?.data?.bidId?.dseq}</a>
          </Link>
        }
      />
      <MessageLabelValue label="gseq" value={message?.data?.bidId?.gseq} />
      <MessageLabelValue label="oseq" value={message?.data?.bidId?.oseq} />
    </>
  );
};
