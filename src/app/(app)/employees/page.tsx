
"use client"
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee, Transfer, Training, Certificate, Promotion, Upgradation } from "@/lib/data";
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
import { PlusCircle, Trash2, KeyRound, Search, Award, CheckSquare, TrendingUp, ArrowUpCircle } from "lucide-react";
import { format, intervalToDuration, isValid, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";

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


export default function EmployeesPage() {
  const { employees, setEmployees, user, domiciles, stations } = useAuth();
  const [employeeList, setEmployeeList] = React.useState<Employee[]>(employees);
  const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employeeList);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = React.useState<string | null>(null);
  const [obtainedMarks, setObtainedMarks] = React.useState<number | string>("");
  const [totalMarks, setTotalMarks] = React.useState<number | string>("");
  const [percentage, setPercentage] = React.useState<string>("");
  const [transferHistory, setTransferHistory] = React.useState<Transfer[]>([]);
  const [promotionHistory, setPromotionHistory] = React.useState<Promotion[]>([]);
  const [upgradationHistory, setUpgradationHistory] = React.useState<Upgradation[]>([]);
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("All");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<Set<string>>(new Set());


  // State for controlled select components
  const [formDesignation, setFormDesignation] = React.useState<string | undefined>();
  const [formBps, setFormBps] = React.useState<string | undefined>();
  const [formStation, setFormStation] = React.useState<string | undefined>();
  const [formEmploymentType, setFormEmploymentType] = React.useState<string | undefined>();
  const [formDomicile, setFormDomicile] = React.useState<string | undefined>();
  const [formStatus, setFormStatus] = React.useState<Employee['status'] | undefined>();
  
  const openFormDialog = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    // Set state for controlled select components first
    setFormDesignation(employee?.designation || undefined);
    setFormBps(employee?.bps || undefined);
    setFormStation(employee?.station || undefined);
    setFormEmploymentType(employee?.employmentType || undefined);
    setFormDomicile(employee?.domicile || undefined);
    setFormStatus(employee?.status || 'Active');
    
    setTransferHistory(employee?.transferHistory ? [...employee.transferHistory] : []);
    setPromotionHistory(employee?.promotionHistory ? [...employee.promotionHistory] : []);
    setUpgradationHistory(employee?.upgradationHistory ? [...employee.upgradationHistory] : []);
    setTrainings(employee?.trainings ? [...employee.trainings] : []);
    setCertificates(employee?.certificates ? [...employee.certificates] : []);
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
    setIsFormDialogOpen(true);
  }

  const openPasswordDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsPasswordDialogOpen(true);
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cnic = formData.get("cnic") as string;
    
    const institution = formData.get("institution") as string;
    const degree = formData.get("degree") as string;
    const completionDate = formData.get("completionDate") as string;
    const educationRecord = `${institution || ''}, ${degree || ''}, ${completionDate || ''}, ${obtainedMarks || 0}/${totalMarks || 0} (${percentage || 0}%)`;

    const employeeData: Omit<Employee, 'password' | 'id'> & { id: string; password?: string } = {
      id: cnic, // Use CNIC as the employee ID
      fullName: formData.get("fullName") as string,
      fatherName: formData.get("fatherName") as string,
      cnic: cnic,
      mobileNumber: formData.get("mobileNumber") as string,
      email: formData.get("email") as string,
      photo: photoPreview || 'https://placehold.co/100x100.png',
      department: formData.get("department") as string,
      designation: formDesignation || '',
      bps: formBps || '',
      education: educationRecord,
      station: formStation || '',
      employmentType: formEmploymentType as 'Permanent' | 'Contract' | 'Daily-wage' || 'Permanent',
      dateOfAppointment: formData.get("dateOfAppointment") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      domicile: formDomicile || '',
      transferHistory: transferHistory,
      promotionHistory: promotionHistory,
      upgradationHistory: upgradationHistory,
      trainings: trainings,
      certificates: certificates,
      status: formStatus || 'Active',
      dateOfRetirement: formData.get("dateOfRetirement") as string || null,
    };
    
    if (!employeeData.fullName || !employeeData.email || !employeeData.department || !employeeData.designation || !employeeData.station || !employeeData.employmentType || !employeeData.fatherName || !employeeData.cnic || !employeeData.mobileNumber || !employeeData.dateOfAppointment || !employeeData.dateOfBirth || !employeeData.bps || !employeeData.domicile) {
        toast({
            title: "Error",
            description: "Please fill out all required fields.",
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
      updatedEmployees = [...employeeList, { ...employeeData, password: 'password' } as Employee];
      toast({
        title: "Success",
        description: "Employee added successfully. Default password assigned.",
      });
    }

    setEmployees(updatedEmployees);
    setEmployeeList(updatedEmployees);
    setIsFormDialogOpen(false);
    setSelectedEmployee(null);
    setPhotoPreview(null);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    
    if (!password || !selectedEmployee) {
      toast({ title: "Error", description: "Please enter a password.", variant: "destructive" });
      return;
    }

    const updatedEmployees = employeeList.map(emp => 
      emp.id === selectedEmployee.id ? { ...emp, password } : emp
    );

    setEmployees(updatedEmployees);
    setEmployeeList(updatedEmployees);
    
    toast({ title: "Success", description: "Password updated successfully." });
    setIsPasswordDialogOpen(false);
    setSelectedEmployee(null);
  }

  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteConfirm = () => {
    const idsToDelete = employeeToDelete ? [employeeToDelete] : Array.from(selectedEmployeeIds);
    if (idsToDelete.length > 0) {
      const updatedEmployees = employeeList.filter(emp => !idsToDelete.includes(emp.id));
      setEmployees(updatedEmployees);
      setEmployeeList(updatedEmployees);
      toast({
        title: "Success",
        description: `${idsToDelete.length} employee record(s) deleted.`,
      });
      setSelectedEmployeeIds(new Set());
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
  
  const handlePromotionChange = (index: number, field: keyof Promotion, value: string) => {
    const updatedHistory = [...promotionHistory];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setPromotionHistory(updatedHistory);
  };

  const addPromotionRecord = () => {
    setPromotionHistory([...promotionHistory, { date: '', designation: '', bps: '' }]);
  };

  const removePromotionRecord = (index: number) => {
    const updatedHistory = promotionHistory.filter((_, i) => i !== index);
    setPromotionHistory(updatedHistory);
  };
  
  const handleUpgradationChange = (index: number, field: keyof Upgradation, value: string) => {
    const updatedHistory = [...upgradationHistory];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setUpgradationHistory(updatedHistory);
  };

  const addUpgradationRecord = () => {
    setUpgradationHistory([...upgradationHistory, { date: '', designation: '', bps: '' }]);
  };

  const removeUpgradationRecord = (index: number) => {
    const updatedHistory = upgradationHistory.filter((_, i) => i !== index);
    setUpgradationHistory(updatedHistory);
  };

  const handleDynamicListChange = (index: number, field: 'name' | 'date', value: string, listType: 'training' | 'certificate') => {
    if (listType === 'training') {
        const updated = [...trainings];
        updated[index] = { ...updated[index], [field]: value };
        setTrainings(updated);
    } else {
        const updated = [...certificates];
        updated[index] = { ...updated[index], [field]: value };
        setCertificates(updated);
    }
  };

  const addDynamicListItem = (listType: 'training' | 'certificate') => {
    if (listType === 'training') {
        setTrainings([...trainings, { name: '', date: '' }]);
    } else {
        setCertificates([...certificates, { name: '', date: '' }]);
    }
  };

  const removeDynamicListItem = (index: number, listType: 'training' | 'certificate') => {
    if (listType === 'training') {
        setTrainings(trainings.filter((_, i) => i !== index));
    } else {
        setCertificates(certificates.filter((_, i) => i !== index));
    }
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
    setEmployeeList(employees);
    setSelectedEmployeeIds(new Set()); // Clear selection when employees list changes
  }, [employees]);
  
  React.useEffect(() => {
    let filtered = employeeList;

    // Filter by active tab
    if (activeTab !== "All") {
      filtered = filtered.filter((e) => e.station === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((employee) => {
        return (
          employee.fullName.toLowerCase().includes(lowercasedQuery) ||
          employee.designation.toLowerCase().includes(lowercasedQuery) ||
          employee.station.toLowerCase().includes(lowercasedQuery) ||
          employee.cnic.toLowerCase().includes(lowercasedQuery) ||
          employee.bps.toLowerCase().includes(lowercasedQuery)
        );
      });
    }

    setFilteredEmployees(filtered);
    setSelectedEmployeeIds(new Set()); // Clear selection when filters change
  }, [searchQuery, activeTab, employeeList]);

  const userRole = user?.role?.toLowerCase();
  const canDelete = userRole === 'admin' || userRole === 'editor';
  const canEdit = userRole === 'admin' || userRole === 'editor'
  const canManagePassword = userRole === 'admin';
  const canAdd = userRole === 'admin' || userRole === 'editor' || userRole === 'data entry operator';
  const canViewLeaveDetails = userRole === 'admin' || userRole === 'sub admin';
  const allTabs = ["All", ...stations];
  const isAnyEmployeeSelected = selectedEmployeeIds.size > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Directory</h1>
          <p className="text-muted-foreground">Manage and view employee information.</p>
        </div>
         <div className="flex items-center gap-2">
          {isAnyEmployeeSelected && canDelete && (
            <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedEmployeeIds.size})
            </Button>
          )}
          <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => { setIsFormDialogOpen(isOpen); if (!isOpen) setSelectedEmployee(null); }}>
            <DialogTrigger asChild>
              {canAdd && <Button onClick={() => openFormDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
              </Button>}
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
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" name="department" defaultValue={selectedEmployee?.department} required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="designation">Designation</Label>
                          <Select name="designation" value={formDesignation} onValueChange={setFormDesignation} required>
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
                          <Select name="bps" value={formBps} onValueChange={setFormBps} required>
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
                          <Select name="station" value={formStation} onValueChange={setFormStation} required>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a station" />
                              </SelectTrigger>
                              <SelectContent>
                                  {stations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="employmentType">Emp. Type</Label>
                          <Select name="employmentType" value={formEmploymentType} onValueChange={setFormEmploymentType} required>
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
                      <div className="space-y-2">
                          <Label htmlFor="domicile">Domicile</Label>
                          <Select name="domicile" value={formDomicile} onValueChange={setFormDomicile} required>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a domicile" />
                              </SelectTrigger>
                              <SelectContent>
                                  {domiciles.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select name="status" value={formStatus} onValueChange={(value) => setFormStatus(value as Employee['status'])} required>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="Active">Active</SelectItem>
                                  <SelectItem value="Inactive">Inactive</SelectItem>
                                  <SelectItem value="Retired">Retired</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      {formStatus === 'Retired' && (
                        <div className="space-y-2">
                            <Label htmlFor="dateOfRetirement">Date of Retirement</Label>
                            <Input id="dateOfRetirement" name="dateOfRetirement" type="date" defaultValue={selectedEmployee?.dateOfRetirement || ''} />
                        </div>
                      )}
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
                    <h3 className="text-lg font-medium flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Promotion History</h3>
                    <div className="space-y-4">
                      {promotionHistory.map((promo, index) => (
                        <div key={index} className="grid gap-4 sm:grid-cols-4 items-end">
                          <div className="space-y-2">
                            <Label htmlFor={`promo_date_${index}`}>Date</Label>
                            <Input id={`promo_date_${index}`} type="date" value={promo.date} onChange={(e) => handlePromotionChange(index, 'date', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`promo_designation_${index}`}>Designation</Label>
                            <Select value={promo.designation} onValueChange={(value) => handlePromotionChange(index, 'designation', value)}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select Designation" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`promo_bps_${index}`}>BPS</Label>
                            <Select value={promo.bps} onValueChange={(value) => handlePromotionChange(index, 'bps', value)}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select BPS" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {bpsLevels.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePromotionRecord(index)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Promotion</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addPromotionRecord}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Promotion Record
                    </Button>
                  </div>
                  
                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><ArrowUpCircle className="h-5 w-5" /> Upgradation History</h3>
                    <div className="space-y-4">
                      {upgradationHistory.map((upgrade, index) => (
                        <div key={index} className="grid gap-4 sm:grid-cols-4 items-end">
                          <div className="space-y-2">
                            <Label htmlFor={`upgrade_date_${index}`}>Date</Label>
                            <Input id={`upgrade_date_${index}`} type="date" value={upgrade.date} onChange={(e) => handleUpgradationChange(index, 'date', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`upgrade_designation_${index}`}>Designation</Label>
                            <Select value={upgrade.designation} onValueChange={(value) => handleUpgradationChange(index, 'designation', value)}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select Designation" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`upgrade_bps_${index}`}>BPS</Label>
                            <Select value={upgrade.bps} onValueChange={(value) => handleUpgradationChange(index, 'bps', value)}>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select BPS" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {bpsLevels.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeUpgradationRecord(index)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Upgradation</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addUpgradationRecord}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Upgradation Record
                    </Button>
                  </div>


                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Transfer History</h3>
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
                                      {stations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                  
                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><CheckSquare className="h-5 w-5" /> Trainings Attended</h3>
                    <div className="space-y-4">
                      {trainings.map((training, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                              value={training.name}
                              onChange={(e) => handleDynamicListChange(index, 'name', e.target.value, 'training')}
                              placeholder="e.g., Advanced React Workshop"
                              className="w-1/2"
                          />
                          <Input 
                              type="date"
                              value={training.date}
                              onChange={(e) => handleDynamicListChange(index, 'date', e.target.value, 'training')}
                              className="w-1/2"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem(index, 'training')} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Training</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('training')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Training
                    </Button>
                  </div>

                  <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><Award className="h-5 w-5" /> Certificates Awarded</h3>
                    <div className="space-y-4">
                      {certificates.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                              value={cert.name}
                              onChange={(e) => handleDynamicListChange(index, 'name', e.target.value, 'certificate')}
                              placeholder="e.g., Certified Kubernetes Administrator"
                              className="w-1/2"
                          />
                          <Input 
                              type="date"
                              value={cert.date}
                              onChange={(e) => handleDynamicListChange(index, 'date', e.target.value, 'certificate')}
                              className="w-1/2"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeDynamicListItem(index, 'certificate')} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove Certificate</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => addDynamicListItem('certificate')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Certificate
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
      </div>
      
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, designation, station..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:grid-cols-none md:w-fit md:flex flex-wrap">
          {allTabs.map(tab => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>
        {allTabs.map(tab => (
            <TabsContent key={tab} value={tab}>
                <EmployeeTable 
                    employees={filteredEmployees} 
                    onEdit={openFormDialog} 
                    onDelete={handleDeleteClick} 
                    onManagePassword={openPasswordDialog} 
                    permissions={{canEdit, canDelete, canManagePassword, canViewLeaveDetails}}
                    selectedEmployeeIds={selectedEmployeeIds}
                    setSelectedEmployeeIds={setSelectedEmployeeIds}
                />
            </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected employee record(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={(isOpen) => { setIsPasswordDialogOpen(isOpen); if (!isOpen) setSelectedEmployee(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Credentials</DialogTitle>
              <DialogDescription>
                Set the password for {selectedEmployee?.fullName}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginId">Login ID (CNIC)</Label>
                    <Input id="loginId" value={selectedEmployee?.cnic || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input id="password" name="password" type="password" required autoFocus />
                  </div>
              </div>
              <DialogFooter>
                <Button type="submit">Set Password</Button>
              </DialogFooter>
            </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
