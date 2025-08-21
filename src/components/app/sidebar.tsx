
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
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarClock, Banknote, FolderKanban, UserCircle, FileText, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminMenuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
  { href: "/leave-policy", label: "Leave Policy", icon: FileText },
  { href: "/payroll", label: "Payroll", icon: Banknote },
  { href: "/documents", label: "Documents", icon: FolderKanban },
  { href: "/reports", label: "Reports", icon: FileSpreadsheet },
];

const employeeMenuItems = [
    { href: "/my-profile", label: "My Profile", icon: UserCircle },
    { href: "/leave-record", label: "Leave Record", icon: CalendarClock },
];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;
  const homeHref = isAdmin ? "/" : "/my-profile";

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2" data-testid="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary">
                <rect width="256" height="256" fill="none" />
                <path d="M43.4,182.1a95.9,95.9,0,0,1,6-108.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M212.6,73.9a95.9,95.9,0,0,1-6,108.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M73.9,43.4a95.9,95.9,0,0,1,108.2-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <path d="M182.1,212.6a95.9,95.9,0,0,1-108.2,6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
                <circle cx="128" cy="128" r="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
            </svg>
            <span className="text-xl font-semibold text-primary">ZoneFlow HR</span>
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
