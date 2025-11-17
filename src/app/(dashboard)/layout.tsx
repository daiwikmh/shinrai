import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SuiProvider } from "@/providers/sui-provider";


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
<<<<<<< HEAD
   <SuiProvider>
     <SidebarProvider className="flex min-h-screen w-full">
       <AppSidebar/>
       <SidebarInset className="bg-background flex-1 flex flex-col overflow-hidden">
         {children}
       </SidebarInset>
     </SidebarProvider>
   </SuiProvider>
=======
   <SidebarProvider className="bg-sidebar">
     <AppSidebar/>
     <SidebarInset className="bg-background rounded-2xl m-3 border border-accent-foreground">
       {children}
     </SidebarInset>
   </SidebarProvider>
>>>>>>> a104939eb85510118843b94bf61051aaba3597e2
  )
}
export default Layout;