import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateValidator: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO minSelftDelegation as a coin + validator moniker
  // TODO commissions DecCoin
  // ###################
  console.log(message);
  return (
    <>
      <LabelValue
        label="Min Self Delegation"
        value={
          <>
            {/* {coinsToAmount([message?.data?.minSelfDelegation], "uakt", 6)}&nbsp; */}
            {message?.data?.minSelfDelegation}&nbsp;
            <AKTLabel />
          </>
        }
      />
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
        label="Value"
        value={
          <>
            {coinsToAmount(message?.data?.value, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <LabelValue label="Details" value={message?.data?.description?.details} />
      <LabelValue label="Moniker" value={message?.data?.description?.moniker} />
      <LabelValue
        label="Website"
        value={
          <a href={message?.data?.description?.website} target="_blank">
            {message?.data?.description?.website}
          </a>
        }
      />
      <LabelValue label="Identity" value={message?.data?.description?.identity} />
      <LabelValue label="Security Contact" value={message?.data?.description?.securityContact} />
      <LabelValue label="Commission Rate" value={message?.data?.commission?.rate} />
      <LabelValue label="Commission Max Rate" value={message?.data?.commission?.maxRate} />
      <LabelValue label="Commission Max Change Rate" value={message?.data?.commission?.maxChangeRate} />
      <LabelValue label="Public Key" value={message?.data?.pubkey?.value} />
    </>
  );
};
