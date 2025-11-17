import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SuiProvider } from "@/providers/sui-provider";


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
   <SuiProvider>
     <SidebarProvider className="flex max-h-screen w-full bg-sidebar">
       <AppSidebar/>
       <SidebarInset className="bg-background flex-1 flex flex-col overflow-hidden rounded-2xl m-2 border-2 border-accent-foreground">
         {children}
       </SidebarInset>
     </SidebarProvider>
   </SuiProvider>
  )
}
export default Layout;