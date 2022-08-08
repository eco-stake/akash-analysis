import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgSend: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="From Address"
        value={
          <Link href={UrlService.address(message?.data?.fromAddress)}>
            <a>{message?.data?.fromAddress}</a>
          </Link>
        }
      />
      <LabelValue
        label="To Address"
        value={
          <Link href={UrlService.address(message?.data?.toAddress)}>
            <a>{message?.data?.toAddress}</a>
          </Link>
        }
      />
      <LabelValue
        label="Amount"
        value={
          <>
            {coinsToAmount(message?.data?.amount, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
    </>
  );
};
