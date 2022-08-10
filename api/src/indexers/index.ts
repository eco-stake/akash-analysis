import { AkashStatsIndexer } from "./akashStatsIndexer";
import { Indexer } from "./indexer";
import { ValidatorIndexer } from "./validatorIndexer";
import { BankIndexer } from "./bankIndexer";

const akashStatsIndexer = new AkashStatsIndexer();
const validatorIndexer = new ValidatorIndexer();
const bankIndexer = new BankIndexer();

export const indexers: Indexer[] = [akashStatsIndexer, validatorIndexer, bankIndexer];
export const activeIndexers = [akashStatsIndexer, validatorIndexer, bankIndexer];
export const indexersMsgTypes: string[] = activeIndexers.reduce((previous, current) => previous.concat(Object.keys(current.msgHandlers)), []);
