export enum SelectedRange {
  "7D" = 7,
  "1M" = 30,
  "ALL" = Number.MAX_SAFE_INTEGER
}

export const drawerWidth = 280;
export const BASE_API_URL = process.env.API_BASE_URL || "http://localhost:3080";

export const rpcEndpoint = "http://65.108.125.182:26657/";
export const restEndpoint = "http://65.108.125.182:1317/";
export const chainId = "test-1"; // test_node.sh
export const uDenom = "TODO_REPLACE";