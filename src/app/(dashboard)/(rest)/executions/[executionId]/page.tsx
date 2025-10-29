import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}
const Page = async ({ params }: PageProps) => {
   await requireAuth();
  const { executionId } = await params;
  return (
    <div>
      <h1>Execution Id: {executionId}</h1>
      <p>Manage your executions via ids here.</p>
    </div>
  );
};

export default Page;