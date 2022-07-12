import { IGenesis } from "@src/akash/genesisTypes";
import { Block, Message } from "@src/db/schema";
import { ProposalIndexer } from "./proposalIndexer";

export interface IIndexer {
  name: string;
  msgHandlers: { [key: string]: (msgSubmitProposal: any, height: number, blockGroupTransaction, msg: Message) => Promise<void> };

  hasHandlerForType(type: string): boolean;
  getBlockProcessedProperty(Block) : boolean;
  recreateTables(): Promise<void>;
  seed(genesis: IGenesis): Promise<void>;
}

export const indexers: IIndexer[] = [new ProposalIndexer()];
