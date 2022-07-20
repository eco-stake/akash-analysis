import { UseQueryOptions, useQuery, QueryKey } from "react-query";
import axios from "axios";
import { QueryKeys } from "./queryKeys";
import { BASE_API_URL } from "@src/utils/constants";
import { TransactionDetail } from "@src/types";
import { appendSearchParams } from "@src/utils/urlUtils";

async function getTransactions(limit: number): Promise<TransactionDetail[]> {
  const response = await axios.get(`${BASE_API_URL}/api/transactions${appendSearchParams({ limit })}`);
  return response.data;
}

export function useTransactions(limit: number, options?: Omit<UseQueryOptions<TransactionDetail[], Error, any, QueryKey>, "queryKey" | "queryFn">) {
  return useQuery<TransactionDetail[], Error>(QueryKeys.getTransactionsKey(limit), () => getTransactions(limit), options);
}
