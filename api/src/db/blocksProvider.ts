import { Block, Transaction } from "./schema";
import { averageBlockTime } from "@src/shared/constants";
import { add } from "date-fns";

export async function getBlocks(limit: number) {
  const latestBlocks = await Block.findAll({
    order: [["height", "DESC"]],
    limit,
    include: [
      {
        model: Transaction
      }
    ]
  });

  return latestBlocks.map((block) => ({
    height: block.height,
    proposer: block.proposer,
    transactionCount: block.transactions.length,
    date: block.datetime
  }));
}

export async function getBlock(height: number) {
  const latestBlock = await Block.findOne({
    order: [["height", "DESC"]]
  });

  if (height > latestBlock.height) {
    return getFutureBlockEstimate(height, latestBlock);
  }

  const block = await Block.findOne({
    where: {
      height: height
    },
    include: [
      {
        model: Transaction
      }
    ]
  });

  if (!block) return null;

  return {
    height: block.height,
    datetime: block.datetime,
    hash: block.hash,
    gasUsed: block.transactions.map((tx) => tx.gasUsed).reduce((a, b) => a + b, 0),
    gasWanted: block.transactions.map((tx) => tx.gasWanted).reduce((a, b) => a + b, 0),
    transactions: block.transactions.map((tx) => ({
      hash: tx.hash,
      isSuccess: !tx.hasProcessingError,
      error: tx.hasProcessingError ? tx.log : null,
      fee: tx.fee
    }))
  };
}

async function getFutureBlockEstimate(height: number, latestBlock: Block) {
  return {
    height: height,
    expectedDate: add(latestBlock.datetime, { seconds: (height - latestBlock.height) * averageBlockTime })
  };
}