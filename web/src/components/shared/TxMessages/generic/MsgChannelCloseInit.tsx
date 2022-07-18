import { TransactionMessage } from "@src/types";

type TxMessageProps = {
  message: TransactionMessage;
};

export const MsgChannelCloseInit: React.FunctionComponent<TxMessageProps> = ({ message }) => {
  return <>{JSON.stringify(message.data)}</>;
};
