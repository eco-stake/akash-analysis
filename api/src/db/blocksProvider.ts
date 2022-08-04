import { Block, Message, Transaction, Validator } from "./schema";
import { averageBlockTime } from "@src/shared/constants";
import { add } from "date-fns";
import { msgToJSON } from "@src/shared/utils/protobuf";

export async function getBlocks(limit: number) {
  const _limit = Math.min(limit, 100);
  const blocks = await Block.findAll({
    order: [["height", "DESC"]],
    limit: _limit,
    include: [
      {
        model: Transaction
      },
      {
        model: Validator,
        as: "proposerValidator",
        required: true
      }
    ]
  });

  return blocks.map((block) => ({
    height: block.height,
    proposer: {
      address: block.proposerValidator?.accountAddress,
      operatorAddress: block.proposerValidator.operatorAddress,
      moniker: block.proposerValidator.moniker,
      avatarUrl: block.proposerValidator.keybaseAvatarUrl
    },
    transactionCount: block.transactions.length,
    datetime: block.datetime
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
        model: Transaction,
        include: [Message],
        order: ["index", "ASC"]
      },
      {
        model: Validator,
        as: "proposerValidator",
        required: true
      }
    ]
  });

  if (!block) return null;

  return {
    height: block.height,
    datetime: block.datetime,
    proposer: {
      operatorAddress: block.proposerValidator.operatorAddress,
      moniker: block.proposerValidator.moniker,
      avatarUrl: block.proposerValidator.keybaseAvatarUrl,
      address: block.proposerValidator.accountAddress
    },
    hash: block.hash,
    gasUsed: block.transactions.map((tx) => tx.gasUsed).reduce((a, b) => a + b, 0),
    gasWanted: block.transactions.map((tx) => tx.gasWanted).reduce((a, b) => a + b, 0),
    transactions: block.transactions.map((tx) => ({
      hash: tx.hash,
      isSuccess: !tx.hasProcessingError,
      error: tx.hasProcessingError ? tx.log : null,
      fee: tx.fee,
      datetime: block.datetime,
      messages: tx.messages.map((message) => ({
        id: message.id,
        type: message.type,
        data: msgToJSON(message.type, message.data)
      }))
    }))
  };
}

async function getFutureBlockEstimate(height: number, latestBlock: Block) {
  return {
    height: height,
    expectedDate: add(latestBlock.datetime, { seconds: (height - latestBlock.height) * averageBlockTime })
  };
}
