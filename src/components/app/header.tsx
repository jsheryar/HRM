"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/app/user-nav";
import { useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && (
         <SidebarTrigger />
      )}
      <div className="w-full flex-1" />
      <UserNav />
    </header>
  );
}
