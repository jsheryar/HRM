
"use client"
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, Employee, Transfer } from "@/lib/data";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { format, intervalToDuration, isValid, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const bpsLevels = Array.from({ length: 20 }, (_, i) => `BPS-${String(i + 1).padStart(2, '0')}`);

const stationOptions = ["Head Office", "Zonal Office", "Labour Colony"];


export default function EmployeesPage() {
  const [employeeList, setEmployeeList] = React.useState<Employee[]>(employees);
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employeeList);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = React.useState<string | null>(null);
  const [obtainedMarks, setObtainedMarks] = React.useState<number | string>("");
  const [totalMarks, setTotalMarks] = React.useState<number | string>("");
  const [percentage, setPercentage] = React.useState<string>("");
  const [transferHistory, setTransferHistory] = React.useState<Transfer[]>([]);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  
  const openDialog = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    setTransferHistory(employee?.transferHistory ? [...employee.transferHistory] : []);
    setPhotoPreview(employee?.photo || null);
    if(employee && employee.education) {
        const eduParts = employee.education.split(',').map(p => p.trim());
        const marksPart = eduParts.find(p => p.includes('/'));
        if (marksPart) {
            const [obtained, total] = marksPart.split(' ')[0].split('/');
            setObtainedMarks(Number(obtained));
            setTotalMarks(Number(total));
        } else {
             setObtainedMarks("");
             setTotalMarks("");
        }
    } else {
        setObtainedMarks("");
        setTotalMarks("");
    }
    setIsDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cnic = formData.get("cnic") as string;
    
    const institution = formData.get("institution") as string;
    const degree = formData.get("degree") as string;
    const completionDate = formData.get("completionDate") as string;
    const educationRecord = `${institution || ''}, ${degree || ''}, ${completionDate || ''}, ${obtainedMarks || 0}/${totalMarks || 0} (${percentage || 0}%)`;

    const employeeData = {
      id: cnic, // Use CNIC as the employee ID
      fullName: formData.get("fullName") as string,
      fatherName: formData.get("fatherName") as string,
      cnic: cnic,
      password: formData.get("password") as string,
      mobileNumber: formData.get("mobileNumber") as string,
      email: formData.get("email") as string,
      photo: photoPreview || 'https://placehold.co/100x100.png',
      department: formData.get("department") as string,
      designation: formData.get("designation") as string,
      bps: formData.get("bps") as string,
      education: educationRecord,
      station: formData.get("station") as 'Head Office' | 'Zonal Office' | 'Labour Colony',
      employmentType: formData.get("employmentType") as 'Permanent' | 'Contract' | 'Daily-wage',
      dateOfAppointment: formData.get("dateOfAppointment") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      transferHistory: transferHistory,
      status: selectedEmployee?.status || 'Active',
    };
    
    if (!employeeData.fullName || !employeeData.email || !employeeData.department || !employeeData.designation || !employeeData.station || !employeeData.employmentType || !employeeData.fatherName || !employeeData.cnic || !employeeData.mobileNumber || !employeeData.dateOfAppointment || !employeeData.dateOfBirth || !employeeData.bps || !employeeData.password) {
        toast({
            title: "Error",
            description: "Please fill out all required fields, including password.",
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
    setPhotoPreview(null);
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

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'obtained' | 'total') => {
      const value = e.target.value;
      if (type === 'obtained') {
          setObtainedMarks(value);
      } else {
          setTotalMarks(value);
      }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleTransferChange = (index: number, field: keyof Transfer, value: string) => {
    const updatedHistory = [...transferHistory];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setTransferHistory(updatedHistory);
  };

  const addTransferRecord = () => {
    setTransferHistory([...transferHistory, { station: '', fromDate: '', toDate: '' }]);
  };

  const removeTransferRecord = (index: number) => {
    const updatedHistory = transferHistory.filter((_, i) => i !== index);
    setTransferHistory(updatedHistory);
  };
  
  const calculateTenure = (from: string, to: string | null) => {
    if (!from) return '';
    const fromDate = parseISO(from);
    const toDate = to ? parseISO(to) : new Date();

    if (!isValid(fromDate) || !isValid(toDate) || fromDate > toDate) {
      return 'Invalid dates';
    }
    
    const duration = intervalToDuration({ start: fromDate, end: toDate });
    
    let tenure = '';
    if (duration.years) tenure += `${duration.years}y `;
    if (duration.months) tenure += `${duration.months}m `;
    if (duration.days) tenure += `${duration.days}d`;
    
    return tenure.trim() || "0d";
  }


  React.useEffect(() => {
    const ob = Number(obtainedMarks);
    const tot = Number(totalMarks);
    if(ob > 0 && tot > 0 && ob <= tot) {
        setPercentage(((ob / tot) * 100).toFixed(2));
    } else {
        setPercentage("");
    }
  }, [obtainedMarks, totalMarks]);

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
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
              <DialogDescription>
                {selectedEmployee ? 'Update the details below.' : 'Fill in the details below to add a new employee.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="photo">Employee Photo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                          <AvatarImage src={photoPreview || ''} alt="Employee photo" data-ai-hint="person avatar" />
                          <AvatarFallback>Photo</AvatarFallback>
                      </Avatar>
                      <Input id="photo" name="photo" type="file" onChange={handlePhotoChange} accept="image/*" />
                    </div>
                </div>

                <div className="grid gap-4 py-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" name="fullName" defaultValue={selectedEmployee?.fullName} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input id="fatherName" name="fatherName" defaultValue={selectedEmployee?.fatherName} required />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="cnic">CNIC Number (Login ID)</Label>
                      <Input id="cnic" name="cnic" defaultValue={selectedEmployee?.cnic} required disabled={!!selectedEmployee}/>
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
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" defaultValue={selectedEmployee?.password} required />
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
                        <Label htmlFor="bps">BPS</Label>
                        <Select name="bps" defaultValue={selectedEmployee?.bps} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select BPS" />
                            </SelectTrigger>
                            <SelectContent>
                                {bpsLevels.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                      <Label htmlFor="dateOfAppointment">Date of Appointment</Label>
                      <Input id="dateOfAppointment" name="dateOfAppointment" type="date" defaultValue={selectedEmployee?.dateOfAppointment} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={selectedEmployee?.dateOfBirth} required />
                    </div>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Education Record</h3>
                     <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="institution">School/College/University</Label>
                            <Input id="institution" name="institution" defaultValue={selectedEmployee?.education?.split(',')[0]} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="degree">Degree/Program</Label>
                            <Input id="degree" name="degree" defaultValue={selectedEmployee?.education?.split(',')[1]}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="completionDate">Completion Date</Label>
                            <Input id="completionDate" name="completionDate" type="date" defaultValue={selectedEmployee?.education?.split(',')[2]}/>
                        </div>
                    </div>
                     <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="obtainedMarks">Obtained Marks</Label>
                            <Input id="obtainedMarks" name="obtainedMarks" type="number" value={obtainedMarks} onChange={(e) => handleMarksChange(e, 'obtained')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="totalMarks">Total Marks</Label>
                            <Input id="totalMarks" name="totalMarks" type="number" value={totalMarks} onChange={(e) => handleMarksChange(e, 'total')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="percentage">Percentage (%)</Label>
                            <Input id="percentage" name="percentage" value={percentage} readOnly className="bg-muted"/>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="text-lg font-medium">Service History</h3>
                  <div className="space-y-4">
                    {transferHistory.map((transfer, index) => (
                      <div key={index} className="grid gap-4 sm:grid-cols-5 items-end">
                        <div className="space-y-2 sm:col-span-1">
                          <Label htmlFor={`transfer_station_${index}`}>Section / Place of Duty</Label>
                           <Select value={transfer.station} onValueChange={(value) => handleTransferChange(index, 'station', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a station" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stationOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`transfer_from_${index}`}>From Date</Label>
                          <Input id={`transfer_from_${index}`} type="date" value={transfer.fromDate} onChange={(e) => handleTransferChange(index, 'fromDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`transfer_to_${index}`}>To Date</Label>
                          <Input id={`transfer_to_${index}`} type="date" value={transfer.toDate || ''} onChange={(e) => handleTransferChange(index, 'toDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`transfer_tenure_${index}`}>Tenure</Label>
                           <Input id={`transfer_tenure_${index}`} value={calculateTenure(transfer.fromDate, transfer.toDate)} readOnly className="bg-muted" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeTransferRecord(index)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove Transfer</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addTransferRecord}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transfer Record
                  </Button>
                </div>
              </div>
              <DialogFooter className="pt-6">
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

    