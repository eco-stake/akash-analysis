import { AkashStatsIndexer } from "./akashStatsIndexer";
import { Indexer } from "./indexer";
import { ValidatorIndexer } from "./validatorIndexer";

const akashStatsIndexer = new AkashStatsIndexer();
const validatorIndexer = new ValidatorIndexer();

export const indexers: Indexer[] = [akashStatsIndexer, validatorIndexer];
export const activeIndexers = [akashStatsIndexer, validatorIndexer];
export const indexersMsgTypes: string[] = activeIndexers.reduce((previous, current) => previous.concat(Object.keys(current.msgHandlers)), []);
