import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgDelegate: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing auto claim reward + validator moniker
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
        label="Validator Address"
        value={
          <Link href={UrlService.validator(message?.data?.validatorAddress)}>
            <a>{message?.data?.validatorAddress}</a>
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
      {/* TODO: Add auto claim reward */}
      {/* <MessageLabelValue
        label="Auto Claim Reward"
        value={
          <>
            {coinsToAmount(message?.data?.amount, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      /> */}
    </>
  );
};
