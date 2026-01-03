"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  StarIcon,
  UserIcon,
  SettingsIcon,
  Link2Icon
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
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/useSubscriptions";
import { useQueryClient } from "@tanstack/react-query";
import { shortenAddress } from "@/lib/utils/address";
import { useAccount, useConnect, useDisconnect } from 'wagmi'

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
        icon: Link2Icon,
        href: "/onchain",
      },
    ],
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();


  
  const { address, connector: activeConnector, isConnected } = useAccount();
const { connectors, connect } = useConnect();
const { disconnect } = useDisconnect();


  return (
    <Sidebar className="border-none" collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="gap-x-1 h-10 px-4">
            <Link href="/" prefetch>
              <Image
                alt="Shinrai logo"
                src={"/logo/logo.png"}
                width={80}
                height={80}
                className="w-10"
              />
              <span className="font-semibold text-lg">Shinrai</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-sm text-primary font-semibold">
              Workflow Config
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
                      className="gap-x-4 h-10 px-4 "
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
      <SidebarFooter>
        {!hasActiveSubscription && !isLoading && (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Upgrade To Pro"}
              className="gap-x-4 h-10 px-4"
              onClick={() => authClient.checkout({ slug: "shinrai-pro" })}
            >
              <StarIcon className="h-4 w-4" />
              <span>Upgrade To Pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={"Billing Portal"}
            className="gap-x-4 h-10 px-4"
            onClick={() => authClient.customer.portal()}
          >
            <CreditCardIcon className="h-4 w-4" />
            <span>Billing Portal</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Popover>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                tooltip={"Profile"}
                className="gap-x-4 h-15 px-4"
              >
                <Image
                  src={"/logo/user_icon.png"}
                  width={500}
                  height={500}
                  alt="user logo"
                  className="w-10 rounded-xl border-2 border-foreground"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{session?.user?.name}</span>
                  <span className="text-xs truncate font-normal w-40">
                    {session?.user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
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
    <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
      Available Wallets
    </div>

    {connectors.map((connector) => (
      <button
        key={connector.uid}
        onClick={() => connect({ connector })}
        className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent"
      >
        {connector.name}
      </button>
    ))}
  </>
) : (
  <>
    <div className="px-4 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {activeConnector?.name}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          {shortenAddress(address!)}
        </span>
      </div>
    </div>

    <button
      onClick={() => disconnect()}
      className="flex w-full items-center px-4 py-2 text-sm hover:bg-accent text-red-600"
    >
      Disconnect Wallet
    </button>
  </>
)}

                <div className="border-t border-border my-1" />
                <button
                  className="flex items-center px-4 py-2 text-sm hover:bg-accent text-red-600"
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          queryClient.clear();
                          router.push("/login");
                        },
                      },
                    })
                  }
                >
                  Sign Out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
