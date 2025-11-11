import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  
  return (
    <div>
      <h1>Workflows</h1>
      <p>Manage your workflows here.</p>
    
    </div>
  );
};

export default Page;