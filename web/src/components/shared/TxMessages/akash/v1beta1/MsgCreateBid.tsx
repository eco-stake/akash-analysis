import { AKTLabel } from "@src/components/shared/AKTLabel";
import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateBid: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="Provider"
        value={
          <Link href={UrlService.address(message?.data?.provider)}>
            <a>{message?.data?.provider}</a>
          </Link>
        }
      />
      {/* TODO: Add link to provider page */}
      <LabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.order?.owner)}>
            <a>{message?.data?.order?.owner}</a>
          </Link>
        }
      />
      <LabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.order?.owner, message?.data?.order?.dseq)}>
            <a>{message?.data?.order?.dseq}</a>
          </Link>
        }
      />
      <LabelValue label="gseq" value={message?.data?.order?.gseq} />
      <LabelValue label="oseq" value={message?.data?.order?.oseq} />
      <LabelValue
        label="Price"
        value={
          <>
            {coinsToAmount(message?.data?.price, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <LabelValue
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
