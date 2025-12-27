/* Hook to fetch credentials using suspense */

import { useTRPC } from "@/trpc/client";
import {
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

/* Hook to fetch executions */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

/* Hook to fetch a single execution */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};
