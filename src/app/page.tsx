import { Button } from "@/components/ui/button";
import prisma from "@/lib/db"
const Page = async() => {
  const data = await prisma.user.findMany();
  return (
    <div className="text-red-700 font-bold">
      <h1>Hello, World!</h1>
      {JSON.stringify(data)}
      <Button variant="outline">Click me</Button>
    </div>
  );
};

export default Page;