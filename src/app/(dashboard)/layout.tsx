import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SuiProvider } from "@/providers/sui-provider";


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
   <SuiProvider>
     <SidebarProvider className="flex min-h-screen w-full">
       <AppSidebar/>
       <SidebarInset className="bg-background flex-1 flex flex-col overflow-hidden">
         {children}
       </SidebarInset>
     </SidebarProvider>
   </SuiProvider>
  )
}
export default Layout;