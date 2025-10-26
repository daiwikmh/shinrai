
import { LogoutButton } from "@/features/auth/components/logout";
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  const data = await caller.getUsers();
  return (
    <div className="min-h-screen flex-col gap-6 min-w-screen flex items-center justify-center">
      protected server componenet
      |<div>
      {JSON.stringify(data, null ,2)}
      </div>
      <LogoutButton/>
    </div>
  );
};

export default Page;