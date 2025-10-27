"use client";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/logout";
// import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  // await requireAuth();
  const trpc = useTRPC();
  // const queryClient = useQueryClient();
  const { data: workflows } = useQuery(trpc.getWorkflows.queryOptions())
  const createWorkflow = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess: () => {
      toast.info("Job queued");

    },
    onError: () => {
      toast.error("Failed to create workflow");
    }
  }))
  return (
    <div className="min-h-screen flex-col gap-6 min-w-screen flex items-center justify-center">
      protected server componenet
      |<div>
        {JSON.stringify(workflows)}
      </div>
      <Button disabled={createWorkflow.isPending} onClick={() => createWorkflow.mutate()}>
        Create Workflow
      </Button>
      <LogoutButton/>
    </div>
  );
};

export default Page;