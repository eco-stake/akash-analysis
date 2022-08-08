import { AKTLabel } from "@src/components/shared/AKTLabel";
import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import { coinsToAmount } from "@src/utils/mathHelpers";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateDeployment: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO group resources from base 64
  // ###################
  return (
    <>
      <LabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.id?.owner)}>
            <a>{message?.data?.id?.owner}</a>
          </Link>
        }
      />
      <LabelValue
        label="dseq"
        value={
          <Link href={UrlService.deployment(message?.data?.id?.owner, message?.data?.id?.dseq)}>
            <a>{message?.data?.id?.dseq}</a>
          </Link>
        }
      />
      <LabelValue label="Version" value={message?.data?.version} />
      <LabelValue
        label="Deposit"
        value={
          <>
            {coinsToAmount(message?.data?.deposit, "uakt", 6)}&nbsp;
            <AKTLabel />
          </>
        }
      />
      <LabelValue label="Groups" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.groups))} />} />
    </>
  );
};
