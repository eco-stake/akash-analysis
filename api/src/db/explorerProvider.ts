import { Block, Transaction, Message, Deployment, Lease, Provider, ProviderAttribute, TransactionSigner, sequelize } from "./schema";
import { msgToJSON } from "@src/shared/utils/protobuf";
import { getAktMarketData } from "@src/providers/marketDataProvider";
import { averageBlockCountInAMonth, averageBlockTime } from "@src/shared/constants";
import { round } from "@src/shared/utils/math";
import { add } from "date-fns";
import { QueryTypes } from "sequelize";

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

export async function getTransaction(hash) {
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

  const signerAddresses = await TransactionSigner.findAll({
    attributes: ["address"],
    where: {
      txId: tx.id
    }
  });

  const messages = tx.messages.map((msg) => ({
    type: msg.type,
    data: msgToJSON(msg.type, msg.data)
  }));

  return {
    height: tx.block.height,
    datetime: tx.block.datetime,
    hash: tx.hash,
    multisigThreshold: tx.multisigThreshold,
    signerAddresses: signerAddresses.map((s) => s.address),
    isSuccess: !tx.hasProcessingError,
    error: tx.hasProcessingError ? tx.log : null,
    gasUsed: tx.gasUsed,
    gasWanted: tx.gasWanted,
    fee: tx.fee,
    memo: tx.memo,
    messages: messages
  };
}

export async function getDeployment(owner: string, dseq: string) {
  const deployment = await Deployment.findOne({
    where: {
      owner: owner,
      dseq: dseq
    },
    include: [
      {
        model: Lease,
        include: [
          {
            model: Provider,
            include: [{ model: ProviderAttribute }]
          }
        ]
      }
    ]
  });

  const relatedMessages = await Message.findAll({
    where: {
      relatedDeploymentId: deployment.id
    },
    include: [
      {
        model: Transaction,
        required: true
      },
      {
        model: Block,
        required: true
      }
    ],
    order: [
      ["height", "DESC"],
      ["indexInBlock", "DESC"]
    ]
  });

  const aktPrice = getAktMarketData()?.price;
  const latestBlockHeight = (await Block.max("height")) as number;

  const leases = deployment.leases.map((lease) => {
    const monthlyUAKT = Math.round(lease.price * averageBlockCountInAMonth);
    const spentUAKT = ((lease.closedHeight || latestBlockHeight) - lease.createdHeight) * lease.price;

    return {
      oseq: lease.oseq,
      gseq: lease.gseq,
      provider: {
        address: lease.provider.owner,
        isDeleted: !!lease.provider.deletedHeight,
        attributes: lease.provider.providerAttributes.map((attr) => ({
          key: attr.key,
          value: attr.value
        }))
      },
      status: lease.closedHeight ? "closed" : "active",
      costAKT: round(monthlyUAKT / 1_000_000, 2),
      costUSD: aktPrice ? round((monthlyUAKT / 1_000_000) * aktPrice, 2) : null,
      spentAKT: round(spentUAKT / 1_000_000, 2),
      spentUSD: aktPrice ? round((spentUAKT / 1_000_000) * aktPrice, 2) : null,
      cpuUnits: lease.cpuUnits,
      memoryQuantity: lease.memoryQuantity,
      storageQuantity: lease.storageQuantity
    };
  });

  return {
    owner: deployment.owner,
    dseq: deployment.dseq,
    totalCostAKT: leases.map((x) => x.costAKT).reduce((a, b) => a + b, 0),
    totalCostUSD: leases.map((x) => x.costUSD).reduce((a, b) => a + b, 0),
    leases: leases,
    events: relatedMessages.map((msg) => ({
      txHash: msg.transaction.hash,
      date: msg.block.datetime,
      type: msg.type
    }))
  };
}

export async function getAddressMessages(address: string, pageIndex: number, pageSize: number) {
  if (pageSize > 100) {
    throw new Error("Page size cannot be greater than 100");
  }
  if (pageSize < 1) {
    throw new Error("Page size cannot be less than 1");
  }
  if (pageIndex < 0) {
    throw new Error("Page index cannot be less than 0");
  }

  const selectQuery = `SELECT 
    u.type AS "type",
    u.hash AS "transaction.type",
    u.hasProcessingError AS "transaction.hasProcessingError",
    u.fee AS "transaction.fee",
    u.height AS "transaction.height",
    b.datetime AS "transaction.block.datetime"
  FROM (
  SELECT m.*,t.* FROM message m
  INNER JOIN "transaction" t ON t.id=m.txId
  INNER JOIN "transactionSigner" ts ON ts.txId=t.id AND ts.address='${address}'
  UNION
  SELECT m.*,t.* FROM message m
  INNER JOIN "transaction" t ON t.id=m.txId
  INNER JOIN messageAddressReference mar ON mar.messageId=m.id AND mar.address='${address}'
  ) u
  INNER JOIN block b ON b.height=u.height
  ORDER BY u.height ASC, u.indexInBlock ASC
  LIMIT ${pageIndex * pageSize},${pageSize}`;

  const countQuery = `SELECT COUNT(*)
  FROM (
  SELECT m.*,t.* FROM message m
  INNER JOIN "transaction" t ON t.id=m.txId
  INNER JOIN "transactionSigner" ts ON ts.txId=t.id AND ts.address='${address}'
  UNION
  SELECT m.*,t.* FROM message m
  INNER JOIN "transaction" t ON t.id=m.txId
  INNER JOIN messageAddressReference mar ON mar.messageId=m.id AND mar.address='${address}'
  ) u`;

  const messages = (await sequelize.query(selectQuery, { type: QueryTypes.SELECT, nest: true })) as Message[];
  const totalCount = (await sequelize.query(countQuery, { type: QueryTypes.SELECT, nest: true }))[0]["COUNT(*)"];

  return {
    totalCount: totalCount,
    messages: messages.map((message) => ({
      txHash: message.transaction.hash,
      messageType: message.type,
      success: !message.transaction.hasProcessingError,
      fee: message.transaction.fee,
      height: message.transaction.height,
      datetime: message.transaction.block.datetime
    }))
  };
}
