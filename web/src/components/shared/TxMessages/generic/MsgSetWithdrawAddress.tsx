import { TransactionMessage } from "@src/types";
import Link from "next/link";
import { MessageLabelValue } from "../MessageLabelValue";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgSetWithdrawAddress: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return (
    <>
      <MessageLabelValue
        label="Delegator Adrress"
        value={
          <Link href="TODO">
            <a>{message?.data?.delegatorAddress}</a>
          </Link>
        }
      />
      <MessageLabelValue
        label="Withdraw Address"
        value={
          <Link href="TODO">
            <a>{message?.data?.withdrawAddress}</a>
          </Link>
        }
      />
    </>
  );
};
