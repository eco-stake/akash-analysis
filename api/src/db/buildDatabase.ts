import fs from "fs";
import { dataFolderPath, executionMode, ExecutionMode } from "@src/shared/constants";
import { download } from "@src/shared/utils/download";
import { bytesToHumanReadableSize } from "@src/shared/utils/files";
import { Block, Transaction, Message, sequelize, sqliteDatabasePath, Day } from "./schema";
import { indexers } from "@src/indexers";
import { getGenesis } from "@src/akash/genesisImporter";
import { extractLz4, extractTar } from "@src/shared/utils/archive";

/**
 * Initiate database schema
 * Restore backup from current version if it exists
 */
export const initDatabase = async () => {
  const databaseFileExists = fs.existsSync(sqliteDatabasePath);
  if (databaseFileExists && (executionMode === ExecutionMode.DownloadAndSync || executionMode === ExecutionMode.RebuildAll)) {
    console.log("Deleting existing database files.");
    await fs.promises.rm(sqliteDatabasePath, { force: true });
  }

  if (executionMode === ExecutionMode.DownloadAndSync) {
    console.log("Downloading database files...");
    const localArchivePath = dataFolderPath + "/database.tar.lz4";
    await download("https://storage.googleapis.com/akashlytics-deploy-public/database-backup/database.tar.lz4", localArchivePath);
    console.log("Database downloaded");

    console.log("Extracting lz4 file...");
    await extractLz4(localArchivePath, dataFolderPath + "/database.tar");
    console.log("Deleting lz4 file");
    await fs.promises.rm(localArchivePath, { force: true });
    console.log("Extracting tar file...");
    await extractTar(dataFolderPath + "/database.tar", dataFolderPath);
    console.log("Deleting tar archive...");
    await fs.promises.rm(dataFolderPath + "/database.tar", { force: true });
    console.log("Archive deleted");
  }

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  if (executionMode === ExecutionMode.RebuildAll) {
    const genesis = await getGenesis();
    await Message.drop();
    await Transaction.drop();
    await Block.drop();
    await Day.drop();
    for (const indexer of indexers) {
      await indexer.recreateTables();
      await indexer.seed(genesis);
    }
  }

  await Day.sync();
  await Block.sync();
  await Transaction.sync();
  await Message.sync();
};

export async function getDbSize() {
  const dbSize = await fs.promises.stat(dataFolderPath + "/database.sqlite");
  return bytesToHumanReadableSize(dbSize.size);
}
