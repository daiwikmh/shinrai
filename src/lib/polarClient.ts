import { Polar } from "@polar-sh/sdk"; 

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server:"sandbox"
  // server: process.env.POLAR_SERVER_URL == "production" ? "production" : "sandbox"
});
