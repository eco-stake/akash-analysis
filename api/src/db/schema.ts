import { dataFolderPath } from "@src/shared/constants";
import { Sequelize, DataTypes, UUIDV4, Model, Association } from "sequelize";

export const sqliteDatabasePath = dataFolderPath + "/database.sqlite";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: sqliteDatabasePath,
  logging: false,
  define: {
    freezeTableName: true
  }
});

export { Op, Sequelize } from "sequelize";

export class Provider extends Model {
  public owner: string;
  public hostUri: string;
  public createdHeight: number;
  public deletedHeight?: number;
  public email?: string;
  public website?: string;

  // Stats
  public isOnline?: boolean;
  public lastCheckDate?: Date;
  public error?: string;
  public deploymentCount?: number;
  public leaseCount?: number;
  public activeCPU?: number;
  public activeMemory?: number;
  public activeStorage?: number;
  public pendingCPU?: number;
  public pendingMemory?: number;
  public pendingStorage?: number;
  public availableCPU?: number;
  public availableMemory?: number;
  public availableStorage?: number;

  public readonly providerAttributes?: ProviderAttribute[];
  public readonly providerAttributeSignatures?: ProviderAttributeSignature[];
}

Provider.init(
  {
    owner: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    hostUri: { type: DataTypes.STRING, allowNull: false },
    createdHeight: { type: DataTypes.INTEGER, allowNull: false },
    deletedHeight: { type: DataTypes.INTEGER, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },

    // Stats
    isOnline: { type: DataTypes.BOOLEAN, allowNull: true },
    lastCheckDate: { type: DataTypes.DATE, allowNull: true },
    error: { type: DataTypes.STRING, allowNull: true },
    deploymentCount: { type: DataTypes.INTEGER, allowNull: true },
    leaseCount: { type: DataTypes.INTEGER, allowNull: true },
    activeCPU: { type: DataTypes.BIGINT, allowNull: true },
    activeMemory: { type: DataTypes.BIGINT, allowNull: true },
    activeStorage: { type: DataTypes.BIGINT, allowNull: true },
    pendingCPU: { type: DataTypes.BIGINT, allowNull: true },
    pendingMemory: { type: DataTypes.BIGINT, allowNull: true },
    pendingStorage: { type: DataTypes.BIGINT, allowNull: true },
    availableCPU: { type: DataTypes.BIGINT, allowNull: true },
    availableMemory: { type: DataTypes.BIGINT, allowNull: true },
    availableStorage: { type: DataTypes.BIGINT, allowNull: true }
  },
  {
    tableName: "provider",
    modelName: "provider",
    indexes: [{ unique: false, fields: ["owner"] }],
    sequelize
  }
);

export class ProviderAttribute extends Model {
  public provider: string;
  public key: string;
  public value: string;
}

ProviderAttribute.init(
  {
    provider: { type: DataTypes.STRING, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: "providerAttribute",
    modelName: "providerAttribute",
    indexes: [{ unique: false, fields: ["provider"] }],
    sequelize
  }
);

export class ProviderAttributeSignature extends Model {
  public owner: string;
  public auditor: string;
  public key: string;
  public value: string;
}

ProviderAttributeSignature.init(
  {
    provider: { type: DataTypes.STRING, allowNull: false },
    auditor: { type: DataTypes.STRING, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: "providerAttributeSignature",
    modelName: "providerAttributeSignature",
    indexes: [{ unique: false, fields: ["provider"] }],
    sequelize
  }
);

export class Lease extends Model {
  public id!: string;
  public deploymentId!: string;
  public readonly deployment: Deployment;
  public deploymentGroupId!: string;
  public readonly deploymentGroup: DeploymentGroup;
  public owner!: string;
  public dseq!: number;
  public oseq!: number;
  public gseq!: number;
  public providerAddress!: string;
  public createdHeight!: number;
  public closedHeight?: number;
  public predictedClosedHeight!: number;
  public price!: number;
  public withdrawnAmount!: number;

  // Stats
  cpuUnits: number;
  memoryQuantity: number;
  storageQuantity: number;

  public readonly provider?: Provider;
}

Lease.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    deploymentId: { type: DataTypes.UUID },
    deploymentGroupId: { type: DataTypes.UUID, references: { model: "deploymentGroup", key: "id" } },
    owner: { type: DataTypes.STRING, allowNull: false },
    dseq: { type: DataTypes.INTEGER, allowNull: false },
    oseq: { type: DataTypes.INTEGER, allowNull: false },
    gseq: { type: DataTypes.INTEGER, allowNull: false },
    providerAddress: { type: DataTypes.STRING, allowNull: false },
    createdHeight: { type: DataTypes.INTEGER, allowNull: false },
    closedHeight: { type: DataTypes.INTEGER, allowNull: true },
    predictedClosedHeight: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    withdrawnAmount: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    // Stats
    cpuUnits: { type: DataTypes.INTEGER, allowNull: false },
    memoryQuantity: { type: DataTypes.BIGINT, allowNull: false },
    storageQuantity: { type: DataTypes.BIGINT, allowNull: false }
  },
  {
    tableName: "lease",
    modelName: "lease",
    indexes: [
      { unique: false, fields: ["closedHeight"] },
      { unique: false, fields: ["predictedClosedHeight"] },
      { unique: false, fields: ["deploymentId"] },
      { unique: false, fields: ["owner", "dseq", "gseq", "oseq"] }
    ],
    sequelize
  }
);

export class Deployment extends Model {
  public id!: string;
  public owner!: string;
  public dseq!: number;
  public createdHeight!: number;
  public balance!: number;
  public deposit!: number;
  public lastWithdrawHeight?: number;
  public withdrawnAmount!: number;
  public closedHeight?: number;

  public readonly leases?: Lease[];
  public readonly relatedMessages?: Message[];
}

Deployment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false },
    owner: { type: DataTypes.STRING, allowNull: false },
    dseq: { type: DataTypes.INTEGER, allowNull: false },
    createdHeight: { type: DataTypes.INTEGER, allowNull: false },
    balance: { type: DataTypes.DECIMAL, allowNull: false },
    deposit: { type: DataTypes.INTEGER, allowNull: false },
    lastWithdrawHeight: { type: DataTypes.INTEGER, allowNull: true },
    withdrawnAmount: { type: DataTypes.DECIMAL, allowNull: false },
    closedHeight: { type: DataTypes.INTEGER, allowNull: true }
  },
  {
    tableName: "deployment",
    modelName: "deployment",
    sequelize
  }
);

export class DeploymentGroup extends Model {
  public id!: string;
  public owner!: string;
  public dseq!: number;
  public gseq!: number;
  public readonly leases?: Lease[];
  public readonly deploymentGroupResources?: DeploymentGroupResource[];
}

DeploymentGroup.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false },
    deploymentId: {
      type: DataTypes.UUID,
      references: { model: "deployment", key: "id" }
    },
    owner: { type: DataTypes.STRING, allowNull: false },
    dseq: { type: DataTypes.INTEGER, allowNull: false },
    gseq: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    tableName: "deploymentGroup",
    modelName: "deploymentGroup",
    indexes: [
      {
        unique: false,
        fields: ["owner", "dseq", "gseq"]
      }
    ],
    sequelize
  }
);

export class DeploymentGroupResource extends Model {
  public deploymentGroupId!: string;
  public cpuUnits!: number;
  public memoryQuantity!: number;
  public storageQuantity!: number;
  public count!: number;
  public price!: number;
}

DeploymentGroupResource.init(
  {
    deploymentGroupId: {
      type: DataTypes.UUID,
      references: { model: "deploymentGroup", key: "id" }
    },
    cpuUnits: { type: DataTypes.INTEGER, allowNull: true },
    memoryQuantity: { type: DataTypes.BIGINT, allowNull: true },
    storageQuantity: { type: DataTypes.BIGINT, allowNull: true },
    count: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL, allowNull: false }
  },
  {
    tableName: "deploymentGroupResource",
    modelName: "deploymentGroupResource",
    indexes: [{ unique: false, fields: ["deploymentGroupId"] }],
    sequelize
  }
);

export class Bid extends Model {
  public owner!: string;
  public dseq!: number;
  public gseq!: number;
  public oseq!: number;
  public provider!: number;
  public price!: number;
  public createdHeight!: number;
}

Bid.init(
  {
    owner: { type: DataTypes.STRING, allowNull: false },
    dseq: { type: DataTypes.INTEGER, allowNull: false },
    gseq: { type: DataTypes.INTEGER, allowNull: false },
    oseq: { type: DataTypes.INTEGER, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL, allowNull: false },
    createdHeight: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    tableName: "bid",
    modelName: "bid",
    indexes: [{ unique: false, fields: ["owner", "dseq", "gseq", "oseq", "provider"] }],
    sequelize
  }
);

export class Proposal extends Model {
  public id: number;
  public messageId?: string;
  public proposer?: string;
  public type: string;
  public title: string;
  public description: string;
  public submittedHeight?: number;
  public initialDeposit?: number;
  public totalDeposit: number;

  // CommunityPoolSpendProposal
  public recipient?: string;
  public amount?: number;

  // SoftwareUpgradeProposal
  public softwareUpgradeName?: string;
  public softwareUpgradeHeight?: number;
  public softwareUpgradeInfo?: string;
}

Proposal.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    messageId: { type: DataTypes.STRING, allowNull: true },
    proposer: { type: DataTypes.STRING, allowNull: true },
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false },
    submittedHeight: { type: DataTypes.INTEGER, allowNull: true },
    initialDeposit: { type: DataTypes.BIGINT, allowNull: true },
    totalDeposit: { type: DataTypes.BIGINT, allowNull: false },

    // CommunityPoolSpendProposal
    recipient: { type: DataTypes.STRING, allowNull: true },
    amount: { type: DataTypes.BIGINT, allowNull: true },

    // SoftwareUpgradeProposal
    softwareUpgradeName: { type: DataTypes.STRING, allowNull: true },
    softwareUpgradeHeight: { type: DataTypes.INTEGER, allowNull: true },
    softwareUpgradeInfo: { type: DataTypes.STRING, allowNull: true }
  },
  {
    tableName: "proposal",
    modelName: "proposal",
    sequelize
  }
);

export class ProposalDeposit extends Model {
  public id: string;
  public proposalId: number;
  public depositor: string;
  public amount: number;
  public msgId: string;
}

ProposalDeposit.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false },
    proposalId: { type: DataTypes.INTEGER, allowNull: false },
    depositor: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.BIGINT, allowNull: false },
    msgId: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: "proposalDeposit",
    modelName: "proposalDeposit",
    indexes: [
      { unique: false, fields: ["proposalId"] },
      { unique: false, fields: ["depositor"] }
    ],
    sequelize
  }
);

export class ProposalVote extends Model {
  public id: string;
  public proposalId: number;
  public voter: string;
  public option: number;
  public msgId: string;
  public isFinal: boolean;
}

ProposalVote.init(
  {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true, allowNull: false },
    proposalId: { type: DataTypes.INTEGER, allowNull: false },
    voter: { type: DataTypes.STRING, allowNull: false },
    option: { type: DataTypes.INTEGER, allowNull: false },
    msgId: { type: DataTypes.STRING, allowNull: false },
    isFinal: { type: DataTypes.BOOLEAN, allowNull: false }
  },
  {
    tableName: "proposalVote",
    modelName: "proposalVote",
    indexes: [
      { unique: false, fields: ["proposalId"] },
      { unique: false, fields: ["voter"] }
    ],
    sequelize
  }
);

export class ProposalParameterChange extends Model {
  public proposalId: number;
  public subspace: string;
  public key: string;
  public value: string;
}

ProposalParameterChange.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    proposalId: { type: DataTypes.INTEGER, primaryKey: true },
    subspace: { type: DataTypes.STRING, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.STRING, allowNull: false }
  },
  {
    tableName: "proposalParameterChange",
    modelName: "proposalParameterChange",
    sequelize
  }
);

export class Day extends Model {
  public id!: string;
  public date!: Date;
  public aktPrice?: number;
  public firstBlockHeight!: number;
  public lastBlockHeight?: number;
  public lastBlockHeightYet!: number;

  public readonly firstBlock!: Block;
  public readonly lastBlock?: Block;
  public readonly lastBlockYet!: Block;
}

Day.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    aktPrice: { type: DataTypes.INTEGER, allowNull: true },
    firstBlockHeight: { type: DataTypes.INTEGER, allowNull: false },
    lastBlockHeight: { type: DataTypes.INTEGER, allowNull: true },
    lastBlockHeightYet: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    tableName: "day",
    modelName: "day",
    indexes: [
      { unique: true, fields: ["date"] },
      { unique: true, fields: ["firstBlockHeight"] },
      { unique: true, fields: ["lastBlockHeight"] }
    ],
    sequelize
  }
);

export class Block extends Model {
  public height!: number;
  public readonly datetime!: Date;
  public hash: string;
  public proposer: string;
  public dayId!: string;
  // Stats
  public isProcessed!: boolean;
  public totalTxCount!: number;
  public totalUAktSpent: number;
  public activeLeaseCount: number;
  public totalLeaseCount: number;
  public activeCPU: number;
  public activeMemory: number;
  public activeStorage: number;
  public activeProviderCount: number;

  public readonly day: Day;
  public readonly transactions?: Transaction[];
}

Block.init(
  {
    height: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    datetime: { type: DataTypes.DATE, allowNull: false },
    hash: { type: DataTypes.STRING, allowNull: false },
    proposer: { type: DataTypes.STRING, allowNull: false },
    dayId: { type: DataTypes.UUID, allowNull: false, references: { model: Day, key: "id" } },

    // Stats
    isProcessed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    totalTxCount: { type: DataTypes.BIGINT, allowNull: false },
    totalUAktSpent: { type: DataTypes.BIGINT, allowNull: true },
    activeLeaseCount: { type: DataTypes.INTEGER, allowNull: true },
    totalLeaseCount: { type: DataTypes.INTEGER, allowNull: true },
    activeCPU: { type: DataTypes.INTEGER, allowNull: true },
    activeMemory: { type: DataTypes.BIGINT, allowNull: true },
    activeStorage: { type: DataTypes.BIGINT, allowNull: true },
    activeProviderCount: { type: DataTypes.INTEGER, allowNull: true }
  },
  {
    tableName: "block",
    modelName: "block",
    indexes: [
      { unique: false, fields: ["datetime"] },
      { unique: false, fields: ["dayId"] },
      { unique: false, fields: ["height", "isProcessed"] }
    ],
    sequelize
  }
);

export class Transaction extends Model {
  public id!: string;
  public hash!: string;
  public index!: number;
  public height!: number;
  public gasUsed?: number;
  public gasWanted?: number;
  public fee: number;
  public memo: string;
  public isProcessed!: boolean;
  public downloaded!: boolean;
  public hasDownloadError!: boolean;
  public hasProcessingError!: boolean;
  public log?: string;

  public readonly block?: Block;
  public readonly messages?: Message[];
}

Transaction.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    hash: { type: DataTypes.STRING, allowNull: false },
    index: { type: DataTypes.INTEGER, allowNull: false },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Block, key: "height" }
    },
    gasUsed: { type: DataTypes.INTEGER, allowNull: true },
    gasWanted: { type: DataTypes.INTEGER, allowNull: true },
    fee: { type: DataTypes.INTEGER, allowNull: false },
    memo: { type: DataTypes.STRING, allowNull: false },
    isProcessed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    downloaded: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    hasDownloadError: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    hasProcessingError: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    log: { type: DataTypes.STRING, allowNull: true }
  },
  {
    tableName: "transaction",
    modelName: "transaction",
    indexes: [
      { unique: false, fields: ["height"] },
      { unique: false, fields: ["height", "isProcessed", "hasProcessingError"] }
    ],
    sequelize
  }
);

export class Message extends Model {
  public id!: string;
  public txId!: string;
  public height!: number;
  public type!: string;
  public typeGroup!: string;
  public index!: number;
  public indexInBlock!: number;
  public isProcessed!: boolean;
  public relatedDeploymentId?: string;
  public data: Uint8Array;

  public readonly transaction?: Transaction;
  public readonly block?: Block;

  public static associations: {
    transaction: Association<Message, Transaction>;
    block: Association<Message, Block>;
  };
}

Message.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    txId: {
      type: DataTypes.UUID,
      references: { model: Transaction, key: "id" }
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Block, key: "height" }
    },
    type: { type: DataTypes.STRING, allowNull: false },
    typeCategory: { type: DataTypes.STRING, allowNull: true },
    index: { type: DataTypes.INTEGER, allowNull: false },
    indexInBlock: { type: DataTypes.INTEGER, allowNull: false },
    isProcessed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    relatedDeploymentId: { type: DataTypes.STRING, allowNull: true },
    data: { type: DataTypes.BLOB, allowNull: false }
  },
  {
    tableName: "message",
    modelName: "message",
    indexes: [
      { unique: false, fields: ["txId"] },
      { unique: false, fields: ["relatedDeploymentId"] },
      { unique: false, fields: ["height"] },
      { unique: false, fields: ["txId", "isProcessed"] }
    ],
    sequelize
  }
);

Transaction.hasMany(Message, { foreignKey: "txId" });
Message.belongsTo(Transaction, { foreignKey: "txId" });

Block.hasMany(Transaction, { foreignKey: "height" });
Transaction.belongsTo(Block, { foreignKey: "height" });

Block.hasMany(Message, { foreignKey: "height" });
Message.belongsTo(Block, { foreignKey: "height" });

Day.hasMany(Block, { foreignKey: "dayId" });
Block.belongsTo(Day, { foreignKey: "dayId" });

Day.belongsTo(Block, { as: "firstBlock", foreignKey: "firstBlockHeight", constraints: false });
Day.belongsTo(Block, { as: "lastBlock", foreignKey: "lastBlockHeight", constraints: false });
Day.belongsTo(Block, { as: "lastBlockYet", foreignKey: "lastBlockHeightYet", constraints: false });

Provider.hasMany(ProviderAttribute, { foreignKey: "provider" });
Provider.hasMany(ProviderAttributeSignature, { foreignKey: "provider" });

Deployment.hasMany(Message, { as: "relatedMessages", foreignKey: "relatedDeploymentId" });

Deployment.hasMany(DeploymentGroup);
DeploymentGroup.belongsTo(Deployment, { foreignKey: "deploymentId" });

DeploymentGroup.hasMany(DeploymentGroupResource);
DeploymentGroupResource.belongsTo(DeploymentGroup, { foreignKey: "deploymentGroupId" });

DeploymentGroup.hasMany(Lease, { foreignKey: "deploymentGroupId" });
Lease.belongsTo(DeploymentGroup);

Deployment.hasMany(Lease, { foreignKey: "deploymentId" });
Lease.belongsTo(Deployment);

Lease.belongsTo(Provider, { foreignKey: "providerAddress" });
