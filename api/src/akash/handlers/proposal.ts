import * as uuid from "uuid";
import { Proposal, ProposalParameterChange } from "@src/db/schema";
import { coinToUAkt } from "@src/shared/utils/math";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { SoftwareUpgradeProposal } from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";
import { CommunityPoolSpendProposal } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";

interface GenesisProposal {
  content: ParameterChangeProposal | SoftwareUpgradeProposal;
  deposit_end_time: string;
  final_tally_result: {
    abstain: string;
    no: string;
    no_with_veto: string;
    yes: string;
  };
  proposal_id: string;
  status: string;
  submit_time: string;
  total_deposit: {
    amount: string;
    denom: string;
  }[];
  voting_end_time: string;
  voting_start_time: string;
}

export async function createProposalFromMsg(msgSubmitProposal: MsgSubmitProposal, height: number, blockGroupTransaction, msgId: string) {
  const proposalId = ((await Proposal.max("id", { transaction: blockGroupTransaction })) as number) + 1;

  if (msgSubmitProposal.initialDeposit.length > 1) {
    throw new Error("Initial deposit is not supported");
  }

  let proposal = Proposal.build({
    id: proposalId,
    messageId: msgId,
    proposer: msgSubmitProposal.proposer,
    type: msgSubmitProposal.content.typeUrl,
    submittedHeight: height,
    initialDeposit: coinToUAkt(msgSubmitProposal.initialDeposit[0])
  });

  let proposalParameterChanges: ProposalParameterChange[] = [];

  switch (msgSubmitProposal.content.typeUrl) {
    case "/cosmos.params.v1beta1.ParameterChangeProposal":
      const parameterChangeProposal = ParameterChangeProposal.decode(msgSubmitProposal.content.value);
      proposal.title = parameterChangeProposal.title;
      proposal.description = parameterChangeProposal.description;

      proposalParameterChanges = parameterChangeProposal.changes.map((change) =>
        ProposalParameterChange.build({
          id: uuid.v4(),
          proposalId: proposalId,
          subspace: change.subspace,
          key: change.key,
          value: change.value
        })
      );
      break;

    case "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal":
      const softwareUpgradeProposal = SoftwareUpgradeProposal.decode(msgSubmitProposal.content.value);

      if (!softwareUpgradeProposal.plan) {
        throw new Error("Software upgrade proposal must have a plan");
      }

      proposal.title = softwareUpgradeProposal.title;
      proposal.description = softwareUpgradeProposal.description;
      proposal.softwareUpgradeName = softwareUpgradeProposal.plan.name;
      proposal.softwareUpgradeHeight = softwareUpgradeProposal.plan.height.toNumber();
      proposal.softwareUpgradeInfo = softwareUpgradeProposal.plan.info;
      break;

    case "/cosmos.gov.v1beta1.TextProposal":
      const textProposal = TextProposal.decode(msgSubmitProposal.content.value);

      proposal.title = textProposal.title;
      proposal.description = textProposal.description;
      break;

    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
      const communityPoolSpendProposal = CommunityPoolSpendProposal.decode(msgSubmitProposal.content.value);

      if (communityPoolSpendProposal.amount.length > 1) {
        throw new Error("Community pool spend proposal must have a single amount");
      }

      proposal.title = communityPoolSpendProposal.title;
      proposal.description = communityPoolSpendProposal.description;
      proposal.recipient = communityPoolSpendProposal.recipient;
      proposal.amount = coinToUAkt(communityPoolSpendProposal.amount[0]);

    default:
      throw Error("Unsupported proposal type: " + msgSubmitProposal.content.typeUrl);
  }

  await proposal.save({ transaction: blockGroupTransaction });
  for (const proposalParameterChange of proposalParameterChanges) {
    await proposalParameterChange.save({ transaction: blockGroupTransaction });
  }
}

export async function createProposalFromGenesis(genesisProposal: GenesisProposal, blockGroupTransaction) {
  // if (genesisProposal.initialDeposit.length > 1) {
  //   throw new Error("Initial deposit is not supported");
  // }

  let proposal = Proposal.build({
    id: parseInt(genesisProposal.proposal_id),
    type: genesisProposal.content["@type"]
  });

  let proposalParameterChanges: ProposalParameterChange[] = [];

  switch (genesisProposal.content["@type"]) {
    case "/cosmos.params.v1beta1.ParameterChangeProposal":
      const parameterChangeProposal = genesisProposal.content as ParameterChangeProposal;
      proposal.title = parameterChangeProposal.title;
      proposal.description = parameterChangeProposal.description;

      proposalParameterChanges = parameterChangeProposal.changes.map((change) =>
        ProposalParameterChange.build({
          id: uuid.v4(),
          proposalId: genesisProposal.proposal_id,
          subspace: change.subspace,
          key: change.key,
          value: change.value
        })
      );
      break;

    case "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal":
      const softwareUpgradeProposal = genesisProposal.content as SoftwareUpgradeProposal;

      if (!softwareUpgradeProposal.plan) {
        throw new Error("Software upgrade proposal must have a plan");
      }

      proposal.title = softwareUpgradeProposal.title;
      proposal.description = softwareUpgradeProposal.description;
      proposal.softwareUpgradeName = softwareUpgradeProposal.plan.name;
      proposal.softwareUpgradeHeight = softwareUpgradeProposal.plan.height.toNumber();
      proposal.softwareUpgradeInfo = softwareUpgradeProposal.plan.info;
      break;

    case "/cosmos.gov.v1beta1.TextProposal":
      const textProposal = genesisProposal.content as TextProposal;

      proposal.title = textProposal.title;
      proposal.description = textProposal.description;
      break;

    case "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal":
      const communityPoolSpendProposal = genesisProposal.content as CommunityPoolSpendProposal;

      if (communityPoolSpendProposal.amount.length > 1) {
        throw new Error("Community pool spend proposal must have a single amount");
      }

      proposal.title = communityPoolSpendProposal.title;
      proposal.description = communityPoolSpendProposal.description;
      proposal.recipient = communityPoolSpendProposal.recipient;
      proposal.amount = coinToUAkt(communityPoolSpendProposal.amount[0]);

    default:
      throw Error("Unsupported proposal type: " + genesisProposal.content["@type"]);
  }

  await proposal.save({ transaction: blockGroupTransaction });
  for (const proposalParameterChange of proposalParameterChanges) {
    await proposalParameterChange.save({ transaction: blockGroupTransaction });
  }
}
