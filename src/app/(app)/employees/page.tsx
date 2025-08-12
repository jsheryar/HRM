"use client"
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, Employee } from "@/lib/data";
import { EmployeeTable } from "@/components/app/employee-table";

export default function EmployeesPage() {
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employees);

  const filterByLocation = (location: string) => {
    if (location === "All") {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((e) => e.location === location)
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Directory</h1>
        <p className="text-muted-foreground">Manage and view employee information.</p>
      </div>
      
      <Tabs defaultValue="All" onValueChange={filterByLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-fit">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Head Office">Head Office</TabsTrigger>
          <TabsTrigger value="Zonal Office">Zonal Offices</TabsTrigger>
          <TabsTrigger value="Labour Colony">Labour Colonies</TabsTrigger>
        </TabsList>
        <TabsContent value="All">
            <EmployeeTable employees={employees.filter(e => e.location === 'Head Office' || e.location === 'Zonal Office' || e.location === 'Labour Colony')} />
        </TabsContent>
        <TabsContent value="Head Office">
          <EmployeeTable employees={employees.filter(e => e.location === 'Head Office')} />
        </TabsContent>
        <TabsContent value="Zonal Office">
            <EmployeeTable employees={employees.filter(e => e.location === 'Zonal Office')} />
        </TabsContent>
        <TabsContent value="Labour Colony">
            <EmployeeTable employees={employees.filter(e => e.location === 'Labour Colony')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
