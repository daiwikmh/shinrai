"use client";
import { Button } from "@/components/ui/button";
// import { requireAuth } from "@/lib/auth-utils";
import { useTRPC } from "@/trpc/client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const Page = () => {
  // await requireAuth();
  const trpc = useTRPC();
  const testAi = useMutation(trpc.testAI.mutationOptions({
    onSuccess: () => {
      toast.info("AI job queued");
    }
  }));
  
  return (
    <div>
      <h1>Workflows</h1>
      <p>Manage your workflows here.</p>
      <Button disabled={testAi.isPending} onClick={() => testAi.mutate()}>Test aI</Button>
    </div>
  );
};

export default Page;