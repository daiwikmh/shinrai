import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

const Page = async () => {
   await requireAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Onchain</h1>
        <p className="text-muted-foreground mt-2">Manage your onchain components and storage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Walrus Storage</CardTitle>
            <CardDescription>
              Upload and manage files on Walrus decentralized storage network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/onchain/walrus">
              <Button className="w-full">
                Open Walrus Storage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;