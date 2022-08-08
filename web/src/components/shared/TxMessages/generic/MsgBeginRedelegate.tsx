import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgBeginRedelegate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing Auto claim reward
  // ###################
  return (
    <>
      <LabelValue
        label="Delegator Address"
        value={
          <Link href={UrlService.address(message?.data?.delegatorAddress)}>
            <a>{message?.data?.delegatorAddress}</a>
          </Link>
        }
      />
      <LabelValue
        label="Source Validator Address"
        value={
          <Link href={UrlService.validator(message?.data?.validatorSrcAddress)}>
            <a>{message?.data?.validatorSrcAddress}</a>
          </Link>
        }
      />
      <LabelValue
        label="Destination Validator Address"
        value={
          <Link href={UrlService.validator(message?.data?.validatorDstAddress)}>
            <a>{message?.data?.validatorDstAddress}</a>
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
