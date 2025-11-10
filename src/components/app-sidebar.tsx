"use client"

import * as React from "react";
import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
  WalletIcon,
  MoreVerticalIcon,
  UserIcon,
  SettingsIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const menuItems = [
  {
    title: "Workflow",
    icon: FolderOpenIcon,
    href: "/workflows"
  },
  {
    title: "Credentials",
    icon: KeyIcon,
    href: "/credentials"
  },
  {
    title: "Executions",
    icon: HistoryIcon,
    href: "/executions"
  },
  {
    title: "onchain",
    icon: WalletIcon,
    href: "/onchain"
  },
];

function shortenAddress(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = React.useState<string>("");
  const [isConnecting, setIsConnecting] = React.useState(false);
  const { data: session } = authClient.useSession();

  // Check if Phantom is already connected
  React.useEffect(() => {
    const checkPhantomConnection = async () => {
      if (typeof window !== "undefined" && window.phantom?.solana) {
        try {
          const response = await window.phantom.solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        } catch {
          // Not connected yet
        }
      }
    };
    checkPhantomConnection();
  }, []);

  const connectPhantom = async () => {
    setIsConnecting(true);
    try {
      if (!window.phantom?.solana) {
        window.open("https://phantom.app/", "_blank");
        throw new Error("Phantom wallet not installed");
      }

      const phantom = window.phantom.solana;
      const response = await phantom.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      console.error("Failed to connect to Phantom:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPhantom = async () => {
    try {
      if (window.phantom?.solana) {
        await window.phantom.solana.disconnect();
        setWalletAddress("");
      }
    } catch (error) {
      console.error("Failed to disconnect from Phantom:", error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <Image alt="Shinrai logo" src={"/logo/logo.png"} width={30} height={30} className="group-hover:scale-110 transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display font-semibold">Shinrai</span>
          <span className="text-xs uppercase">Workflow Platform</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="rounded-t-none">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      asChild
                      className="gap-x-4 h-10 px-4"
                    >
                      <Link href={item.href} prefetch>
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
                    <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={56}
                          height={56}
                          className="object-cover"
                        />
                      ) : (
                        <UserIcon className="size-8" />
                      )}
                    </div>
                    <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate text-xl font-display">
                          {session?.user?.name || "User"}
                        </span>
                        <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
                          {session?.user?.email || "No email"}
                        </span>
                      </div>
                      <MoreVerticalIcon className="ml-auto size-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 p-0"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <div className="flex flex-col">
                      <button className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Account
                      </button>
                      <button className="flex items-center px-4 py-2 text-sm hover:bg-accent">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        Settings
                      </button>
                      <div className="border-t border-border my-1" />
                      {!walletAddress ? (
                        <button
                          onClick={connectPhantom}
                          disabled={isConnecting}
                          className="flex items-center px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
                        >
                          <WalletIcon className="mr-2 h-4 w-4" />
                          {isConnecting ? "Connecting..." : "Connect Phantom"}
                        </button>
                      ) : (
                        <>
                          <div className="px-4 py-2 text-xs text-muted-foreground">
                            Wallet: {shortenAddress(walletAddress)}
                          </div>
                          <button
                            onClick={disconnectPhantom}
                            className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                          >
                            <WalletIcon className="mr-2 h-4 w-4" />
                            Disconnect Wallet
                          </button>
                        </>
                      )}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => { router.push("/login"); }
                          }
                        })}
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent text-destructive"
                      >
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;