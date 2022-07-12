import fetch from "node-fetch";
import { indexers } from "../indexers/indexer";
import { IGenesis } from "./genesisTypes";

export async function importGenesis() {
  const response = await fetch("https://raw.githubusercontent.com/ovrclk/net/master/mainnet/genesis.json");
  const data: IGenesis = await response.json();

  for (const indexer of indexers) {
    await indexer.seed(data);
  }
}
