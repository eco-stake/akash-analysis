import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { AKTLabel } from "../../AKTLabel";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgEditValidator: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing commissionRate, minSelfDelegation
  // ###################

  return (
    <>
      <MessageLabelValue
        label="Validator Address"
        value={
          <Link href={UrlService.validator(message?.data?.validatorAddress)}>
            <a>{message?.data?.validatorAddress}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Details" value={message?.data?.description?.details} />
      <MessageLabelValue label="Moniker" value={message?.data?.description?.moniker} />
      <MessageLabelValue
        label="Website"
        value={
          message?.data?.description?.website && message?.data?.description?.website !== "[do-not-modify]" ? (
            <a href={message?.data?.description?.website} target="_blank">
              {message?.data?.description?.website}
            </a>
          ) : (
            <>{message?.data?.description?.website}</>
          )
        }
      />
      <MessageLabelValue label="Identity" value={message?.data?.description?.identity} />
      <MessageLabelValue label="Security Contact" value={message?.data?.description?.securityContact} />
      <MessageLabelValue label="Commission Rate" value={message?.data?.commissionRate} />
      <MessageLabelValue
        label="Min Self Delegation"
        value={
          <>
            {typeof message?.data?.minSelfDelegation === "number" && (
              <>
                {message?.data?.minSelfDelegation}&nbsp;
                <AKTLabel />
              </>
            )}
          </>
        }
      />
    </>
  );
};
