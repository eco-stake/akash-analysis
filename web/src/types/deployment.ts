export interface DeploymentDetail {
  owner: string;
  dseq: number;
  totalMonthlyCostAKT: number;
  totalMonthlyCostUSD: number;
  leases: {
    oseq: number;
    gseq: number;
    status: string;
    monthlyCostAKT: number;
    monthlyCostUSD: number;
    spentAKT: number;
    spentUSD: number;
    cpuUnits: number;
    memoryQuantity: number;
    storageQuantity: number;
    provider: {
      address: string;
      hostUri: string;
      isDeleted: boolean;
      attributes: {
        key: string;
        value: string;
      }[];
    };
  }[];
  events: {
    txHash: string;
    date: string;
    type: string;
  }[];
}
