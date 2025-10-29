import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{
    credentialId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;
  return (
    <div>
      <h1>Credentials Id: {credentialId}</h1>
      <p>Manage your credentials via ids here.</p>
    </div>
  );
};

export default Page;