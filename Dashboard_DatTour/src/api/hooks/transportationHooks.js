import { useQuery } from "@tanstack/react-query";
import * as transportationApi from "../transportationApi";

export const TRANSPORTATION_QUERY_KEY = ["transportations"];

export const useTransportationsQuery = () => {
  return useQuery({
    queryKey: TRANSPORTATION_QUERY_KEY,
    queryFn: () => transportationApi.getAll().then((response) => response.data ?? []),
    staleTime: 1000 * 60 * 10,
  });
};

export default { useTransportationsQuery };
