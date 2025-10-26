import { Button } from "@/components/ui/button";
import { getQueryClient, trpc } from "@/trpc/server";
import { Client } from "./client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const Page = async() => {
  const queryClinet = getQueryClient();
  void queryClinet.prefetchQuery(trpc.getUsers.queryOptions())
  return (
    <div className="text-red-700 font-bold">
      <h1>Hello, World!</h1>
      <HydrationBoundary state={dehydrate(queryClinet)}>
        <Suspense fallback={<p>Loading...</p>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
      <Button variant="outline">Click me</Button>
    </div>
  );
};

export default Page;