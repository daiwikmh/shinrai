import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

const AppHeader = () => {
  return (
   <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background rounded-t-2xl">
     <SidebarTrigger />
     <Image alt="Shinrai Logo" src={"/logo/logo.png"} width={80} height={80} />
     <span className="font-semibold text-sm">Shinarai</span>
   </header>
  );
};

export default AppHeader;