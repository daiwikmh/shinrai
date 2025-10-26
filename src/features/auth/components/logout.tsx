"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();
  
  const handleLogout = async () => {
      await authClient.signOut();
      router.refresh(); // ⬅️ this triggers a new server render with updated session
    };

  return (
    <Button variant={"default"} onClick={handleLogout}>
      Logout
    </Button>
  )
}