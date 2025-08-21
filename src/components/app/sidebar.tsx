
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarClock, Banknote, FolderKanban, UserCircle, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const adminMenuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
  { href: "/leave-policy", label: "Leave Policy", icon: FileText },
  { href: "/payroll", label: "Payroll", icon: Banknote },
  { href: "/documents", label: "Documents", icon: FolderKanban },
];

const reportMenuItems = [
    { href: "/reports", label: "Standard Report" },
    { href: "/reports/custom", label: "Custom Report" },
]

const employeeMenuItems = [
    { href: "/my-profile", label: "My Profile", icon: UserCircle },
    { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;
  const homeHref = isAdmin ? "/" : "/my-profile";
  const [isReportsOpen, setIsReportsOpen] = React.useState(pathname.startsWith('/reports'));

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-testid="logo">
            <Image
                src="https://placehold.co/120x40.png"
                alt="Company Logo"
                width={120}
                height={40}
                data-ai-hint="logo"
            />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === homeHref ? item.href === homeHref : pathname.startsWith(item.href) && item.href !== "/"}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {isAdmin && (
             <Collapsible open={isReportsOpen} onOpenChange={setIsReportsOpen}>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={pathname.startsWith("/reports")}
                            tooltip={"Reports"}
                            className="justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet />
                                <span>Reports</span>
                            </div>
                            <ChevronDown className={cn("transition-transform duration-200", isReportsOpen && "rotate-180")} />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {reportMenuItems.map((item) => (
                            <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                    <Link href={item.href}>
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
             </Collapsible>
           )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
