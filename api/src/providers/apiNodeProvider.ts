import fetch from "node-fetch";
import { getDeploymentRelatedMessages } from "../db/deploymentProvider";
import { Op, Provider, ProviderAttribute, Validator } from "@src/db/schema";
import { averageBlockCountInAMonth } from "@src/shared/constants";
import { round } from "@src/shared/utils/math";
import { getAktMarketData } from "./marketDataProvider";

const apiNodeUrl = "http://akash-node.akashlytics.com:1317";

export async function getAddressBalance(address: string) {
  const balancesQuery = fetch(`${apiNodeUrl}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`);
  const delegationsQuery = fetch(`${apiNodeUrl}/cosmos/staking/v1beta1/delegations/${address}?pagination.limit=1000`);
  const rewardsQuery = fetch(`${apiNodeUrl}/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
  const redelegationsQuery = fetch(`${apiNodeUrl}/cosmos/staking/v1beta1/delegators/${address}/redelegations?pagination.limit=1000`);

  const [balancesResponse, delegatedResponse, rewardsResponse, redelegationsResponse] = await Promise.all([
    balancesQuery,
    delegationsQuery,
    rewardsQuery,
    redelegationsQuery
  ]);

  const validatorsFromDb = await Validator.findAll();
  const validatorFromDb = validatorsFromDb.find((v) => v.accountAddress === address);
  let commission = 0;

  if (validatorFromDb?.operatorAddress) {
    const commissionQuery = await fetch(`${apiNodeUrl}/cosmos/distribution/v1beta1/validators/${validatorFromDb?.operatorAddress}/commission`);
    const commissionData = await commissionQuery.json();
    commission = parseFloat(commissionData.commission.commission[0].amount);
  }

  const balancesData = await balancesResponse.json();
  const delegationsData = await delegatedResponse.json();
  const rewardsData = await rewardsResponse.json();
  const redelegationsData = await redelegationsResponse.json();

  const assets = balancesData.balances.map((x) => ({
    denom: x.denom,
    amount: parseInt(x.amount)
  }));

  const delegations = delegationsData.delegation_responses.map((x) => {
    const validator = validatorsFromDb.find((v) => v.operatorAddress === x.delegation.validator_address);

    return {
      validator: {
        address: validator.accountAddress,
        moniker: validator?.moniker,
        operatorAddress: validator?.operatorAddress,
        avatarUrl: validator?.keybaseAvatarUrl
      },
      amount: parseInt(x.balance.amount)
    };
  });

  for (const reward of rewardsData.rewards) {
    const delegation = delegations.find((x) => x.validator.operatorAddress === reward.validator_address);
    const rewardAmount = reward.reward.length > 0 ? parseFloat(reward.reward.find((x) => x.denom === "uakt").amount) : 0;

    if (delegation) {
      delegation.reward = rewardAmount;
    } else {
      const validator = validatorsFromDb.find((v) => v.operatorAddress === reward.validator_address);
      delegations.push({
        validator: {
          address: validator.accountAddress,
          moniker: validator?.moniker,
          operatorAddress: validator?.operatorAddress,
          avatarUrl: validator?.keybaseAvatarUrl
        },
        amount: 0,
        reward: rewardAmount
      });
    }
  }

  const available = assets.filter((x) => x.denom === "uakt").reduce((acc, cur) => acc + cur.amount, 0);
  const delegated = delegations.reduce((acc, cur) => acc + cur.amount, 0);
  const rewards = rewardsData.total.length > 0 ? parseInt(rewardsData.total.find((x) => x.denom === "uakt").amount) : 0;
  const redelegations = redelegationsData.redelegation_responses.map((x) => {
    const srcValidator = validatorsFromDb.find((v) => v.operatorAddress === x.redelegation.validator_src_address);
    const destValidator = validatorsFromDb.find((v) => v.operatorAddress === x.redelegation.validator_dst_address);

    return {
      srcAddress: {
        address: srcValidator.accountAddress,
        moniker: srcValidator?.moniker,
        operatorAddress: srcValidator?.operatorAddress,
        avatarUrl: srcValidator?.keybaseAvatarUrl
      },
      dstAddress: {
        address: destValidator.accountAddress,
        moniker: destValidator?.moniker,
        operatorAddress: destValidator?.operatorAddress,
        avatarUrl: destValidator?.keybaseAvatarUrl
      },
      creationHeight: x.entries[0].redelegation_entry.creation_height,
      completionTime: x.entries[0].redelegation_entry.completion_time,
      amount: parseInt(x.entries[0].balance)
    };
  });

  return {
    total: available + delegated + rewards + commission,
    delegations,
    available,
    delegated,
    rewards,
    assets,
    redelegations,
    commission
  };
}

export async function getValidators() {
  const response = await fetch(`${apiNodeUrl}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=1000`);
  const data = await response.json();

  const validators = data.validators.map((x) => ({
    operatorAddress: x.operator_address,
    moniker: x.description.moniker,
    votingPower: parseInt(x.tokens),
    commission: parseFloat(x.commission.commission_rates.rate),
    identity: x.description.identity
  }));

  const totalVotingPower = validators.reduce((acc, cur) => acc + cur.votingPower, 0);

  const validatorsFromDb = await Validator.findAll({
    where: {
      keybaseAvatarUrl: { [Op.ne]: null, [Op.ne]: "" }
    }
  });

  const sortedValidators = validators
    .sort((a, b) => b.votingPower - a.votingPower)
    .map((x, i) => ({
      ...x,
      votingPowerRatio: x.votingPower / totalVotingPower,
      rank: i + 1,
      keybaseAvatarUrl: validatorsFromDb.find((y) => y.operatorAddress === x.operatorAddress)?.keybaseAvatarUrl
    }));

  return sortedValidators;
}

export async function getValidator(address: string) {
  const response = await fetch(`${apiNodeUrl}/cosmos/staking/v1beta1/validators/${address}`);
  const data = await response.json();

  const validatorsResponse = await fetch(`${apiNodeUrl}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=1000`);
  const validatorsData: { validators: any[] } = await validatorsResponse.json();

  const validatorFromDb = await Validator.findOne({ where: { operatorAddress: address } });
  const validatorRank = validatorsData.validators
    .map((x) => {
      return { votingPower: parseInt(x.tokens), address: x.operator_address };
    })
    .sort((a, b) => b.votingPower - a.votingPower)
    .findIndex((x) => x.address === address);

  return {
    operatorAddress: data.validator.operator_address,
    address: validatorFromDb?.accountAddress,
    moniker: data.validator.description.moniker,
    keybaseUsername: validatorFromDb?.keybaseUsername,
    keybaseAvatarUrl: validatorFromDb?.keybaseAvatarUrl,
    votingPower: parseInt(data.validator.tokens),
    commission: parseFloat(data.validator.commission.commission_rates.rate),
    maxCommission: parseFloat(data.validator.commission.commission_rates.max_rate),
    maxCommissionChange: parseFloat(data.validator.commission.commission_rates.max_change_rate),
    identity: data.validator.description.identity,
    description: data.validator.description.details,
    website: data.validator.description.website,
    rank: validatorRank + 1
  };
}

export async function getProposals() {
  const response = await fetch(`${apiNodeUrl}/cosmos/gov/v1beta1/proposals?pagination.limit=1000`);
  const data = await response.json();

  const proposals = data.proposals.map((x) => ({
    id: parseInt(x.proposal_id),
    title: x.content.title,
    status: x.status,
    submitTime: x.submit_time,
    votingStartTime: x.voting_start_time,
    votingEndTime: x.voting_end_time,
    totalDeposit: parseInt(x.total_deposit[0].amount)
  }));

  const sortedProposals = proposals.sort((a, b) => b.id - a.id);

  return sortedProposals;
}

export async function getProposal(id: number) {
  const response = await fetch(`${apiNodeUrl}/cosmos/gov/v1beta1/proposals/${id}`);
  const data = await response.json();

  let proposer = null;
  if (id > 3) {
    const proposerResponse = await fetch(`${apiNodeUrl}/gov/proposals/${id}/proposer`);
    const proposerData = await proposerResponse.json();

    const validatorFromDb = await Validator.findOne({ where: { accountAddress: proposerData.result.proposer } });
    proposer = {
      address: proposer,
      moniker: validatorFromDb?.moniker,
      operatorAddress: validatorFromDb?.operatorAddress,
      avatarUrl: validatorFromDb?.keybaseAvatarUrl
    };
  }

  return {
    id: parseInt(data.proposal.proposal_id),
    title: data.proposal.content.title,
    description: data.proposal.content.description,
    status: data.proposal.status,
    submitTime: data.proposal.submit_time,
    votingStartTime: data.proposal.voting_start_time,
    votingEndTime: data.proposal.voting_end_time,
    totalDeposit: parseInt(data.proposal.total_deposit[0].amount),
    proposer: proposer,
    finalTally: {
      yes: parseInt(data.proposal.final_tally_result.yes),
      abstain: parseInt(data.proposal.final_tally_result.abstain),
      no: parseInt(data.proposal.final_tally_result.no),
      noWithVeto: parseInt(data.proposal.final_tally_result.no_with_veto),
      total:
        parseInt(data.proposal.final_tally_result.yes) +
        parseInt(data.proposal.final_tally_result.abstain) +
        parseInt(data.proposal.final_tally_result.no) +
        parseInt(data.proposal.final_tally_result.no_with_veto)
    },
    paramChanges: (data.proposal.content.changes || []).map((change) => ({
      subspace: change.subspace,
      key: change.key,
      value: JSON.parse(change.value)
    }))
  };
}

export async function getDeployment(owner: string, dseq: number) {
  const deploymentQuery = fetch(`${apiNodeUrl}/akash/deployment/v1beta2/deployments/info?id.owner=${owner}&id.dseq=${dseq}`);
  const leasesQuery = fetch(`${apiNodeUrl}/akash/market/v1beta2/leases/list?filters.owner=${owner}&filters.dseq=${dseq}&pagination.limit=1000`);
  const relatedMessagesQuery = getDeploymentRelatedMessages(owner, dseq);

  const [deploymentResponse, leasesResponse, relatedMessages] = await Promise.all([deploymentQuery, leasesQuery, relatedMessagesQuery]);

  const deploymentData = await deploymentResponse.json();
  const leasesData = await leasesResponse.json();

  const providerAddresses = leasesData.leases.map((x) => x.lease.lease_id.provider);
  const providers = await Provider.findAll({
    where: {
      owner: {
        [Op.in]: providerAddresses
      }
    },
    include: [{ model: ProviderAttribute }]
  });

  const aktPrice = getAktMarketData()?.price;

  const leases = leasesData.leases.map((x) => {
    const provider = providers.find((p) => p.owner === x.lease.lease_id.provider);
    const monthlyUAKT = Math.round(parseFloat(x.lease.price.amount) * averageBlockCountInAMonth);
    const group = deploymentData.groups.find((g) => g.group_id.gseq === x.lease.lease_id.gseq);

    return {
      gseq: x.lease.lease_id.gseq,
      oseq: x.lease.lease_id.oseq,
      provider: {
        address: provider.owner,
        hostUri: provider.hostUri,
        isDeleted: !!provider.deletedHeight,
        attributes: provider.providerAttributes.map((attr) => ({
          key: attr.key,
          value: attr.value
        }))
      },
      status: x.lease.state,
      monthlyCostAKT: round(monthlyUAKT / 1_000_000, 2),
      monthlyCostUSD: aktPrice ? round((monthlyUAKT / 1_000_000) * aktPrice, 2) : null,
      cpuUnits: group.group_spec.resources.map((r) => parseInt(r.resources.cpu.units.val) * r.count).reduce((a, b) => a + b, 0),
      memoryQuantity: group.group_spec.resources.map((r) => parseInt(r.resources.memory.quantity.val) * r.count).reduce((a, b) => a + b, 0),
      storageQuantity: group.group_spec.resources
        .map((r) => r.resources.storage.map((s) => parseInt(s.quantity.val)).reduce((a, b) => a + b, 0) * r.count)
        .reduce((a, b) => a + b, 0)
    };
  });

  return {
    owner: deploymentData.deployment.deployment_id.owner,
    dseq: parseInt(deploymentData.deployment.deployment_id.dseq),
    balance: parseFloat(deploymentData.escrow_account.balance.amount),
    status: deploymentData.deployment.state,
    totalMonthlyCostAKT: leases.map((x) => x.monthlyCostAKT).reduce((a, b) => a + b, 0),
    totalMonthlyCostUSD: leases.map((x) => x.monthlyCostUSD).reduce((a, b) => a + b, 0),
    leases: leases,
    events: relatedMessages,
    other: deploymentData
  };
}
