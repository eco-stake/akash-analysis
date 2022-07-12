import { CommunityPoolSpendProposal } from "cosmjs-types/cosmos/distribution/v1beta1/distribution";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { ParameterChangeProposal } from "cosmjs-types/cosmos/params/v1beta1/params";
import { SoftwareUpgradeProposal } from "cosmjs-types/cosmos/upgrade/v1beta1/upgrade";

export interface IGenesis {
  app_state: {
    gov: {
      proposals: IGenesisProposal[];
    };
  };
}

export interface IGenesisProposal {
  content: ParameterChangeProposal | SoftwareUpgradeProposal | CommunityPoolSpendProposal | TextProposal;
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
