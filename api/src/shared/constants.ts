import minimist from "minimist";

const args = minimist(process.argv.slice(2));

export const averageBlockTime = 6.174;
export const averageDaysInMonth = 30.437;
export const averageBlockCountInAMonth = (averageDaysInMonth * 24 * 60 * 60) / averageBlockTime;
export const isProd = process.env.NODE_ENV === "production";

export enum ExecutionMode {
  DoNotSync,
  SyncOnly,
  DownloadAndSync,
  RebuildStats,
  RebuildAll
}

let executionMode: ExecutionMode = isProd ? ExecutionMode.DownloadAndSync : ExecutionMode.SyncOnly;
let lastBlockToSync = args["max-height"] || Number.POSITIVE_INFINITY;

if (args["rebuild-all"]) {
  executionMode = ExecutionMode.RebuildAll;
} else if (args["rebuild-stats"]) {
  executionMode = ExecutionMode.RebuildStats;
}

export { executionMode, lastBlockToSync };

export const dataFolderPath = "./data";

export const mainNet = "https://raw.githubusercontent.com/ovrclk/net/master/mainnet";
export const testNet = "https://raw.githubusercontent.com/ovrclk/net/master/testnet";
export const edgeNet = "https://raw.githubusercontent.com/ovrclk/net/master/edgenet";
