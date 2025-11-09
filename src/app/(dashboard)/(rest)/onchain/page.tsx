import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
   await requireAuth();
   
  return (
    <div>
      <h1>onchain</h1>
      <p>Manage your onchain components.</p>
    </div>
  );
};

export default Page;