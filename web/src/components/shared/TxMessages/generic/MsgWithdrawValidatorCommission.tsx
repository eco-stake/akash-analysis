import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgWithdrawValidatorCommission: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO Missing amount + validator moniker
  // ###################
  return (
    <>
      <LabelValue
        label="Validator Address"
        value={
          <Link href={UrlService.validator(message?.data?.validatorAddress)}>
            <a>{message?.data?.validatorAddress}</a>
          </Link>
        }
      />
      {/* <MessageLabelValue label="Amount" value={"TODO"} /> */}
    </>
  );
};
