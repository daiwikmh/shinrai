import AppHeader from "@/components/app-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-h-screen flex flex-col ">
      <AppHeader />
      <main className="flex-1 max-h-full overflow-auto ">{children}</main>
    </div>
  )
}
export default Layout;