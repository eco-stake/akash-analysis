import { Block, Transaction, Message, Deployment, Op } from "./schema";

export async function getDeploymentRelatedMessages(owner: string, dseq: number) {
  const deployment = await Deployment.findOne({
    attributes: ["id"],
    where: {
      owner: owner,
      dseq: dseq
    }
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

  return relatedMessages.map((msg) => ({
    txHash: msg.transaction.hash,
    date: msg.block.datetime,
    type: msg.type
  }));
}
