export interface DeploymentDetail {
  owner: string;
  dseq: number;
  balance: number;
  status: string;
  totalMonthlyCostAKT: number;
  totalMonthlyCostUSD: number;
  leases: {
    oseq: number;
    gseq: number;
    status: string;
    monthlyCostAKT: number;
    monthlyCostUSD: number;
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
