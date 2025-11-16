"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
  UserIcon,
  SettingsIcon,
  MoreVerticalIcon,
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/useSubscriptions";
import { useQueryClient } from "@tanstack/react-query";
import {
  useWallets,
  useConnectWallet,
  useCurrentWallet,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { WalletMenuItem } from "@/components/wallet/wallet-menu-item";
import { WalletIconComponent } from "@/components/wallet/wallet-icon";
import { DisconnectButton } from "@/components/wallet/disconnect-button";
import { shortenAddress } from "@/lib/utils/address";

const menuItems = [
  {
    title: "Home",
    items: [
      {
        title: "Workflow",
        icon: FolderOpenIcon,
        href: "/workflows",
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        href: "/credentials",
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        href: "/executions",
      },
      {
        title: "onchain",
        icon: HistoryIcon,
        href: "/onchain",
      },
    ],
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();
  const session = authClient.useSession();

  // Sui wallet hooks
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { currentWallet: selectedWallet } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const selectedAccount = currentAccount;
  const isConnected = !!selectedWallet && !!selectedAccount;

  return (
    <Sidebar className="w-[250px] relative">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
            <Link href="/" prefetch>
              <Image
                alt="Shinrai logo"
                src={"/logo/logo.png"}
                width={40}
                height={40}
              />
              <span className="font-semibold text-2xl text-white">Shinrai</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              <SidebarMenu className="sidebar-menu-item">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={
                        item.href === "/"
                          ? pathname === "/"
                          : pathname.startsWith(item.href)
                      }
                      asChild
                      className="sidebar-menu-text"
                    >
                      <Link href={item.href} prefetch>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
            <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
              {session?.data?.user?.image ? (
                <Image
                  src={session.data.user.image}
                  alt={session.data.user.name || "User"}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              ) : (
                <UserIcon className="size-8" />
              )}
            </div>
            <div
              className=" user-box 
    group/item
    hover:bg-sidebar-accent-active/75
    group-data-[state=open]:bg-sidebar-accent-active
    group-data-[state=open]:hover:bg-sidebar-accent-active
    group-data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left leading-tight">
                <span className="user-box-name">
                  {session?.data?.user?.name || "User"}
                </span>
                <span className="user-box-email">
                  {session?.data?.user?.email || "No email"}
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
                          onConnect={(w) => connect({ wallet: w })}
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
                        <WalletIconComponent
                          wallet={selectedWallet}
                          className="h-6 w-6"
                        />
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
                      onDisconnect={() => disconnect()}
                    />
                  </>
                )
              )}
              <div className="border-t border-border my-1" />
              <button
                onClick={() =>
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.push("/login");
                      },
                    },
                  })
                }
                className="flex items-center px-4 py-2 text-sm hover:bg-accent text-destructive"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>

      <div className="w-[200px] mx-auto border-t border-white my-4"></div>
      <SidebarFooter>
        {!hasActiveSubscription && !isLoading && (
          <SidebarMenuItem className="sidebar-menu-item">
            <SidebarMenuButton
              tooltip={"Upgrade To Pro"}
              className="sidebar-menu-text"
              onClick={() => authClient.checkout({ slug: "shinrai-pro" })}
            >
              <StarIcon className="h-4 w-4" />
              <span>Upgrade To Pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem className="sidebar-menu-item">
          <SidebarMenuButton
            tooltip={"Billing Portal"}
            className="sidebar-menu-text"
            onClick={() => authClient.customer.portal()}
          >
            <CreditCardIcon className="h-4 w-4" />
            <span>Billing Portal</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
