"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  StarIcon,
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
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/useSubscriptions";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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
  const { data: session } = authClient.useSession();
  const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

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
          <SidebarMenuButton
            tooltip={"Sign Out"}
            className="gap-x-4 h-15 px-4"
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
            <Image
              src={"/logo/user_icon.png"}
              width={100}
              height={100}
              alt="user logo"
              className={cn("w-10 rounded-xl border-2 border-foreground")}
            />
            <div className="flex flex-col">
            <span className="text-sm font-semibold">Sign Out</span>
            <span className="text-xs truncate font-normal w-40">
              {session?.user?.email}
            </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
