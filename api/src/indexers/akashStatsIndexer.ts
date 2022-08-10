import {
  Bid,
  Block,
  Deployment,
  DeploymentGroup,
  DeploymentGroupResource,
  Lease,
  Message,
  Op,
  Provider,
  ProviderAttribute,
  ProviderAttributeSignature
} from "@src/db/schema";

import * as benchmark from "../shared/utils/benchmark";
import * as v1beta1 from "../proto/akash/v1beta1";
import * as v1beta2 from "../proto/akash/v1beta2";
import * as uuid from "uuid";
import { uint8arrayToString } from "@src/shared/utils/protobuf";
import { accountSettle } from "@src/shared/utils/akashPaymentSettle";
import { Indexer } from "./indexer";

export class AkashStatsIndexer extends Indexer {
  msgHandlers: { [key: string]: (msgSubmitProposal: any, height: number, blockGroupTransaction, msg: Message) => Promise<void> };

  private totalLeaseCount = 0;
  private activeProviderCount = 0;
  private deploymentIdCache: { [key: string]: string } = {};
  private deploymentGroupIdCache: { [key: string]: string } = {};
  private totalResources;
  private predictedClosedHeights;

  private addToDeploymentIdCache(owner: string, dseq: number, id: string) {
    this.deploymentIdCache[owner + "_" + dseq] = id;
  }
  private getDeploymentIdFromCache(owner: string, dseq: number) {
    return this.deploymentIdCache[owner + "_" + dseq];
  }

  private addToDeploymentGroupIdCache(owner: string, dseq: number, gseq: number, id: string) {
    this.deploymentGroupIdCache[owner + "_" + dseq + "_" + gseq] = id;
  }
  private getDeploymentGroupIdFromCache(owner: string, dseq: number, gseq: number): string {
    return this.deploymentGroupIdCache[owner + "_" + dseq + "_" + gseq];
  }

  constructor() {
    super();
    this.name = "AkashStatsIndexer";
    this.runForEveryBlocks = true;
    this.msgHandlers = {
      // Akash v1beta1 types
      "/akash.deployment.v1beta1.MsgCreateDeployment": this.handleCreateDeployment,
      "/akash.deployment.v1beta1.MsgCloseDeployment": this.handleCloseDeployment,
      "/akash.market.v1beta1.MsgCreateLease": this.handleCreateLease,
      "/akash.market.v1beta1.MsgCloseLease": this.handleCloseLease,
      "/akash.market.v1beta1.MsgCreateBid": this.handleCreateBid,
      "/akash.market.v1beta1.MsgCloseBid": this.handleCloseBid,
      "/akash.deployment.v1beta1.MsgDepositDeployment": this.handleDepositDeployment,
      "/akash.market.v1beta1.MsgWithdrawLease": this.handleWithdrawLease,
      "/akash.provider.v1beta1.MsgCreateProvider": this.handleCreateProvider,
      "/akash.provider.v1beta1.MsgUpdateProvider": this.handleUpdateProvider,
      "/akash.provider.v1beta1.MsgDeleteProvider": this.handleDeleteProvider,
      "/akash.audit.v1beta1.MsgSignProviderAttributes": this.handleSignProviderAttributes,
      "/akash.audit.v1beta1.MsgDeleteProviderAttributes": this.handleDeleteSignProviderAttributes,
      // Akash v1beta2 types
      "/akash.deployment.v1beta2.MsgCreateDeployment": this.handleCreateDeploymentV2,
      "/akash.deployment.v1beta2.MsgCloseDeployment": this.handleCloseDeployment,
      "/akash.market.v1beta2.MsgCreateLease": this.handleCreateLease,
      "/akash.market.v1beta2.MsgCloseLease": this.handleCloseLease,
      "/akash.market.v1beta2.MsgCreateBid": this.handleCreateBidV2,
      "/akash.market.v1beta2.MsgCloseBid": this.handleCloseBid,
      "/akash.deployment.v1beta2.MsgDepositDeployment": this.handleDepositDeployment,
      "/akash.market.v1beta2.MsgWithdrawLease": this.handleWithdrawLease,
      "/akash.provider.v1beta2.MsgCreateProvider": this.handleCreateProvider,
      "/akash.provider.v1beta2.MsgUpdateProvider": this.handleUpdateProvider,
      "/akash.provider.v1beta2.MsgDeleteProvider": this.handleDeleteProvider,
      "/akash.audit.v1beta2.MsgSignProviderAttributes": this.handleSignProviderAttributes,
      "/akash.audit.v1beta2.MsgDeleteProviderAttributes": this.handleDeleteSignProviderAttributes
    };
  }

  hasHandlerForType(type: string): boolean {
    return Object.keys(this.msgHandlers).includes(type);
  }

  @benchmark.measureMethodAsync
  async dropTables(): Promise<void> {
    await Bid.drop();
    await Lease.drop();
    await ProviderAttribute.drop();
    await ProviderAttributeSignature.drop();
    await Provider.drop();
    await DeploymentGroupResource.drop();
    await DeploymentGroup.drop();
    await Deployment.drop();
  }

  async createTables(): Promise<void> {
    await Deployment.sync({ force: false });
    await DeploymentGroup.sync({ force: false });
    await DeploymentGroupResource.sync({ force: false });
    await ProviderAttributeSignature.sync({ force: false });
    await ProviderAttribute.sync({ force: false });
    await Provider.sync({ force: false });
    await Lease.sync({ force: false });
    await Bid.sync({ force: false });
  }

  async initCache(firstBlockHeight: number) {
    this.totalResources = await this.getTotalResources(null, firstBlockHeight);
    this.predictedClosedHeights = await this.getFuturePredictedCloseHeights(firstBlockHeight, null);

    console.log("Fetching deployment id cache...");

    const existingDeployments = await Deployment.findAll({
      attributes: ["id", "owner", "dseq"]
    });

    existingDeployments.forEach((d) => this.addToDeploymentIdCache(d.owner, d.dseq, d.id));

    const existingDeploymentGroups = await DeploymentGroup.findAll({
      attributes: ["id", "owner", "dseq", "gseq"]
    });

    existingDeploymentGroups.forEach((d) => this.addToDeploymentGroupIdCache(d.owner, d.dseq, d.gseq, d.id));

    this.totalLeaseCount = await Lease.count();
    this.activeProviderCount = await Provider.count();
  }

  @benchmark.measureMethodAsync
  async afterEveryBlock(currentBlock: Block, previousBlock: Block, dbTransaction) {
    const shouldRefreshPredictedHeights = currentBlock.transactions.some((tx) => tx.messages.some((msg) => this.checkShouldRefreshPredictedCloseHeight(msg)));
    if (shouldRefreshPredictedHeights) {
      this.predictedClosedHeights = await this.getFuturePredictedCloseHeights(currentBlock.height, dbTransaction);
    }

    if (shouldRefreshPredictedHeights || this.predictedClosedHeights.includes(currentBlock.height)) {
      this.totalResources = await this.getTotalResources(dbTransaction, currentBlock.height);
    }

    currentBlock.activeProviderCount = this.activeProviderCount;
    currentBlock.activeLeaseCount = this.totalResources.count;
    currentBlock.totalLeaseCount = this.totalLeaseCount;
    currentBlock.activeCPU = this.totalResources.cpuSum;
    currentBlock.activeMemory = this.totalResources.memorySum;
    currentBlock.activeStorage = this.totalResources.storageSum;
    currentBlock.totalUAktSpent = (previousBlock?.totalUAktSpent || 0) + this.totalResources.priceSum;
  }

  @benchmark.measureMethodAsync
  private async getFuturePredictedCloseHeights(firstBlock: number, blockGroupTransaction) {
    const leases = await Lease.findAll({
      attributes: ["predictedClosedHeight"],
      where: {
        predictedClosedHeight: { [Op.gte]: firstBlock }
      },
      transaction: blockGroupTransaction
    });

    return leases.map((x) => x.predictedClosedHeight);
  }

  @benchmark.measureMethodAsync
  private async getTotalResources(blockGroupTransaction, height) {
    const totalResources = await Lease.findAll({
      attributes: ["cpuUnits", "memoryQuantity", "storageQuantity", "price"],
      where: {
        closedHeight: { [Op.is]: null },
        predictedClosedHeight: { [Op.gt]: height }
      },
      transaction: blockGroupTransaction
    });

    return {
      count: totalResources.length,
      cpuSum: totalResources.map((x) => x.cpuUnits).reduce((a, b) => a + b, 0),
      memorySum: totalResources.map((x) => x.memoryQuantity).reduce((a, b) => a + b, 0),
      storageSum: totalResources.map((x) => x.storageQuantity).reduce((a, b) => a + b, 0),
      priceSum: totalResources.map((x) => x.price).reduce((a, b) => a + b, 0)
    };
  }

  private checkShouldRefreshPredictedCloseHeight(msg: Message): boolean {
    return [
      // v1beta1
      "/akash.deployment.v1beta1.MsgCreateDeployment",
      "/akash.deployment.v1beta1.MsgCloseDeployment",
      "/akash.market.v1beta1.MsgCreateLease",
      "/akash.market.v1beta1.MsgCloseLease",
      "/akash.market.v1beta1.MsgCloseBid",
      "/akash.deployment.v1beta1.MsgDepositDeployment",
      "/akash.market.v1beta1.MsgWithdrawLease",
      // v1beta2
      "/akash.deployment.v1beta2.MsgCreateDeployment",
      "/akash.deployment.v1beta2.MsgCloseDeployment",
      "/akash.market.v1beta2.MsgCreateLease",
      "/akash.market.v1beta2.MsgCloseLease",
      "/akash.market.v1beta2.MsgCloseBid",
      "/akash.deployment.v1beta2.MsgDepositDeployment",
      "/akash.market.v1beta2.MsgWithdrawLease"
    ].includes(msg.type);
  }

  private async handleCreateDeployment(decodedMessage: v1beta1.MsgCreateDeployment, height: number, blockGroupTransaction, msg: Message) {
    const created = await Deployment.create(
      {
        id: uuid.v4(),
        owner: decodedMessage.id.owner,
        dseq: decodedMessage.id.dseq.toNumber(),
        deposit: parseInt(decodedMessage.deposit.amount),
        balance: parseInt(decodedMessage.deposit.amount),
        withdrawnAmount: 0,
        createdHeight: height,
        closedHeight: null
      },
      { transaction: blockGroupTransaction }
    );

    msg.relatedDeploymentId = created.id;

    this.addToDeploymentIdCache(decodedMessage.id.owner, decodedMessage.id.dseq.toNumber(), created.id);

    for (const group of decodedMessage.groups) {
      const createdGroup = await DeploymentGroup.create(
        {
          id: uuid.v4(),
          deploymentId: created.id,
          owner: created.owner,
          dseq: created.dseq,
          gseq: decodedMessage.groups.indexOf(group) + 1
        },
        { transaction: blockGroupTransaction }
      );
      this.addToDeploymentGroupIdCache(createdGroup.owner, createdGroup.dseq, createdGroup.gseq, createdGroup.id);

      for (const groupResource of group.resources) {
        await DeploymentGroupResource.create(
          {
            deploymentGroupId: createdGroup.id,
            cpuUnits: parseInt(uint8arrayToString(groupResource.resources.cpu.units.val)),
            memoryQuantity: parseInt(uint8arrayToString(groupResource.resources.memory.quantity.val)),
            storageQuantity: parseInt(uint8arrayToString(groupResource.resources.storage.quantity.val)),
            count: groupResource.count,
            price: parseFloat(groupResource.price.amount) // TODO: handle denom
          },
          { transaction: blockGroupTransaction }
        );
      }
    }
  }

  private async handleCreateDeploymentV2(decodedMessage: v1beta2.MsgCreateDeployment, height: number, blockGroupTransaction, msg: Message) {
    const created = await Deployment.create(
      {
        id: uuid.v4(),
        owner: decodedMessage.id.owner,
        dseq: decodedMessage.id.dseq.toNumber(),
        deposit: parseInt(decodedMessage.deposit.amount),
        balance: parseInt(decodedMessage.deposit.amount),
        withdrawnAmount: 0,
        createdHeight: height,
        closedHeight: null
      },
      { transaction: blockGroupTransaction }
    );

    msg.relatedDeploymentId = created.id;

    this.addToDeploymentIdCache(decodedMessage.id.owner, decodedMessage.id.dseq.toNumber(), created.id);

    for (const group of decodedMessage.groups) {
      const createdGroup = await DeploymentGroup.create(
        {
          id: uuid.v4(),
          deploymentId: created.id,
          owner: created.owner,
          dseq: created.dseq,
          gseq: decodedMessage.groups.indexOf(group) + 1
        },
        { transaction: blockGroupTransaction }
      );
      this.addToDeploymentGroupIdCache(createdGroup.owner, createdGroup.dseq, createdGroup.gseq, createdGroup.id);

      for (const groupResource of group.resources) {
        await DeploymentGroupResource.create(
          {
            deploymentGroupId: createdGroup.id,
            cpuUnits: parseInt(uint8arrayToString(groupResource.resources.cpu.units.val)),
            memoryQuantity: parseInt(uint8arrayToString(groupResource.resources.memory.quantity.val)),
            storageQuantity: groupResource.resources.storage.map((x) => parseInt(uint8arrayToString(x.quantity.val))).reduce((a, b) => a + b, 0),
            count: groupResource.count,
            price: parseFloat(groupResource.price.amount) // TODO: handle denom
          },
          { transaction: blockGroupTransaction }
        );
      }
    }
  }

  private async handleCloseDeployment(
    decodedMessage: v1beta1.MsgCloseDeployment | v1beta2.MsgCloseDeployment,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    const deployment = await Deployment.findOne({
      where: {
        id: this.getDeploymentIdFromCache(decodedMessage.id.owner, decodedMessage.id.dseq.toNumber())
      },
      include: [{ model: Lease }],
      transaction: blockGroupTransaction
    });

    msg.relatedDeploymentId = deployment.id;

    await accountSettle(deployment, height, blockGroupTransaction);

    for (const lease of deployment.leases) {
      if (!lease.closedHeight) {
        lease.closedHeight = height;
        await lease.save({ transaction: blockGroupTransaction });
      }
    }

    deployment.closedHeight = height;
    await deployment.save({ transaction: blockGroupTransaction });
  }

  private async handleCreateLease(decodedMessage: v1beta1.MsgCreateLease | v1beta2.MsgCreateLease, height: number, blockGroupTransaction, msg: Message) {
    const bid = await Bid.findOne({
      where: {
        owner: decodedMessage.bidId.owner,
        dseq: decodedMessage.bidId.dseq.toNumber(),
        gseq: decodedMessage.bidId.gseq,
        oseq: decodedMessage.bidId.oseq,
        provider: decodedMessage.bidId.provider
      },
      transaction: blockGroupTransaction
    });

    const deploymentGroupId = this.getDeploymentGroupIdFromCache(decodedMessage.bidId.owner, decodedMessage.bidId.dseq.toNumber(), decodedMessage.bidId.gseq);
    const deploymentGroups = await DeploymentGroupResource.findAll({
      attributes: ["count", "cpuUnits", "memoryQuantity", "storageQuantity"],
      where: {
        deploymentGroupId: deploymentGroupId
      },
      transaction: blockGroupTransaction
    });

    const deploymentId = this.getDeploymentIdFromCache(decodedMessage.bidId.owner, decodedMessage.bidId.dseq.toNumber());

    const deployment = await Deployment.findOne({
      where: {
        id: deploymentId
      },
      include: [{ model: Lease }],
      transaction: blockGroupTransaction
    });

    const { blockRate } = await accountSettle(deployment, height, blockGroupTransaction);

    const predictedClosedHeight = Math.ceil(height + deployment.balance / (blockRate + bid.price));

    await Lease.create(
      {
        id: uuid.v4(),
        deploymentId: deploymentId,
        deploymentGroupId: deploymentGroupId,
        owner: decodedMessage.bidId.owner,
        dseq: decodedMessage.bidId.dseq.toNumber(),
        oseq: decodedMessage.bidId.oseq,
        gseq: decodedMessage.bidId.gseq,
        providerAddress: decodedMessage.bidId.provider,
        createdHeight: height,
        predictedClosedHeight: predictedClosedHeight,
        price: bid.price,

        // Stats
        cpuUnits: deploymentGroups.map((x) => x.cpuUnits * x.count).reduce((a, b) => a + b, 0),
        memoryQuantity: deploymentGroups.map((x) => x.memoryQuantity * x.count).reduce((a, b) => a + b, 0),
        storageQuantity: deploymentGroups.map((x) => x.storageQuantity * x.count).reduce((a, b) => a + b, 0)
      },
      { transaction: blockGroupTransaction }
    );

    await Lease.update({ predictedClosedHeight: predictedClosedHeight }, { where: { deploymentId: deploymentId }, transaction: blockGroupTransaction });

    msg.relatedDeploymentId = deploymentId;

    this.totalLeaseCount++;
  }

  private async handleCloseLease(decodedMessage: v1beta1.MsgCloseLease | v1beta1.MsgCloseLease, height: number, blockGroupTransaction, msg: Message) {
    const deployment = await Deployment.findOne({
      where: {
        id: this.getDeploymentIdFromCache(decodedMessage.leaseId.owner, decodedMessage.leaseId.dseq.toNumber())
      },
      include: [{ model: Lease }],
      transaction: blockGroupTransaction
    });

    const lease = deployment.leases.find(
      (x) => x.oseq === decodedMessage.leaseId.oseq && x.gseq === decodedMessage.leaseId.gseq && x.providerAddress === decodedMessage.leaseId.provider
    );

    if (!lease) throw new Error("Lease not found");

    msg.relatedDeploymentId = deployment.id;

    const { blockRate } = await accountSettle(deployment, height, blockGroupTransaction);

    lease.closedHeight = height;
    await lease.save({ transaction: blockGroupTransaction });

    if (!deployment.leases.some((x) => !x.closedHeight)) {
      deployment.closedHeight = height;
      await deployment.save({ transaction: blockGroupTransaction });
    } else {
      const predictedClosedHeight = deployment.balance / (blockRate - lease.price);
      await Lease.update({ predictedClosedHeight: predictedClosedHeight }, { where: { deploymentId: deployment.id }, transaction: blockGroupTransaction });
    }
  }

  private async handleCreateBid(decodedMessage: v1beta1.MsgCreateBid, height: number, blockGroupTransaction, msg: Message) {
    await Bid.create(
      {
        owner: decodedMessage.order.owner,
        dseq: decodedMessage.order.dseq.toNumber(),
        gseq: decodedMessage.order.gseq,
        oseq: decodedMessage.order.oseq,
        provider: decodedMessage.provider,
        price: parseInt(decodedMessage.price.amount),
        createdHeight: height
      },
      { transaction: blockGroupTransaction }
    );

    msg.relatedDeploymentId = this.getDeploymentIdFromCache(decodedMessage.order.owner, decodedMessage.order.dseq.toNumber());
  }

  private async handleCreateBidV2(decodedMessage: v1beta2.MsgCreateBid, height: number, blockGroupTransaction, msg: Message) {
    await Bid.create(
      {
        owner: decodedMessage.order.owner,
        dseq: decodedMessage.order.dseq.toNumber(),
        gseq: decodedMessage.order.gseq,
        oseq: decodedMessage.order.oseq,
        provider: decodedMessage.provider,
        price: parseFloat(decodedMessage.price.amount),
        createdHeight: height
      },
      { transaction: blockGroupTransaction }
    );

    msg.relatedDeploymentId = this.getDeploymentIdFromCache(decodedMessage.order.owner, decodedMessage.order.dseq.toNumber());
  }

  private async handleCloseBid(decodedMessage: v1beta1.MsgCloseBid | v1beta2.MsgCloseBid, height: number, blockGroupTransaction, msg: Message) {
    const deployment = await Deployment.findOne({
      where: {
        id: this.getDeploymentIdFromCache(decodedMessage.bidId.owner, decodedMessage.bidId.dseq.toNumber())
      },
      include: [{ model: Lease }],
      transaction: blockGroupTransaction
    });

    msg.relatedDeploymentId = deployment.id;

    const lease = deployment.leases.find(
      (x) => x.oseq === decodedMessage.bidId.oseq && x.gseq === decodedMessage.bidId.gseq && x.providerAddress === decodedMessage.bidId.provider
    );

    if (lease) {
      const { blockRate } = await accountSettle(deployment, height, blockGroupTransaction);

      lease.closedHeight = height;
      await lease.save({ transaction: blockGroupTransaction });

      if (!deployment.leases.some((x) => !x.closedHeight)) {
        deployment.closedHeight = height;
        await deployment.save({ transaction: blockGroupTransaction });
      } else {
        const predictedClosedHeight = deployment.balance / (blockRate - lease.price);
        await Lease.update({ predictedClosedHeight: predictedClosedHeight }, { where: { deploymentId: deployment.id }, transaction: blockGroupTransaction });
      }
    }

    await Bid.destroy({
      where: {
        owner: decodedMessage.bidId.owner,
        dseq: decodedMessage.bidId.dseq.toNumber(),
        gseq: decodedMessage.bidId.gseq,
        oseq: decodedMessage.bidId.oseq,
        provider: decodedMessage.bidId.provider
      },
      transaction: blockGroupTransaction
    });
  }

  private async handleDepositDeployment(
    decodedMessage: v1beta1.MsgDepositDeployment | v1beta2.MsgDepositDeployment,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    const deployment = await Deployment.findOne({
      where: {
        id: this.getDeploymentIdFromCache(decodedMessage.id.owner, decodedMessage.id.dseq.toNumber())
      },
      include: [
        {
          model: Lease
        }
      ],
      transaction: blockGroupTransaction
    });

    msg.relatedDeploymentId = deployment.id;

    deployment.deposit += parseFloat(decodedMessage.amount.amount);
    deployment.balance += parseFloat(decodedMessage.amount.amount);
    await deployment.save({ transaction: blockGroupTransaction });

    const blockRate = deployment.leases
      .filter((x) => !x.closedHeight)
      .map((x) => x.price)
      .reduce((a, b) => a + b, 0);

    for (const lease of deployment.leases) {
      lease.predictedClosedHeight = Math.ceil((deployment.lastWithdrawHeight || lease.createdHeight) + deployment.balance / blockRate);
      await lease.save({ transaction: blockGroupTransaction });
    }
  }

  private async handleWithdrawLease(decodedMessage: v1beta1.MsgWithdrawLease | v1beta2.MsgWithdrawLease, height: number, blockGroupTransaction, msg: Message) {
    const owner = decodedMessage.bidId.owner;
    const dseq = decodedMessage.bidId.dseq.toNumber();
    const gseq = decodedMessage.bidId.gseq;
    const oseq = decodedMessage.bidId.oseq;
    const provider = decodedMessage.bidId.provider;

    const deployment = await Deployment.findOne({
      where: {
        owner: owner,
        dseq: dseq
      },
      include: [{ model: Lease }],
      transaction: blockGroupTransaction
    });

    if (!deployment) throw new Error(`Deployment not found for owner: ${owner} and dseq: ${dseq}`);

    const lease = deployment.leases.find((x) => x.gseq === gseq && x.oseq === oseq && x.providerAddress === provider);

    if (!lease) throw new Error(`Lease not found for gseq: ${gseq}, oseq: ${oseq} and provider: ${provider}`);

    await accountSettle(deployment, height, blockGroupTransaction);

    msg.relatedDeploymentId = deployment.id;
  }

  private async handleCreateProvider(
    decodedMessage: v1beta1.MsgCreateProvider | v1beta2.MsgCreateProvider,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    await Provider.create(
      {
        owner: decodedMessage.owner,
        hostUri: decodedMessage.hostUri,
        createdHeight: height,
        email: decodedMessage.info?.email,
        website: decodedMessage.info?.website
      },
      { transaction: blockGroupTransaction }
    );

    await ProviderAttribute.bulkCreate(
      decodedMessage.attributes.map((attribute) => ({
        provider: decodedMessage.owner,
        key: attribute.key,
        value: attribute.value
      })),
      { transaction: blockGroupTransaction }
    );

    this.activeProviderCount++;
  }

  private async handleUpdateProvider(
    decodedMessage: v1beta1.MsgUpdateProvider | v1beta2.MsgUpdateProvider,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    await Provider.update(
      {
        hostUri: decodedMessage.hostUri,
        createdHeight: height,
        email: decodedMessage.info?.email,
        website: decodedMessage.info?.website
      },
      {
        where: {
          owner: decodedMessage.owner
        },
        transaction: blockGroupTransaction
      }
    );

    await ProviderAttribute.destroy({
      where: {
        provider: decodedMessage.owner
      },
      transaction: blockGroupTransaction
    });
    await ProviderAttribute.bulkCreate(
      decodedMessage.attributes.map((attribute) => ({
        provider: decodedMessage.owner,
        key: attribute.key,
        value: attribute.value
      })),
      { transaction: blockGroupTransaction }
    );
  }

  private async handleDeleteProvider(
    decodedMessage: v1beta1.MsgDeleteProvider | v1beta2.MsgDeleteProvider,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    await Provider.update(
      {
        deletedHeight: height
      },
      {
        where: { owner: decodedMessage.owner },
        transaction: blockGroupTransaction
      }
    );

    this.activeProviderCount--;
  }

  private async handleSignProviderAttributes(
    decodedMessage: v1beta1.MsgSignProviderAttributes | v1beta2.MsgSignProviderAttributes,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    const provider = await Provider.findOne({ where: { owner: decodedMessage.owner }, transaction: blockGroupTransaction });

    if (!provider) {
      console.warn(`Provider ${decodedMessage.owner} not found`);
      return;
    }

    for (const attribute of decodedMessage.attributes) {
      const existingAttributeSignature = await ProviderAttributeSignature.findOne({
        where: {
          provider: decodedMessage.owner,
          auditor: decodedMessage.auditor,
          key: attribute.key
        },
        transaction: blockGroupTransaction
      });

      if (existingAttributeSignature) {
        await existingAttributeSignature.update(
          {
            value: attribute.value
          },
          { transaction: blockGroupTransaction }
        );
      } else {
        await ProviderAttributeSignature.create(
          {
            provider: decodedMessage.owner,
            auditor: decodedMessage.auditor,
            key: attribute.key,
            value: attribute.value
          },
          { transaction: blockGroupTransaction }
        );
      }
    }
  }

  private async handleDeleteSignProviderAttributes(
    decodedMessage: v1beta1.MsgDeleteProviderAttributes | v1beta2.MsgDeleteProviderAttributes,
    height: number,
    blockGroupTransaction,
    msg: Message
  ) {
    await ProviderAttributeSignature.destroy({
      where: {
        provider: decodedMessage.owner,
        auditor: decodedMessage.auditor,
        key: { [Op.in]: decodedMessage.keys }
      },
      transaction: blockGroupTransaction
    });
  }
}
