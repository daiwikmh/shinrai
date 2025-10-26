import { RegisterForm } from "@/components/register-form";
import { requireNoAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireNoAuth();
  
  return (
    <div>
      <RegisterForm/>
    </div>
  );
};

export default Page;