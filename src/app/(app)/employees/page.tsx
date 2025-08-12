"use client"
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, Employee } from "@/lib/data";
import { EmployeeTable } from "@/components/app/employee-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

export default function EmployeesPage() {
  const [employeeList, setEmployeeList] = React.useState<Employee[]>(employees);
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employeeList);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const openDialog = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const employeeData = {
      id: selectedEmployee?.id || `EMP${String(employeeList.length + 1).padStart(3, '0')}`,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      photo: selectedEmployee?.photo || 'https://placehold.co/100x100.png',
      department: formData.get("department") as string,
      designation: formData.get("designation") as string,
      location: formData.get("location") as 'Head Office' | 'Zonal Office' | 'Labour Colony',
      zone: formData.get("zone") as string,
      employmentType: formData.get("employmentType") as 'Permanent' | 'Contract' | 'Daily-wage',
      joiningDate: selectedEmployee?.joiningDate || new Date().toISOString().split('T')[0],
      status: selectedEmployee?.status || 'Active',
    };
    
    if (!employeeData.name || !employeeData.email || !employeeData.department || !employeeData.designation || !employeeData.location || !employeeData.zone || !employeeData.employmentType) {
        toast({
            title: "Error",
            description: "Please fill out all fields.",
            variant: "destructive",
        });
        return;
    }

    let updatedEmployees;
    if (selectedEmployee) {
      updatedEmployees = employeeList.map(emp => emp.id === selectedEmployee.id ? { ...emp, ...employeeData } : emp);
       toast({
        title: "Success",
        description: "Employee updated successfully.",
      });
    } else {
      updatedEmployees = [...employeeList, employeeData as Employee];
      toast({
        title: "Success",
        description: "Employee added successfully.",
      });
    }

    setEmployeeList(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };
  
  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      const updatedEmployees = employeeList.filter(emp => emp.id !== employeeToDelete);
      setEmployeeList(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      toast({
        title: "Success",
        description: "Employee record deleted.",
      });
    }
    setIsDeleteAlertOpen(false);
    setEmployeeToDelete(null);
  }


  React.useEffect(() => {
    setFilteredEmployees(employeeList);
  }, [employeeList]);

  const filterByLocation = (location: string) => {
    if (location === "All") {
      setFilteredEmployees(employeeList);
    } else {
      setFilteredEmployees(
        employeeList.filter((e) => e.location === location)
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground">Manage and view employee information.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setSelectedEmployee(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
              <DialogDescription>
                {selectedEmployee ? 'Update the details below.' : 'Fill in the details below to add a new employee.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" defaultValue={selectedEmployee?.name} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" className="col-span-3" defaultValue={selectedEmployee?.email} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Department</Label>
                  <Input id="department" name="department" className="col-span-3" defaultValue={selectedEmployee?.department} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="designation" className="text-right">Designation</Label>
                  <Input id="designation" name="designation" className="col-span-3" defaultValue={selectedEmployee?.designation} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Select name="location" defaultValue={selectedEmployee?.location} required>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Head Office">Head Office</SelectItem>
                            <SelectItem value="Zonal Office">Zonal Office</SelectItem>
                            <SelectItem value="Labour Colony">Labour Colony</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zone" className="text-right">Zone</Label>
                  <Input id="zone" name="zone" className="col-span-3" defaultValue={selectedEmployee?.zone} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employmentType" className="text-right">Emp. Type</Label>
                    <Select name="employmentType" defaultValue={selectedEmployee?.employmentType} required>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Permanent">Permanent</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Daily-wage">Daily-wage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{selectedEmployee ? 'Save Changes' : 'Add Employee'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="All" onValueChange={filterByLocation} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-fit">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Head Office">Head Office</TabsTrigger>
          <TabsTrigger value="Zonal Office">Zonal Offices</TabsTrigger>
          <TabsTrigger value="Labour Colony">Labour Colonies</TabsTrigger>
        </TabsList>
        <TabsContent value="All">
            <EmployeeTable employees={filteredEmployees} onEdit={openDialog} onDelete={handleDeleteClick}/>
        </TabsContent>
        <TabsContent value="Head Office">
          <EmployeeTable employees={filteredEmployees.filter(e => e.location === 'Head Office')} onEdit={openDialog} onDelete={handleDeleteClick} />
        </TabsContent>
        <TabsContent value="Zonal Office">
            <EmployeeTable employees={filteredEmployees.filter(e => e.location === 'Zonal Office')} onEdit={openDialog} onDelete={handleDeleteClick} />
        </TabsContent>
        <TabsContent value="Labour Colony">
            <EmployeeTable employees={filteredEmployees.filter(e => e.location === 'Labour Colony')} onEdit={openDialog} onDelete={handleDeleteClick} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
