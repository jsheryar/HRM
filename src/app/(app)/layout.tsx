import { Header } from '@/components/app/header';
import { AppSidebar } from '@/components/app/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <div className="flex flex-col h-full">
              <Header />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                {children}
              </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
