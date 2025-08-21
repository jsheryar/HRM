
'use client';
import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/app/header';
import { AppSidebar } from '@/components/app/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <AppSidebar isAdmin={user?.role === 'admin'} />
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
