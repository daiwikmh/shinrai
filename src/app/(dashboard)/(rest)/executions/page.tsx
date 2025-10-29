import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
   await requireAuth();
   
  return (
    <div>
      <h1>Executions</h1>
      <p>Manage your executions here.</p>
    </div>
  );
};

export default Page;