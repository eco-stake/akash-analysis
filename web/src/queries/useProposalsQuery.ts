import { UseQueryOptions, useQuery, QueryKey } from "react-query";
import axios from "axios";
import { QueryKeys } from "./queryKeys";
import { BASE_API_URL } from "@src/utils/constants";
import { ProposalSummary } from "@src/types/proposal";

async function getProposals(): Promise<ProposalSummary[]> {
  const response = await axios.get(`${BASE_API_URL}/api/proposals`);
  return response.data;
}

export function useProposals(options?: Omit<UseQueryOptions<ProposalSummary[], Error, any, QueryKey>, "queryKey" | "queryFn">) {
  return useQuery<ProposalSummary[], Error>(QueryKeys.getProposalsKey(), () => getProposals(), options);
}
