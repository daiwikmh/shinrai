import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SuiProvider } from "@/providers/sui-provider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
   <SuiProvider>
     <SidebarProvider>
       <AppSidebar/>
       <SidebarInset className="bg-background">
         {children}
       </SidebarInset>
     </SidebarProvider>
   </SuiProvider>
  )
}
export default Layout;