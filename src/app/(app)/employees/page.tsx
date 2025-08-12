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

const designations = [
    "Software Engineer",
    "HR Manager",
    "Labourer",
    "Accountant",
    "Marketing Executive",
    "Supervisor",
    "System Analyst",
    "HR Assistant",
    "Senior Accountant",
    "UI/UX Designer",
    "Zonal Manager",
    "Digital Marketer",
    "DevOps Engineer"
];

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
      fullName: formData.get("fullName") as string,
      fatherName: formData.get("fatherName") as string,
      cnic: formData.get("cnic") as string,
      mobileNumber: formData.get("mobileNumber") as string,
      stationOfAppointment: formData.get("stationOfAppointment") as string,
      email: formData.get("email") as string,
      photo: selectedEmployee?.photo || 'https://placehold.co/100x100.png',
      department: formData.get("department") as string,
      designation: formData.get("designation") as string,
      station: formData.get("station") as 'Head Office' | 'Zonal Office' | 'Labour Colony',
      zone: formData.get("zone") as string,
      employmentType: formData.get("employmentType") as 'Permanent' | 'Contract' | 'Daily-wage',
      dateOfAppointment: formData.get("dateOfAppointment") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      transferHistory: selectedEmployee?.transferHistory || [],
      status: selectedEmployee?.status || 'Active',
    };
    
    if (!employeeData.fullName || !employeeData.email || !employeeData.department || !employeeData.designation || !employeeData.station || !employeeData.zone || !employeeData.employmentType || !employeeData.fatherName || !employeeData.cnic || !employeeData.mobileNumber || !employeeData.stationOfAppointment || !employeeData.dateOfAppointment || !employeeData.dateOfBirth) {
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

  const filterByStation = (station: string) => {
    if (station === "All") {
      setFilteredEmployees(employeeList);
    } else {
      setFilteredEmployees(
        employeeList.filter((e) => e.station === station)
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
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
              <DialogDescription>
                {selectedEmployee ? 'Update the details below.' : 'Fill in the details below to add a new employee.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4 py-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" defaultValue={selectedEmployee?.fullName} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input id="fatherName" name="fatherName" defaultValue={selectedEmployee?.fatherName} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC Number</Label>
                  <Input id="cnic" name="cnic" defaultValue={selectedEmployee?.cnic} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input id="mobileNumber" name="mobileNumber" type="tel" defaultValue={selectedEmployee?.mobileNumber} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedEmployee?.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" defaultValue={selectedEmployee?.department} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Select name="designation" defaultValue={selectedEmployee?.designation} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a designation" />
                        </SelectTrigger>
                        <SelectContent>
                            {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="station">Station</Label>
                    <Select name="station" defaultValue={selectedEmployee?.station} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a station" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Head Office">Head Office</SelectItem>
                            <SelectItem value="Zonal Office">Zonal Office</SelectItem>
                            <SelectItem value="Labour Colony">Labour Colony</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input id="zone" name="zone" defaultValue={selectedEmployee?.zone} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="employmentType">Emp. Type</Label>
                    <Select name="employmentType" defaultValue={selectedEmployee?.employmentType} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Permanent">Permanent</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Daily-wage">Daily-wage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="stationOfAppointment">Station of Appointment</Label>
                  <Input id="stationOfAppointment" name="stationOfAppointment" defaultValue={selectedEmployee?.stationOfAppointment} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="dateOfAppointment">Date of Appointment</Label>
                  <Input id="dateOfAppointment" name="dateOfAppointment" type="date" defaultValue={selectedEmployee?.dateOfAppointment} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={selectedEmployee?.dateOfBirth} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{selectedEmployee ? 'Save Changes' : 'Add Employee'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="All" onValueChange={filterByStation} className="w-full">
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
          <EmployeeTable employees={filteredEmployees.filter(e => e.station === 'Head Office')} onEdit={openDialog} onDelete={handleDeleteClick} />
        </TabsContent>
        <TabsContent value="Zonal Office">
            <EmployeeTable employees={filteredEmployees.filter(e => e.station === 'Zonal Office')} onEdit={openDialog} onDelete={handleDeleteClick} />
        </TabsContent>
        <TabsContent value="Labour Colony">
            <EmployeeTable employees={filteredEmployees.filter(e => e.station === 'Labour Colony')} onEdit={openDialog} onDelete={handleDeleteClick} />
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