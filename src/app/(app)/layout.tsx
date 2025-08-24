
'use client';
import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/app/header';
import { AppSidebar } from '@/components/app/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // It helps avoid hydration mismatches.
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Wait until client has mounted and auth is no longer loading.
    if (isClient && !authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, isClient, router]);

  // While loading auth state or waiting for client to mount, show a loading screen.
  // This prevents a flash of the page before the redirect can happen.
  if (authLoading || !isClient || !user) {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Once loading is complete and user is confirmed, render the main app layout.
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
