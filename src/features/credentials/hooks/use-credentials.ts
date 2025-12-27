/* Hook to fetch credentials using suspense */

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma/enums";

/* Hook to fetch credentials */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

/* Hook to fetch a single credential */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

/* Hook to create credentials */
export const useCreateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" created.`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
      },
      onError: (error) => {
        toast.error(`Credential creation failed: ${error.message}`);
      },
    }),
  );
};

/*Hook to remove credentials */
export const useRemoveCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" removed.`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Credential removal failed: ${error.message}`);
      },
    }),
  );
};

/*Hook to update credentials */
export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Credential "${data.name}" is updated.`);
        queryClient.invalidateQueries(trpc.credentials.getMany.queryOptions({}));
        queryClient.invalidateQueries(trpc.credentials.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Credential update failed: ${error.message}`);
      },
    }),
  );
};

/*Hook to fetch credentials by type */
export const useCredentialByType = (type: CredentialType) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.credentials.getByType.queryOptions({ type }),
  );
};
