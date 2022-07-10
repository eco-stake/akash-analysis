import fetch from "node-fetch";
import { sequelize } from "../db/schema";
import { createProposalFromGenesis } from "./handlers/proposal";
import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";

export async function importGenesis() {
  const response = await fetch("https://raw.githubusercontent.com/ovrclk/net/master/mainnet/genesis.json");
  const data = await response.json();

  const proposals = data.app_state.gov.proposals;

  const dbTransaction = await sequelize.transaction();

  for (const proposal of proposals) {
    console.log("Creating proposal #" + proposal.proposal_id);

    await createProposalFromGenesis(proposal, dbTransaction);
  }

  await dbTransaction.commit();
}
