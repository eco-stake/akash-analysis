import { UseQueryOptions, useQuery, QueryKey } from "react-query";
import axios from "axios";
import { QueryKeys } from "./queryKeys";
import { BASE_API_URL } from "@src/utils/constants";
import { Block } from "@src/types";
import { appendSearchParams } from "@src/utils/urlUtils";

async function getBlocks(limit: number): Promise<Block[]> {
  const response = await axios.get(`${BASE_API_URL}/api/blocks${appendSearchParams({ limit })}`);
  return response.data;
}

export function useBlocks(limit: number, options?: Omit<UseQueryOptions<Block[], Error, any, QueryKey>, "queryKey" | "queryFn">) {
  return useQuery<Block[], Error>(QueryKeys.getBlocksKey(limit), () => getBlocks(limit), options);
}
