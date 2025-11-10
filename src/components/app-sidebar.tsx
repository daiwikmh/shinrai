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
import { useSolana } from "@/components/solana-provider";
import {
  useConnect,
  useDisconnect,
  type UiWallet
} from "@wallet-standard/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  {
    title: "canvas",
    icon: WalletIcon,
    href: "/canvas"
  },
];

function shortenAddress(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Wallet Icon Component
const WalletIconComponent = ({ wallet, className }: { wallet: UiWallet; className?: string; }) => {
  return (
    <Avatar className={className}>
      {wallet.icon && (
        <AvatarImage src={wallet.icon} alt={`${wallet.name} icon`} />
      )}
      <AvatarFallback>{wallet.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};

// Wallet Menu Item Component
const WalletMenuItem = ({ wallet, onConnect }: { wallet: UiWallet; onConnect: () => void; }) => {
  const { setWalletAndAccount } = useSolana();
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnect = async () => {
    if (isConnecting) return;

    try {
      const accounts = await connect();

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setWalletAndAccount(wallet, account);
        onConnect();
      }
    } catch (err) {
      console.error(`Failed to connect ${wallet.name}:`, err);
    }
  };

  return (
    <button
      className="flex w-full items-center justify-between px-4 py-2 text-sm outline-none hover:bg-accent focus:bg-accent disabled:pointer-events-none disabled:opacity-50"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <div className="flex items-center gap-2">
        <WalletIconComponent wallet={wallet} className="h-6 w-6" />
        <span className="font-medium">{wallet.name}</span>
      </div>
      {isConnecting && <span className="text-xs text-muted-foreground">Connecting...</span>}
    </button>
  );
};

// Disconnect Button Component
const DisconnectButton = ({ wallet, onDisconnect }: { wallet: UiWallet; onDisconnect: () => void; }) => {
  const { setWalletAndAccount } = useSolana();
  const [isDisconnecting, disconnect] = useDisconnect(wallet);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setWalletAndAccount(null, null);
      onDisconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  return (
    <button
      className="flex items-center px-4 py-2 text-sm hover:bg-accent text-destructive w-full"
      onClick={handleDisconnect}
      disabled={isDisconnecting}
    >
      <LogOutIcon className="mr-2 h-4 w-4" />
      {isDisconnecting ? "Disconnecting..." : "Disconnect Wallet"}
    </button>
  );
};

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { wallets, selectedWallet, selectedAccount, isConnected } = useSolana();

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
                      {!isConnected ? (
                        <>
                          {wallets.length === 0 ? (
                            <div className="px-4 py-2 text-xs text-muted-foreground">
                              No wallets detected
                            </div>
                          ) : (
                            <>
                              <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                                Available Wallets
                              </div>
                              {wallets.map((wallet, index) => (
                                <WalletMenuItem
                                  key={`${wallet.name}-${index}`}
                                  wallet={wallet}
                                  onConnect={() => {}}
                                />
                              ))}
                            </>
                          )}
                        </>
                      ) : (
                        selectedWallet &&
                        selectedAccount && (
                          <>
                            <div className="px-4 py-2">
                              <div className="flex items-center gap-2 mb-1">
                                <WalletIconComponent wallet={selectedWallet} className="h-6 w-6" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {selectedWallet.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {shortenAddress(selectedAccount.address)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DisconnectButton
                              wallet={selectedWallet}
                              onDisconnect={() => {}}
                            />
                          </>
                        )
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
