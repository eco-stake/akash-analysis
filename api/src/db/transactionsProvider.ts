import { Block, Transaction, Message } from "./schema";
import { msgToJSON } from "@src/shared/utils/protobuf";

export async function getTransactions(limit: number) {
  const _limit = Math.min(limit, 100);
  const transactions = await Transaction.findAll({
    order: [
      ["height", "DESC"],
      ["index", "ASC"]
    ],
    limit: _limit,
    include: [
      {
        model: Block,
        required: true
      },
      {
        model: Message
      }
    ]
  });

  return transactions.map((tx) => ({
    height: tx.block.height,
    datetime: tx.block.datetime,
    hash: tx.hash,
    isSuccess: !tx.hasProcessingError,
    error: tx.hasProcessingError ? tx.log : null,
    gasUsed: tx.gasUsed,
    gasWanted: tx.gasWanted,
    fee: tx.fee,
    memo: tx.memo,
    messages: tx.messages.map((msg) => ({
      id: msg.id,
      type: msg.type,
      data: msgToJSON(msg.type, msg.data)
    }))
  }));
}

export async function getTransaction(hash: string) {
  const tx = await Transaction.findOne({
    where: {
      hash: hash
    },
    include: [
      {
        model: Block,
        required: true
      },
      {
        model: Message
      }
    ]
  });

  if (!tx) return null;

  const messages = tx.messages.map((msg) => ({
    id: msg.id,
    type: msg.type,
    data: msgToJSON(msg.type, msg.data),
    relatedDeploymentId: msg.relatedDeploymentId
  }));

  return {
    height: tx.block.height,
    datetime: tx.block.datetime,
    hash: tx.hash,
    isSuccess: !tx.hasProcessingError,
    error: tx.hasProcessingError ? tx.log : null,
    gasUsed: tx.gasUsed,
    gasWanted: tx.gasWanted,
    fee: tx.fee,
    memo: tx.memo,
    messages: messages
  };
}
