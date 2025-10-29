import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  
  return (
    <div>
      <h1>Credentials</h1>
      <p>Manage your credentials  here.</p>
    </div>
  );
};

export default Page;