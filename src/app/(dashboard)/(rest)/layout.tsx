import AppHeader from "@/components/app-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (

    <div className="min-h-screen w-full flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full min-h-0 overflow-auto">{children}</main>
    </div>
  )
}
export default Layout;