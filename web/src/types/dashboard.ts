import { Block } from "./block";
import { TransactionDetail } from "./transaction";

export interface RevenueAmount {
  akt: number;
  uakt: number;
  usd: number;
}

export interface SpentStats {
  amountAkt: number;
  amountUAkt: number;
  amountUSD: number;
  revenueLast24: RevenueAmount;
  revenuePrevious24: RevenueAmount;
}

export interface DashboardBlockStats {
  date: Date;
  height: number;
  activeLeaseCount: number;
  totalLeaseCount: number;
  dailyLeaseCount: number;
  totalUAktSpent: number;
  dailyUAktSpent: number;
  activeCPU: number;
  activeMemory: number;
  activeStorage: number;
}

export interface NetworkCapacity {
  activeProviderCount: number;
  activeCPU: number;
  activeMemory: number;
  activeStorage: number;
  pendingCPU: number;
  pendingMemory: number;
  pendingStorage: number;
  availableCPU: number;
  availableMemory: number;
  availableStorage: number;
  totalCPU: number;
  totalMemory: number;
  totalStorage: number;
}

export interface DashboardData {
  marketData: MarketData;
  now: DashboardBlockStats;
  compare: DashboardBlockStats;
  networkCapacity: NetworkCapacity;
  latestBlocks: Block[];
  latestTransactions: TransactionDetail[];
}

export interface SnapshotData {
  minActiveDeploymentCount: number;
  maxActiveDeploymentCount: number;
  minCompute: number;
  maxCompute: number;
  minMemory: number;
  maxMemory: number;
  minStorage: number;
  maxStorage: number;
  allTimeDeploymentCount: number;
  totalAktSpent: number;
  dailyAktSpent: number;
  dailyDeploymentCount: number;
}

export interface ResourceLeased {
  cpuSum: number;
  memorySum: number;
  storageSum: number;
}

export interface MarketData {
  price: number;
  volume: number;
  marketCap: number;
  marketCapRank: number;
  priceChange24h: number;
  priceChangePercentage24: number;
}

export interface ISnapshotMetadata {
  value: number;
  unit?: string;
  modifiedValue?: number;
}
