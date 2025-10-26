"use client"

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Client = () => {
   const trpc = useTRPC();
   const {data: users} = useSuspenseQuery(trpc.getUsers.queryOptions())
  return (
    <div className="text-red-700 font-bold">
      Clinet Component: {JSON.stringify(users)}
    </div>
  );
};