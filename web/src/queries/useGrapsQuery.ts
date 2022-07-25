
import { GraphResponse } from "@src/types";
import { BASE_API_URL } from "@src/utils/constants";
import { UseQueryOptions, useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";

async function getGraphSnaphot(snapshot: string): Promise<GraphResponse> {
  const res = await fetch(`${BASE_API_URL}/api/getGraphData/${snapshot}`);

  if (!res.ok) {
    throw new Error("Error when fetching graph snapshot");
  }

  const data = await res.json();
  return data;
}

export function useGraphSnapshot<TData = GraphResponse>(snapshot: string, options?: UseQueryOptions<GraphResponse, Error, TData>) {
  return useQuery(QueryKeys.getGraphsKey(snapshot), () => getGraphSnaphot(snapshot), options);
}
