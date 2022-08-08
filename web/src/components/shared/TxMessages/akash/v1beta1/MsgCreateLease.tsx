import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateLease: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="Provider"
        value={
          <Link href={UrlService.address(message?.data?.bidId?.provider)}>
            <a>{message?.data?.bidId?.provider}</a>
          </Link>
        }
      />
      {/* TODO: Add link to provider page */}
      <LabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.bidId?.owner)}>
            <a>{message?.data?.bidId?.owner}</a>
          </Link>
        }
      />
      <LabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.bidId?.owner, message?.data?.bidId?.dseq)}>
            <a>{message?.data?.bidId?.dseq}</a>
          </Link>
        }
      />
      <LabelValue label="gseq" value={message?.data?.bidId?.gseq} />
      <LabelValue label="oseq" value={message?.data?.bidId?.oseq} />
    </>
  );
};
