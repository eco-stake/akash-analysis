import { Block, Transaction, Message, Deployment, Lease, Provider, ProviderAttribute, Op } from "./schema";
import { getAktMarketData } from "@src/providers/marketDataProvider";
import { averageBlockCountInAMonth } from "@src/shared/constants";
import { round } from "@src/shared/utils/math";

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

  if (!deployment) {
    return null;
  }

  const relatedMessages = await Message.findAll({
    where: {
      relatedDeploymentId: deployment.id,
      type: {
        [Op.notIn]: [
          "/akash.market.v1beta1.MsgWithdrawLease",
          "/akash.market.v1beta2.MsgWithdrawLease",
          "/akash.market.v1beta1.MsgCreateBid",
          "/akash.market.v1beta2.MsgCreateBid",
          "/akash.market.v1beta1.MsgCloseBid",
          "/akash.market.v1beta2.MsgCloseBid"
        ]
      }
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
        hostUri: lease.provider.hostUri,
        isDeleted: !!lease.provider.deletedHeight,
        attributes: lease.provider.providerAttributes.map((attr) => ({
          key: attr.key,
          value: attr.value
        }))
      },
      status: lease.closedHeight ? "closed" : "active",
      monthlyCostAKT: round(monthlyUAKT / 1_000_000, 2),
      monthlyCostUSD: aktPrice ? round((monthlyUAKT / 1_000_000) * aktPrice, 2) : null,
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
    balance: deployment.balance,
    status: deployment.closedHeight ? "closed" : "active",
    totalMonthlyCostAKT: leases.map((x) => x.monthlyCostAKT).reduce((a, b) => a + b, 0),
    totalMonthlyCostUSD: leases.map((x) => x.monthlyCostUSD).reduce((a, b) => a + b, 0),
    leases: leases,
    events: relatedMessages.map((msg) => ({
      txHash: msg.transaction.hash,
      date: msg.block.datetime,
      type: msg.type
    }))
  };
}
