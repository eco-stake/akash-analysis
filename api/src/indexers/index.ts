import { AkashStatsIndexer } from "./akashStatsIndexer";
import { Indexer } from "./indexer";
import { ProposalIndexer } from "./proposalIndexer";

export const indexers: Indexer[] = [new ProposalIndexer(), new AkashStatsIndexer()];