import fs from "fs";
import { download } from "@src/shared/utils/download";
import { IGenesis } from "./genesisTypes";

const genesisFileUrl = "https://raw.githubusercontent.com/ovrclk/net/master/mainnet/genesis.json";
const genesisLocalPath = "./data/genesis.json";

export async function getGenesis(): Promise<IGenesis> {
  if (!fs.existsSync(genesisLocalPath)) {
    await download(genesisFileUrl, genesisLocalPath);
  }

  const fileContent = await fs.promises.readFile(genesisLocalPath, { encoding: "utf-8" });
  return JSON.parse(fileContent) as IGenesis;
}
