import { TransactionMessage } from "./transaction";

export interface Block {
  datetime: string;
  height: number;
  proposer: string;
  transactionCount: number;
}

export interface BlockDetail {
  height: number;
  proposer: {
    operatorAddress: string;
    moniker: string;
    avatarUrl: string;
  };
  datetime: string;
  hash: string;
  gasUsed: number;
  gasWanted: number;
  transactions: BlockTransaction[];
}

export interface BlockTransaction {
  hash: string;
  isSuccess: boolean;
  error: string;
  fee: number;
  messages: TransactionMessage[];
}
