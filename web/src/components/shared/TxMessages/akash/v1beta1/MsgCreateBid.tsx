import { AKTLabel } from "@src/components/shared/AKTLabel";
import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { MessageLabelValue } from "../../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateBid: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Provider"
        value={
          <Link href={UrlService.address(message?.data?.provider)}>
            <a>{message?.data?.provider}</a>
          </Link>
        }
      />
      {/* TODO: Add link to provider page */}
      <MessageLabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.order?.owner)}>
            <a>{message?.data?.order?.owner}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.order?.owner, message?.data?.order?.dseq)}>
            <a>{message?.data?.order?.dseq}</a>
          </Link>
        }
      />
      <MessageLabelValue label="gseq" value={message?.data?.order?.gseq} />
      <MessageLabelValue label="oseq" value={message?.data?.order?.oseq} />
      <MessageLabelValue
        label="Price"
        value={
          <>
            {coinsToAmount(message?.data?.price, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <MessageLabelValue
        label="Deposit"
        value={
          <>
            {coinsToAmount(message?.data?.deposit, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
    </>
  );
};
