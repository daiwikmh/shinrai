import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { polar, checkout, portal } from "@polar-sh/better-auth";

// If your Prisma file is located elsewhere, you can change the path
import prisma from "@/lib/db";
import { polarClient } from "./polarClient";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "4a02f1fd-087d-4c2a-893f-00c72f1c8d8e",
              slug: "shinrai-pro",
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
          google: { 
              clientId: process.env.GOOGLE_CLIENT_ID as string, 
              clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
          }, 
          github: { 
                     clientId: process.env.GITHUB_CLIENT_ID as string, 
                     clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
                 }, 
      },
});
