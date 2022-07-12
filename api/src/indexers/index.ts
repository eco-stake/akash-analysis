import { AkashStatsIndexer } from "./akashStatsIndexer";
import { Indexer } from "./indexer";
import { ProposalIndexer } from "./proposalIndexer";

export const indexers: Indexer[] = [new AkashStatsIndexer(), new ProposalIndexer()];
export const activeIndexers = indexers.filter(x => x.shouldSync);
export const indexersMsgTypes: string[] = activeIndexers.reduce((previous, current) => previous.concat(Object.keys(current.msgHandlers)), []);
