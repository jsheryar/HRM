
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
import { LayoutDashboard, Users, CalendarClock, FileText, FileSpreadsheet, ChevronDown, Settings, BookUser } from "lucide-react";
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
import { useAuth } from "@/context/auth-context";

const allMenuItems = {
    Admin: [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/employees", label: "Employees", icon: Users },
        { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
        { href: "/leave-policy", label: "Leave Policy", icon: FileText },
        { href: "/explanation-letter", label: "Explanation Letter", icon: BookUser },
    ],
    "Sub Admin": [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/employees", label: "Employees", icon: Users },
        { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
        { href: "/leave-policy", label: "Leave Policy", icon: FileText },
        { href: "/explanation-letter", label: "Explanation Letter", icon: BookUser },
    ],
    Editor: [
        { href: "/employees", label: "Employees", icon: Users },
    ],
    "Data Entry Operator": [
        { href: "/employees", label: "Employees", icon: Users },
    ],
    employee: [
        { href: "/my-profile", label: "My Profile", icon: Users },
        { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
    ]
};

const reportMenuItems = [
    { href: "/reports/standard", label: "Standard Report" },
    { href: "/reports/custom", label: "Custom Report" },
    { href: "/reports/retirement", label: "Retired List" },
]

export function AppSidebar() {
  const pathname = usePathname();
  const { logoUrl, user } = useAuth();
  
  const getMenuItems = () => {
    if (!user?.role) return [];
    const role = user.role;
    const keys = Object.keys(allMenuItems) as (keyof typeof allMenuItems)[];
    const key = keys.find(k => k.toLowerCase() === role.toLowerCase());
    return key ? allMenuItems[key] : [];
  }

  const menuItems = getMenuItems();

  const homeHref = user?.role === 'employee' ? "/my-profile" : "/";
  const [isReportsOpen, setIsReportsOpen] = React.useState(pathname.startsWith('/reports'));
  const userRole = user?.role?.toLowerCase();
  const canViewReports = userRole === 'admin' || userRole === 'sub admin';
  const canViewSettings = userRole === 'admin';


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-testid="logo">
            <Image
                src={logoUrl || "https://placehold.co/120x40/FFFFFF/000000?text=ZoneFlow+HR"}
                alt="Company Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
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
           {canViewReports && (
            <>
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
            </>
           )}
           {canViewSettings && (
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/settings")}
                tooltip={"Settings"}
              >
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
