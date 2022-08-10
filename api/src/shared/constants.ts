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

export const executionMode: ExecutionMode = false ? ExecutionMode.DownloadAndSync : ExecutionMode.SyncOnly;
export const lastBlockToSync = Number.POSITIVE_INFINITY;

export const dataFolderPath = "./data";
export const dbConnectionString = process.env.DB_CONNECTION_STRING

export const mainNet = "https://raw.githubusercontent.com/ovrclk/net/master/mainnet";
export const testNet = "https://raw.githubusercontent.com/ovrclk/net/master/testnet";
export const edgeNet = "https://raw.githubusercontent.com/ovrclk/net/master/edgenet";
