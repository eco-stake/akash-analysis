import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { AddressLink } from "../../AddressLink";
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
      <LabelValue label="Sender" value={<AddressLink address={message?.data?.sender} />} />
      <LabelValue label="Receiver" value={<AddressLink address={message?.data?.receiver} />} />
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
