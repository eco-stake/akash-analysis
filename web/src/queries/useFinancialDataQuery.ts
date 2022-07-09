import { QueryKey, useQuery, UseQueryOptions } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { BASE_API_URL } from "@src/utils/constants";

async function getFinancialData(): Promise<any> {
  const response = await axios.get(`${BASE_API_URL}/financials`);
  return response.data;
}

export function useFinancialData(options?: Omit<UseQueryOptions<any, Error, any, QueryKey>, "queryKey" | "queryFn">) {
  return useQuery<any, Error>(QueryKeys.getFinancialDataKey(), () => getFinancialData(), options);
}

async function getPriceData(): Promise<any> {
  const response = await axios.get(`${BASE_API_URL}/price`);
  return response.data;
}

export function usePriceData(options?: Omit<UseQueryOptions<any, Error, any, QueryKey>, "queryKey" | "queryFn">) {
  return useQuery<any, Error>(QueryKeys.getPriceDataKey(), () => getPriceData(), options);
}
