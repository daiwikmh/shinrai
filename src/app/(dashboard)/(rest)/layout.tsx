import AppHeader from "@/components/app-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
<<<<<<< HEAD
    <div className="min-h-screen w-full flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full min-h-0 overflow-auto">{children}</main>
=======
    <div className="max-h-screen flex flex-col ">
      <AppHeader />
      <main className="flex-1 max-h-full overflow-auto ">{children}</main>
>>>>>>> a104939eb85510118843b94bf61051aaba3597e2
    </div>
  )
}
export default Layout;