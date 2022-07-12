import { AkashStatsIndexer } from "./akashStatsIndexer";
import { Indexer } from "./indexer";
import { ProposalIndexer } from "./proposalIndexer";

export const indexers: Indexer[] = [new ProposalIndexer(), new AkashStatsIndexer()];
export const indexersMsgTypes: string[] = indexers.reduce((previous, current) => previous.concat(Object.keys(current.msgHandlers)), []);
