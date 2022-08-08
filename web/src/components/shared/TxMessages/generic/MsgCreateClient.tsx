import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateClient: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  // ###################
  // TODO missing Client Id, Client Type, Chain Id, Trusting Period, Unbonding Period, Timestamp
  // ###################
  return (
    <>
      <LabelValue label="Client Id" value={message?.data?.packet?.sequence} />
      <LabelValue label="Client Type" value={message?.data?.packet?.sequence} />
      <LabelValue label="Chain Id" value={message?.data?.packet?.sequence} />
      <LabelValue label="Trusting Period" value={message?.data?.packet?.sequence} />
      <LabelValue label="Unbonding Period" value={message?.data?.packet?.sequence} />
      <LabelValue label="Timestamp" value={message?.data?.packet?.sequence} />
      <LabelValue
        label="Signer"
        value={
          <Link href={UrlService.address(message?.data?.signer)}>
            <a>{message?.data?.signer}</a>
          </Link>
        }
      />
    </>
  );
};
