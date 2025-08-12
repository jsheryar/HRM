import { DashboardCards } from '@/components/app/dashboard-cards';
import { LocationChart } from '@/components/app/location-chart';
import { RecentActivities } from '@/components/app/recent-activities';

export default function DashboardPage() {
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
