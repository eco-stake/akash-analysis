import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgVote: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Proposal Id"
        value={
          <Link href="TODO">
            <a>{message?.data?.proposalId}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Voter"
        value={
          <Link href="TODO">
            <a>{message?.data?.voter}</a>
          </Link>
        }
      />
      <MessageLabelValue label="Option" value={message?.data?.option === "VOTE_OPTION_YES" ? "Yes" : "No"} />
    </>
  );
};
