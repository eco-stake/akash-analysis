import fs from "fs";
import { indexers } from "@src/indexers";
import { dataFolderPath, executionMode, ExecutionMode } from "@src/shared/constants";
import { download } from "@src/shared/utils/download";
import { bytesToHumanReadableSize } from "@src/shared/utils/files";
import { Block, Transaction, Message, sequelize, sqliteDatabasePath, Day } from "./schema";
import { createExtractorFromFile } from "node-unrar-js";

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
    const localArchivePath = dataFolderPath + "/database.rar";
    await download("https://storage.googleapis.com/akashlytics-deploy-public/database.rar", localArchivePath);
    console.log("Database downloaded");

    console.log("Extracting files...");
    const extractor = await createExtractorFromFile({ filepath: localArchivePath, targetPath: dataFolderPath });
    const { files } = extractor.extract();
    for (const file of files) {
      await file.extraction;
    }
    console.log("Deleting archive...");
    fs.promises
      .rm(localArchivePath, { force: true })
      .then(() => {
        console.log("Archive deleted");
      })
      .catch((err) => {
        console.error("Error deleting archive", err);
      });
  }

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  if (executionMode === ExecutionMode.RebuildAll) {
    for (const indexer of indexers) {
      await indexer.recreateTables();
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
