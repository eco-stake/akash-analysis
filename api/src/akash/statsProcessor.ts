import base64js from "base64-js";
import { sha256 } from "js-sha256";
import { blockHeightToKey, blocksDb } from "@src/akash/dataStore";
import { Transaction, Message, Block, Op, sequelize } from "@src/db/schema";
import { AuthInfo, TxBody, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { lastBlockToSync } from "@src/shared/constants";
import { decodeMsg } from "@src/shared/utils/protobuf";
import { indexers } from "@src/indexers";
import * as benchmark from "@src/shared/utils/benchmark";

export let processingStatus = null;

function fromBase64(base64String) {
  if (!base64String.match(/^[a-zA-Z0-9+/]*={0,2}$/)) {
    throw new Error("Invalid base64 string format");
  }
  return base64js.toByteArray(base64String);
}
/**
 * Takes a serialized TxRaw (the bytes stored in Tendermint) and decodes it into something usable.
 */
function decodeTxRaw(tx) {
  const txRaw = TxRaw.decode(tx);
  return {
    authInfo: AuthInfo.decode(txRaw.authInfoBytes),
    body: TxBody.decode(txRaw.bodyBytes),
    signatures: txRaw.signatures
  };
}

async function getBlockByHeight(height) {
  const content = await blocksDb.get(height);
  return JSON.parse(content);
}

class StatsProcessor {
  private cacheInitialized: boolean = false;

  public async rebuildStatsTables() {
    console.log("Disabling foreign key checks");

    await sequelize.query("PRAGMA foreign_keys=0");

    console.log('Setting "isProcessed" to false');
    await Message.update(
      {
        isProcessed: false,
        relatedDeploymentId: null
      },
      { where: { isProcessed: true } }
    );
    await Transaction.update(
      {
        isProcessed: false
      },
      { where: { isProcessed: true } }
    );
    await Block.update(
      {
        isProcessed: false
      },
      { where: { isProcessed: true } }
    );

    console.log("Rebuilding stats tables...");

    for (const indexer of indexers) {
      await indexer.recreateTables();
    }

    console.log("Enabling foreign key checks");
    await sequelize.query("PRAGMA foreign_keys=0");

    await this.processMessages();
  }

  public async processMessages() {
    processingStatus = "Processing messages";

    console.log("Querying unprocessed messages...");

    const groupSize = 10_000;

    let previousProcessedBlock = await Block.findOne({
      where: {
        isProcessed: true
      },
      order: [["height", "DESC"]]
    });
    const firstUnprocessedHeight: number = await Block.min("height", {
      where: {
        isProcessed: false
      }
    });
    const lastUnprocessedHeight: number = await Block.max("height", {
      where: {
        isProcessed: false
      }
    });

    if (!this.cacheInitialized) {
      for (const indexer of indexers) {
        await indexer.initCache(null, firstUnprocessedHeight);
      }
      this.cacheInitialized = true;
    }

    let firstBlockToProcess = firstUnprocessedHeight;
    let lastBlockToProcess = Math.min(lastUnprocessedHeight, firstBlockToProcess + groupSize, lastBlockToSync);
    while (firstBlockToProcess <= Math.min(lastUnprocessedHeight, lastBlockToSync)) {
      console.log(`Loading blocks ${firstBlockToProcess} to ${lastBlockToProcess}`);

      const getBlocksTimer = benchmark.startTimer("getBlocks");
      const blocks = await Block.findAll({
        attributes: ["height"],
        where: {
          isProcessed: false,
          height: { [Op.gte]: firstBlockToProcess, [Op.lte]: lastBlockToProcess }
        },
        include: [
          {
            model: Transaction,
            required: false,
            where: {
              isProcessed: false,
              hasProcessingError: false
            },
            include: [
              {
                model: Message,
                required: false,
                where: {
                  isProcessed: false
                }
              }
            ]
          }
        ],
        order: [
          ["height", "ASC"],
          [Transaction, "index", "ASC"],
          [Transaction, Message, "index", "ASC"]
        ]
      });
      getBlocksTimer.end();

      const blockGroupTransaction = await sequelize.transaction();

      try {
        for (const block of blocks) {
          const getBlockByHeightTimer = benchmark.startTimer("getBlockByHeight");
          const blockData = await getBlockByHeight(blockHeightToKey(block.height));
          getBlockByHeightTimer.end();

          for (const transaction of block.transactions) {
            for (const msg of transaction.messages) {
              processingStatus = `Processing message ${msg.indexInBlock} of block #${block.height}`;

              console.log(`Processing message ${msg.type} - Block #${block.height}`);

              const decodeTimer = benchmark.startTimer("decodeTx");
              const tx = blockData.block.data.txs.find((t) => sha256(Buffer.from(t, "base64")).toUpperCase() === transaction.hash);
              const encodedMessage = decodeTxRaw(fromBase64(tx)).body.messages[msg.index].value;
              decodeTimer.end();

              await benchmark.measureAsync("processMessage", async () => {
                await this.processMessage(msg, encodedMessage, block.height, blockGroupTransaction);
              });

              if (msg.relatedDeploymentId) {
                await benchmark.measureAsync("saveRelatedDeploymentId", async () => {
                  await msg.save({ transaction: blockGroupTransaction });
                });
              }
            }
          }

          for (const indexer of indexers) {
            await indexer.afterEveryBlock(block, previousProcessedBlock, blockGroupTransaction);
          }

          await benchmark.measureAsync("blockUpdate", async () => {
            block.isProcessed = true;
            await block.save({ transaction: blockGroupTransaction });
          });
          previousProcessedBlock = block;
        }

        await benchmark.measureAsync("transactionUpdate", async () => {
          await Transaction.update(
            {
              isProcessed: true
            },
            {
              where: {
                height: { [Op.gte]: firstBlockToProcess, [Op.lte]: lastBlockToProcess }
              },
              transaction: blockGroupTransaction
            }
          );
        });

        await benchmark.measureAsync("MsgUpdate", async () => {
          await Message.update(
            {
              isProcessed: true
            },
            {
              where: {
                height: { [Op.gte]: firstBlockToProcess, [Op.lte]: lastBlockToProcess }
              },
              transaction: blockGroupTransaction
            }
          );
        });

        await benchmark.measureAsync("blockGroupTransactionCommit", async () => {
          await blockGroupTransaction.commit();
        });
      } catch (err) {
        await blockGroupTransaction.rollback();
        throw err;
      }

      firstBlockToProcess += groupSize;
      lastBlockToProcess = Math.min(lastUnprocessedHeight, firstBlockToProcess + groupSize, lastBlockToSync);
    }

    processingStatus = null;
  }

  private async processMessage(msg, encodedMessage, height: number, blockGroupTransaction) {
    for (const indexer of indexers) {
      if (indexer.hasHandlerForType(msg.type)) {
        const decodedMessage = decodeMsg(msg.type, encodedMessage);
        await indexer.processMessage(decodedMessage, height, blockGroupTransaction, msg);
      }
    }
  }
}

export const statsProcessor = new StatsProcessor();
