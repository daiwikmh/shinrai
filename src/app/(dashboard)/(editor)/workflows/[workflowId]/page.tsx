import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}
const Page = async ({ params }: PageProps) => {
   await requireAuth();
  const { workflowId } = await params;
  return (
    <div>
      <h1>Workflow Id: {workflowId}</h1>
      <p>Manage your Worflow via ids here.</p>
    </div>
  );
};

export default Page;