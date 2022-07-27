import fs from "fs";
import { statsProcessor } from "./statsProcessor";
import { blockHeightToKey, blocksDb, deleteCache, getCachedBlockByHeight, getCachedTxByHash, txsDb } from "./dataStore";
import { createNodeAccessor } from "./nodeAccessor";
import { Block, Transaction, Message, Op, Day, sequelize } from "@src/db/schema";
import { sha256 } from "js-sha256";
import { dataFolderPath, isProd, lastBlockToSync } from "@src/shared/constants";
import { isEqual } from "date-fns";
import { decodeTxRaw, fromBase64 } from "@src/shared/utils/types";
import * as benchmark from "../shared/utils/benchmark";
import * as uuid from "uuid";

export let syncingStatus = null;

const nodeAccessor = createNodeAccessor();

async function getLatestDownloadedHeight() {
  if (fs.existsSync(dataFolderPath + "/latestDownloadedHeight.txt")) {
    const fileContent = await fs.promises.readFile(dataFolderPath + "/latestDownloadedHeight.txt", { encoding: "utf-8" });
    return parseInt(fileContent);
  } else {
    return 0;
  }
}

async function saveLatestDownloadedHeight(height) {
  await fs.promises.writeFile(dataFolderPath + "/latestDownloadedHeight.txt", height.toString(), { encoding: "utf-8" });
}

export async function syncBlocks() {
  try {
    syncingStatus = "Fetching latest block";

    const status = await nodeAccessor.fetch("/status");
    const latestAvailableHeight = parseInt(status.result.sync_info.latest_block_height);
    const latestBlockToDownload = Math.min(lastBlockToSync, latestAvailableHeight);

    let latestDownloadedHeight = await getLatestDownloadedHeight();

    if (latestDownloadedHeight >= latestBlockToDownload) {
      console.log("Already downloaded all blocks");
    } else {
      const startHeight = latestDownloadedHeight + 1;
      console.log("Starting download at block #" + startHeight);
      console.log("Will end download at block #" + latestBlockToDownload);
      console.log(latestBlockToDownload - startHeight + " blocks to download");

      await benchmark.measureAsync("downloadBlocks", async () => {
        await downloadBlocks(startHeight, latestBlockToDownload);
      });
    }

    let latestInsertedHeight: number = (await Block.max("height")) || 0;

    await benchmark.measureAsync("insertBlocks", async () => {
      await insertBlocks(latestInsertedHeight + 1, latestBlockToDownload);
    });

    await benchmark.measureAsync("downloadTransactions", async () => {
      await downloadTransactions();
    });

    syncingStatus = "Processing messages";

    await benchmark.measureAsync("processMessages", async () => {
      await statsProcessor.processMessages();
    });

    benchmark.displayTimes();
  } catch (err) {
    console.error("Error while syncing", err);
    throw err;
  } finally {
    syncingStatus = "Done";
  }

  if (isProd) {
    await deleteCache();
  }
}

async function insertBlocks(startHeight, endHeight) {
  const blockCount = endHeight - startHeight + 1;
  console.log("Inserting " + blockCount + " blocks into database");
  syncingStatus = "Inserting blocks";

  let lastInsertedBlock = (await Block.findOne({
    include: [
      {
        model: Day,
        required: true
      }
    ],
    order: [["height", "DESC"]]
  })) as any;

  let blocksToAdd = [];
  let txsToAdd = [];
  let msgsToAdd = [];

  for (let i = startHeight; i <= endHeight; ++i) {
    syncingStatus = `Inserting block #${i} / ${endHeight}`;

    const blockData = await getCachedBlockByHeight(i);

    if (!blockData) throw "Block # " + i + " was not in cache";

    let msgIndexInBlock = 0;
    const blockDatetime = new Date(blockData.block.header.time);

    const txs = blockData.block.data.txs;
    for (let txIndex = 0; txIndex < txs.length; ++txIndex) {
      const tx = txs[txIndex];
      const hash = sha256(Buffer.from(tx, "base64")).toUpperCase();
      const txId = uuid.v4();

      const decodedTx = decodeTxRaw(fromBase64(tx));
      const msgs = decodedTx.body.messages;

      for (let msgIndex = 0; msgIndex < msgs.length; ++msgIndex) {
        const msg = msgs[msgIndex];

        msgsToAdd.push({
          id: uuid.v4(),
          txId: txId,
          type: msg.typeUrl,
          typeCategory: msg.typeUrl.split(".")[0].substring(1),
          index: msgIndex,
          height: i,
          indexInBlock: msgIndexInBlock++,
          data: Buffer.from(msg.value)
        });
      }

      txsToAdd.push({
        id: txId,
        hash: hash,
        height: i,
        index: txIndex,
        fee: decodedTx.authInfo.fee.amount.length > 0 ? parseInt(decodedTx.authInfo.fee.amount[0].amount) : 0,
        memo: decodedTx.body.memo
      });
    }

    const blockEntry = {
      height: i,
      datetime: new Date(blockData.block.header.time),
      hash: blockData.block_id.hash,
      proposer: blockData.block.header.proposer_address,
      totalTxCount: (lastInsertedBlock?.totalTxCount || 0) + txs.length,
      dayId: lastInsertedBlock?.dayId,
      day: lastInsertedBlock?.day
    };

    const blockDate = new Date(Date.UTC(blockDatetime.getUTCFullYear(), blockDatetime.getUTCMonth(), blockDatetime.getUTCDate()));

    if (!lastInsertedBlock || !isEqual(blockDate, lastInsertedBlock.day.date)) {
      console.log("Creating day: ", blockDate, i);
      const newDay = await Day.create({
        id: uuid.v4(),
        date: blockDate,
        firstBlockHeight: i,
        lastBlockHeightYet: i
      });

      blockEntry.dayId = newDay.id;
      blockEntry.day = newDay;

      if (lastInsertedBlock) {
        lastInsertedBlock.day.lastBlockHeight = lastInsertedBlock.height;
        lastInsertedBlock.day.lastBlockHeightYet = lastInsertedBlock.height;
        await lastInsertedBlock.day.save();
      }
    }
    lastInsertedBlock = blockEntry;

    blocksToAdd.push(blockEntry);

    if (blocksToAdd.length >= 1_000 || i === endHeight) {
      const insertDbTransaction = await sequelize.transaction();
      await Block.bulkCreate(blocksToAdd, { transaction: insertDbTransaction });
      await Transaction.bulkCreate(txsToAdd, { transaction: insertDbTransaction });
      await Message.bulkCreate(msgsToAdd, { transaction: insertDbTransaction });

      blocksToAdd = [];
      txsToAdd = [];
      msgsToAdd = [];
      console.log(`Blocks added to db: ${i - startHeight + 1} / ${blockCount} (${(((i - startHeight + 1) * 100) / blockCount).toFixed(2)}%)`);

      if (lastInsertedBlock) {
        lastInsertedBlock.day.lastBlockHeightYet = lastInsertedBlock.height;
        await lastInsertedBlock.day.save({ transaction: insertDbTransaction });
      }

      await insertDbTransaction.commit();
    }
  }
}

async function downloadBlocks(startHeight: number, endHeight: number) {
  syncingStatus = "Downloading blocks";
  const missingBlockCount = endHeight - startHeight;
  let shouldStop = false;

  for (let height = startHeight; height <= endHeight && !shouldStop; height++) {
    syncingStatus = `Downloading block #${height} / ${endHeight}`;
    await nodeAccessor.waitForAvailableNode();

    const cachedBlock = await getCachedBlockByHeight(height);

    if (!cachedBlock) {
      nodeAccessor
        .fetch("/block?height=" + height, async (blockJson) => {
          await blocksDb.put(blockHeightToKey(height), JSON.stringify(blockJson.result));
        })
        .catch((err) => {
          console.error(err);
          shouldStop = err;
        });
    }

    if (!cachedBlock || height % 1000 === 0) {
      console.clear();
      console.log("Current height: " + height + " / " + endHeight);
      console.log("Progress: " + (((height - startHeight) * 100) / missingBlockCount).toFixed(2) + "%");

      if (!isProd) {
        nodeAccessor.displayTable();
      }
    }
  }

  await nodeAccessor.waitForAllFinished();

  syncingStatus = "Saving latest downloaded height";

  if (shouldStop) throw shouldStop;

  saveLatestDownloadedHeight(endHeight);
}

async function downloadTransactions() {
  syncingStatus = "Downloading transactions";
  console.log(syncingStatus);

  const missingTxCount = await Transaction.count({ where: { downloaded: false } });
  const txGroupSize = 50_000;
  const txGroupCount = Math.ceil(missingTxCount / txGroupSize);

  for (let groupIndex = 0; groupIndex < txGroupCount; groupIndex++) {
    syncingStatus = `Fetching missing txs ${groupIndex * txGroupSize}-${Math.min(missingTxCount, (groupIndex + 1) * txGroupSize)} from db`;
    console.log(syncingStatus);

    const missingTransactions = await Transaction.findAll({
      attributes: ["id", "hash", "height"],
      where: { downloaded: false },
      order: [["height", "ASC"]],
      limit: txGroupSize
    });

    let shouldStop = false;
    let highestHeight = 0;

    const groupTransaction = await sequelize.transaction();

    let promises = [];
    for (let i = 0; i < missingTransactions.length; ++i) {
      const txIndex = groupIndex * txGroupSize + i;
      syncingStatus = `Downloading transaction ${i} / ${missingTransactions.length}`;
      const hash = missingTransactions[i].hash;
      highestHeight = missingTransactions[i].height;

      await nodeAccessor.waitForAvailableNode();

      const cachedTx = await getCachedTxByHash(hash);

      const updateTx = async (txJson) => {
        await missingTransactions[i].update(
          {
            downloaded: true,
            hasDownloadError: !txJson.tx,
            hasProcessingError: !!txJson.tx_result.code,
            log: !!txJson.tx_result.code ? txJson.tx_result.log : null,
            gasUsed: parseInt(txJson.tx_result.gas_used),
            gasWanted: parseInt(txJson.tx_result.gas_wanted)
          },
          { transaction: groupTransaction }
        );
      };

      if (!cachedTx) {
        promises.push(
          nodeAccessor
            .fetch("/tx?hash=0x" + hash, async (txJson) => {
              await txsDb.put(hash, JSON.stringify(txJson.result));
              await updateTx(txJson.result);
            })
            .catch((err) => {
              logFailedTx(hash);
              console.error(err);
              shouldStop = err;
            })
        );
      } else {
        await updateTx(cachedTx);
      }

      if (!cachedTx || i % 100 === 0) {
        console.clear();
        console.log(`Current tx: ${txIndex} / ${missingTxCount} (Group ${groupIndex + 1} of ${txGroupCount})`);
        console.log("Progress: " + ((txIndex * 100) / missingTxCount).toFixed(2) + "%");

        if (!isProd) {
          nodeAccessor.displayTable();
        }
      }
    }

    await Promise.all(promises);
    await groupTransaction.commit();

    console.clear();
    console.log("Current tx: " + missingTxCount + " / " + missingTxCount);
    console.log("Progress: 100%");

    nodeAccessor.displayTable();

    if (shouldStop) throw shouldStop;

    await nodeAccessor.waitForAllFinished();
  }
}

const logFailedTx = async (tx) => {
  let failedTx = [];
  if (fs.existsSync("./data/failedTx.json")) {
    failedTx = JSON.parse(fs.readFileSync("./data/failedTx.json", "utf-8"));
  }

  if (!failedTx.includes(tx)) {
    failedTx.push(tx);
  }

  fs.writeFileSync("./data/failedTx.json", JSON.stringify(failedTx));
};
