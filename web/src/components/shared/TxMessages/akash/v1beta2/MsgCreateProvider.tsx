import { DynamicReactJson } from "@src/components/shared/DynamicJsonView";
import { TransactionMessage } from "@src/types";
import { UrlService } from "@src/utils/urlUtils";
import Link from "next/link";
import { LabelValue } from "../../../LabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgCreateProvider: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <LabelValue
        label="Owner"
        value={
          <Link href={UrlService.address(message?.data?.owner)}>
            <a>{message?.data?.owner}</a>
          </Link>
        }
      />
      <LabelValue label="Host Uri" value={message?.data?.hostUri} />
      <LabelValue label="Attributes" value={<DynamicReactJson src={JSON.parse(JSON.stringify(message?.data?.attributes))} />} />
      <LabelValue label="Email" value={message?.data?.info?.email} />
      <LabelValue label="Website" value={message?.data?.info?.website} />
    </>
  );
};
