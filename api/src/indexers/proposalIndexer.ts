import * as uuid from "uuid";
import { Indexer } from "./indexer";
import { Block, Message, Proposal, ProposalParameterChange, sequelize } from "@src/db/schema";
import { IGenesis, IGenesisProposal } from "@src/akash/genesisTypes";
import { coinToUAkt } from "@src/shared/utils/math";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { SoftwareUpgradeProposal } from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";
import { CommunityPoolSpendProposal } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import * as benchmark from "@src/shared/utils/benchmark";

export class ProposalIndexer extends Indexer {
  msgHandlers: { [key: string]: (msgSubmitProposal: any, height: number, blockGroupTransaction, msg: Message) => Promise<void> };

  constructor() {
    super();
    this.name = "ProposalIndexer";
    this.msgHandlers = {
      "/cosmos.gov.v1beta1.MsgSubmitProposal": createProposalFromMsg
    };
  }

  @benchmark.measureMethodAsync
  async recreateTables() {
    await Proposal.drop();
    await ProposalParameterChange.drop();
    await ProposalParameterChange.sync({ force: true });
    await Proposal.sync({ force: true });
  }

  @benchmark.measureMethodAsync
  async seed(genesis: IGenesis) {
    const proposals = genesis.app_state.gov.proposals;

    const dbTransaction = await sequelize.transaction();

    for (const proposal of proposals) {
      console.log("Creating proposal #" + proposal.proposal_id);

      await createProposalFromGenesis(proposal, dbTransaction);
    }

    await dbTransaction.commit();
  }
}

async function createProposalFromMsg(msgSubmitProposal: MsgSubmitProposal, height: number, blockGroupTransaction, msg: Message) {
  const proposalId = ((await Proposal.max("id", { transaction: blockGroupTransaction })) as number) + 1;

  if (msgSubmitProposal.initialDeposit.length > 1) {
    throw new Error("Initial deposit is not supported");
  }

  let proposal = Proposal.build({
    id: proposalId,
    messageId: msg.id,
    proposer: msgSubmitProposal.proposer,
    type: msgSubmitProposal.content.typeUrl,
    submittedHeight: height,
    initialDeposit: coinToUAkt(msgSubmitProposal.initialDeposit[0])
  });

  let proposalParameterChanges: ProposalParameterChange[] = [];

  switch (msgSubmitProposal.content.typeUrl) {
    case "/cosmos.params.v1beta1.ParameterChangeProposal":
      const parameterChangeProposal = ParameterChangeProposal.decode(msgSubmitProposal.content.value);
      await processParameterChangeProposal(proposal, parameterChangeProposal, blockGroupTransaction);
      break;

    case "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal":
      const softwareUpgradeProposal = SoftwareUpgradeProposal.decode(msgSubmitProposal.content.value);
      processSoftwareUpgradeProposal(proposal, softwareUpgradeProposal);
      break;

    case "/cosmos.gov.v1beta1.TextProposal":
      const textProposal = TextProposal.decode(msgSubmitProposal.content.value);
      processTextProposal(proposal, textProposal);
      break;

    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
      const communityPoolSpendProposal = CommunityPoolSpendProposal.decode(msgSubmitProposal.content.value);
      processCommunityPoolSpendProposal(proposal, communityPoolSpendProposal);

    default:
      throw Error("Unsupported proposal type: " + msgSubmitProposal.content.typeUrl);
  }

  await proposal.save({ transaction: blockGroupTransaction });
  for (const proposalParameterChange of proposalParameterChanges) {
    await proposalParameterChange.save({ transaction: blockGroupTransaction });
  }
}

export async function createProposalFromGenesis(genesisProposal: IGenesisProposal, dbTransaction) {
  let proposal = Proposal.build({
    id: parseInt(genesisProposal.proposal_id),
    type: genesisProposal.content["@type"]
  });

  let proposalParameterChanges: ProposalParameterChange[] = [];

  switch (genesisProposal.content["@type"]) {
    case "/cosmos.params.v1beta1.ParameterChangeProposal":
      await processParameterChangeProposal(proposal, genesisProposal.content as ParameterChangeProposal, dbTransaction);
      break;

    case "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal":
      processSoftwareUpgradeProposal(proposal, genesisProposal.content as SoftwareUpgradeProposal);
      break;

    case "/cosmos.gov.v1beta1.TextProposal":
      processTextProposal(proposal, genesisProposal.content as TextProposal);
      break;

    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
      processCommunityPoolSpendProposal(proposal, genesisProposal.content as CommunityPoolSpendProposal);
      break;

    default:
      throw Error("Unsupported proposal type: " + genesisProposal.content["@type"]);
  }

  await proposal.save({ transaction: dbTransaction });
  for (const proposalParameterChange of proposalParameterChanges) {
    await proposalParameterChange.save({ transaction: dbTransaction });
  }
}

function processTextProposal(proposal: Proposal, textProposal: TextProposal) {
  proposal.title = textProposal.title;
  proposal.description = textProposal.description;
}

function processCommunityPoolSpendProposal(proposal: Proposal, communityPoolSpendProposal: CommunityPoolSpendProposal) {
  if (communityPoolSpendProposal.amount.length > 1) {
    throw new Error("Community pool spend proposal must have a single amount");
  }

  proposal.title = communityPoolSpendProposal.title;
  proposal.description = communityPoolSpendProposal.description;
  proposal.recipient = communityPoolSpendProposal.recipient;
  proposal.amount = coinToUAkt(communityPoolSpendProposal.amount[0]);
}

function processSoftwareUpgradeProposal(proposal: Proposal, softwareUpgradeProposal: SoftwareUpgradeProposal) {
  if (!softwareUpgradeProposal.plan) {
    throw new Error("Software upgrade proposal must have a plan");
  }

  proposal.title = softwareUpgradeProposal.title;
  proposal.description = softwareUpgradeProposal.description;
  proposal.softwareUpgradeName = softwareUpgradeProposal.plan.name;
  proposal.softwareUpgradeHeight = softwareUpgradeProposal.plan.height.toNumber();
  proposal.softwareUpgradeInfo = softwareUpgradeProposal.plan.info;
}

async function processParameterChangeProposal(proposal: Proposal, parameterChangeProposal: ParameterChangeProposal, dbTransaction) {
  proposal.title = parameterChangeProposal.title;
  proposal.description = parameterChangeProposal.description;

  for (const change of parameterChangeProposal.changes) {
    await ProposalParameterChange.create(
      {
        id: uuid.v4(),
        proposalId: proposal.id,
        subspace: change.subspace,
        key: change.key,
        value: change.value
      },
      { transaction: dbTransaction }
    );
  }
}
