import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// This will cache for the duration of a single request
export const getSession = cache(async () => {
  const headerData = await headers();
  return await auth.api.getSession({
    headers: headerData,
  });
});

export const requireAuth = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
};

export const requireNoAuth = async () => {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return null;
};
