import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgTransfer: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing sequence
  // ###################
  return (
    <>
      <LabelValue
        label="Sender"
        value={
          <Link href={UrlService.address(message?.data?.sender)}>
            <a>{message?.data?.sender}</a>
          </Link>
        }
      />
      <LabelValue
        label="Receiver"
        value={
          <Link href={UrlService.address(message?.data?.receiver)}>
            <a>{message?.data?.receiver}</a>
          </Link>
        }
      />
      <LabelValue label="Source Channel" value={message?.data?.sourceChannel} />
      <LabelValue label="Port" value={message?.data?.sourcePort} />
      {/* <MessageLabelValue label="Sequence" value={"TODO"} /> */}
      <LabelValue
        label="Amount"
        value={
          <>
            {coinsToAmount(message?.data?.token, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <LabelValue label="Origin Amount" value={message?.data?.token?.amount} />
      <LabelValue label="Origin Denom" value={message?.data?.token?.denom} />
    </>
  );
};
