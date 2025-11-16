import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
   <SidebarProvider className="bg-sidebar">
     <AppSidebar/>
     <SidebarInset className="bg-background rounded-2xl m-3 border border-accent-foreground">
       {children}
     </SidebarInset>
   </SidebarProvider>
  )
}
export default Layout;