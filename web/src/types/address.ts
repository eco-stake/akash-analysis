import { Coin } from "./coin";
import { IValidatorAddess } from "./validator";

export interface AddressDetail {
  total: number;
  available: number;
  delegated: number;
  rewards: number;
  commission: number;
  assets: Coin[];
  delegations: IDelegationDetail[];
  redelegations: IRedelegationDetail[];
}

export interface IDelegationDetail {
  validator: IValidatorAddess;
  amount: number;
  reward: number;
}

export interface IRedelegationDetail {
  srcAddress: IValidatorAddess;
  dstAddress: IValidatorAddess;
  creationHeight: number;
  completionTime: string;
  amount: number;
}
