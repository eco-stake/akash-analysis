import { UseQueryOptions, useQuery, QueryKey } from "react-query";
import axios from "axios";
import { QueryKeys } from "./queryKeys";
import { BASE_API_URL } from "@src/utils/constants";
import { DashboardData } from "@src/types";

async function getDashboardData(): Promise<DashboardData> {
  const response = await axios.get(`${BASE_API_URL}/api/getDashboardData`);
  return response.data;
}

export function useDashboardData(options?: Omit<UseQueryOptions<DashboardData, Error, any, QueryKey>, "queryKey" | "queryFn">) {
  return useQuery<DashboardData, Error>(QueryKeys.getDashboardDataKey(), () => getDashboardData(), options);
}
