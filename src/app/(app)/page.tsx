
"use client";
import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardCards } from '@/components/app/dashboard-cards';
import { LocationChart } from '@/components/app/location-chart';
import { RecentActivities } from '@/components/app/recent-activities';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    // If the user is an employee, redirect them away from the dashboard
    if (!loading && user?.role?.toLowerCase() === 'employee') {
      router.push('/my-profile');
    }
  }, [user, loading, router]);
  
  // While loading or if the user is an employee, show a loading/redirecting state
  if (loading || !user || user.role.toLowerCase() === 'employee') {
    return (
       <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Only render the dashboard for non-employee roles
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your HR Management hub.</p>
      </div>
      <DashboardCards />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <LocationChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}

    