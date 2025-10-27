// import { z } from 'zod';
import prisma from "@/lib/db";
import {  createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from "@/inngest/client";
export const appRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(({ctx}) => {
      return prisma.user.findMany({
        where: {
          id: ctx.auth.user.id,
        },
      });
    }),
  getWorkflows: protectedProcedure.query(({ctx}) => {
      return prisma.workflow.findMany();
    }),
  createWorkflow: protectedProcedure.mutation(async ({ctx}) => {
    await inngest.send({
      name: "test/hello.world",
      data:{
        email: `${ctx.auth.user.email}`
      }
    })
    return { success:true , data: "Job queued!"}
  }),
  
});
// export type definition of API
export type AppRouter = typeof appRouter;