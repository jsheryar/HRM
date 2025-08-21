
"use client";
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Settings2 } from "lucide-react";
import { Employee, Transfer } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { parseISO, isWithinInterval } from "date-fns";


// Dynamically import client-side libraries
import type jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatTransferHistory = (history: Transfer[]): string => {
    if (!history || history.length === 0) return 'N/A';
    return history.map(t => `${t.station} (${t.fromDate} to ${t.toDate || 'Present'})`).join('; ');
}

const formatEmployeeDetailsForExport = (emp: Employee) => {
    return [
        `Name: ${emp.fullName}`,
        `Designation: ${emp.designation} (${emp.bps})`,
        `ID: ${emp.cnic}`,
    ].join('\n');
}

const formatPersonalDetailsForExport = (emp: Employee) => {
     return [
        `Father: ${emp.fatherName}`,
        `DOB: ${emp.dateOfBirth}`,
        `Contact: ${emp.mobileNumber}`,
        `Email: ${emp.email}`,
        `Education: ${emp.education}`
    ].join('\n');
}

const formatEmploymentDetailsForExport = (emp: Employee) => {
    return [
        `Station: ${emp.station}`,
        `Appointed: ${emp.dateOfAppointment}`,
        `Type: ${emp.employmentType}`,
        `Status: ${emp.status}`,
        `History: ${formatTransferHistory(emp.transferHistory)}`
    ].join('\n');
}


const allFields = [
    { id: 'fullName', label: 'Full Name' },
    { id: 'fatherName', label: "Father's Name" },
    { id: 'cnic', label: 'CNIC' },
    { id: 'mobileNumber', label: 'Mobile Number' },
    { id: 'email', label: 'Email' },
    { id: 'department', label: 'Department' },
    { id: 'designation', label: 'Designation' },
    { id: 'bps', label: 'BPS' },
    { id: 'education', label: 'Education' },
    { id: 'station', label: 'Station' },
    { id: 'employmentType', label: 'Employment Type' },
    { id: 'dateOfAppointment', label: 'Date of Appointment' },
    { id: 'dateOfBirth', label: 'Date of Birth' },
    { id: 'transferHistory', label: 'Service History' },
    { id: 'status', label: 'Status' },
] as const;

type FieldId = typeof allFields[number]['id'];

export default function ReportsPage() {
    const { employees, user } = useAuth();
    const { toast } = useToast();
    const [selectedFields, setSelectedFields] = React.useState<FieldId[]>(allFields.map(f => f.id));
    const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employees);

    // Filters state
    const [dateFilterField, setDateFilterField] = React.useState<"dateOfAppointment" | "dateOfBirth" | "">("");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [stationFilter, setStationFilter] = React.useState("");
    const [departmentFilter, setDepartmentFilter] = React.useState("");
    const [employmentTypeFilter, setEmploymentTypeFilter] = React.useState("");
    
    const stations = React.useMemo(() => Array.from(new Set(employees.map(e => e.station))), [employees]);
    const departments = React.useMemo(() => Array.from(new Set(employees.map(e => e.department))), [employees]);
    const employmentTypes = React.useMemo(() => Array.from(new Set(employees.map(e => e.employmentType))), [employees]);

    const handleFieldToggle = (field: FieldId) => {
        setSelectedFields(prev => 
            prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
        );
    }

    const applyFilters = () => {
        let tempEmployees = [...employees];

        if (stationFilter) {
            tempEmployees = tempEmployees.filter(e => e.station === stationFilter);
        }
        if (departmentFilter) {
            tempEmployees = tempEmployees.filter(e => e.department === departmentFilter);
        }
        if (employmentTypeFilter) {
            tempEmployees = tempEmployees.filter(e => e.employmentType === employmentTypeFilter);
        }
        if (dateFilterField && dateFrom && dateTo) {
            try {
                const from = parseISO(dateFrom);
                const to = parseISO(dateTo);
                tempEmployees = tempEmployees.filter(e => {
                    const dateToTest = parseISO(e[dateFilterField]);
                    return isWithinInterval(dateToTest, { start: from, end: to });
                });
            } catch (error) {
                toast({ title: "Invalid Date", description: "Please ensure the date range is valid.", variant: "destructive" });
                return;
            }
        }
        setFilteredEmployees(tempEmployees);
        toast({ title: "Filters Applied", description: `Report updated to show ${tempEmployees.length} employees.` });
    };

    const handleCustomExcelExport = async () => {
        if (selectedFields.length === 0) {
            toast({ title: "No fields selected", description: "Please select at least one field to include in the report.", variant: "destructive" });
            return;
        }
        const XLSX = await import('xlsx');
        const dataToExport = filteredEmployees.map(emp => {
            const row: Record<string, any> = {};
            selectedFields.forEach(field => {
                const label = allFields.find(f => f.id === field)?.label || field;
                if (field === 'transferHistory') {
                    row[label] = formatTransferHistory(emp.transferHistory);
                } else {
                    row[label] = emp[field];
                }
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CustomEmployeeReport');
        XLSX.writeFile(workbook, 'CustomEmployeeReport.xlsx');
    };

    const handleCustomPdfExport = async () => {
        if (selectedFields.length === 0) {
            toast({ title: "No fields selected", description: "Please select at least one field to include in the report.", variant: "destructive" });
            return;
        }
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF({ orientation: 'landscape' });
        
        const head = [selectedFields.map(field => allFields.find(f => f.id === field)?.label || field)];
        const body = filteredEmployees.map(emp => {
            return selectedFields.map(field => {
                if (field === 'transferHistory') {
                    return formatTransferHistory(emp.transferHistory);
                }
                return String(emp[field] || '');
            });
        });

        doc.text("Custom Employee Report", 14, 16);
        (doc as any).autoTable({
            startY: 22,
            head: head,
            body: body,
            headStyles: { fillColor: [22, 163, 74] },
            styles: { cellPadding: 2, fontSize: 8, valign: 'top' },
        });

        doc.save('CustomEmployeeReport.pdf');
    };

    const handleExcelExport = async () => {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(employees.map(emp => ({
            'Employee': formatEmployeeDetailsForExport(emp),
            'Details': formatPersonalDetailsForExport(emp),
            'Employment': formatEmploymentDetailsForExport(emp),
        })));

        worksheet['!cols'] = [ { wch: 40 }, { wch: 40 }, { wch: 40 } ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
        XLSX.writeFile(workbook, 'EmployeeReport.xlsx');
    };

    const handlePdfExport = async () => {
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.text("Employee Report", 14, 16);
        (doc as any).autoTable({
            startY: 22,
            head: [['Employee', 'Details', 'Employment']],
            body: employees.map(emp => [
                formatEmployeeDetailsForExport(emp),
                formatPersonalDetailsForExport(emp),
                formatEmploymentDetailsForExport(emp)
            ]),
            headStyles: { fillColor: [22, 163, 74] },
            styles: { cellPadding: 2, fontSize: 8, valign: 'top' },
            columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' } }
        });

        doc.save('EmployeeReport.pdf');
    };
    
    const handlePrint = () => { window.print(); };
    
    if (user?.role !== 'admin') {
      return ( <div className="p-4"><p>You do not have permission to view this page.</p></div> )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Download or print detailed employee records.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Standard Employee Report</CardTitle>
                    <CardDescription>Generate a comprehensive, pre-formatted report of all employee details.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleExcelExport}><Download className="mr-2 h-4 w-4" /> Download as Excel</Button>
                    <Button onClick={handlePdfExport}><FileText className="mr-2 h-4 w-4" /> Download as PDF</Button>
                    <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print Report</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Custom Report Generator</CardTitle>
                    <CardDescription>Select the fields and apply filters to create a custom report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-medium">Select Fields to Include</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allFields.map(field => (
                                <div key={field.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={field.id} 
                                        checked={selectedFields.includes(field.id)} 
                                        onCheckedChange={() => handleFieldToggle(field.id)}
                                    />
                                    <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">{field.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-md border p-4">
                         <h4 className="font-medium">Apply Filters</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Filter by Date Field</Label>
                                <Select value={dateFilterField} onValueChange={(v) => setDateFilterField(v as any)}>
                                    <SelectTrigger><SelectValue placeholder="Select date field..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dateOfAppointment">Date of Appointment</SelectItem>
                                        <SelectItem value="dateOfBirth">Date of Birth</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateFrom">From</Label>
                                <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} disabled={!dateFilterField} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateTo">To</Label>
                                <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} disabled={!dateFilterField} />
                            </div>
                             <div className="space-y-2">
                                <Label>Filter by Station</Label>
                                <Select value={stationFilter} onValueChange={setStationFilter}>
                                    <SelectTrigger><SelectValue placeholder="All Stations" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Stations</SelectItem>
                                        {stations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Filter by Department</Label>
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="">All Departments</SelectItem>
                                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Filter by Employment Type</Label>
                                <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        {employmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                         </div>
                         <Button onClick={applyFilters}><Settings2 className="mr-2 h-4 w-4"/> Apply Filters</Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                         <Button onClick={handleCustomExcelExport}><Download className="mr-2 h-4 w-4" /> Download Custom Excel</Button>
                         <Button onClick={handleCustomPdfExport}><FileText className="mr-2 h-4 w-4" /> Download Custom PDF</Button>
                    </div>
                </CardContent>
            </Card>


            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>
            
            <div className="print-area">
                <div className="rounded-lg border">
                    <table className="w-full caption-bottom text-sm">
                      <caption className="mt-4 text-sm text-muted-foreground">Employee Report</caption>
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employment</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {employees.map((employee) => (
                          <tr key={employee.id} className="border-b">
                            <td className="p-4 align-top">
                              <div className="font-medium">{employee.fullName}</div>
                              <div className="text-xs text-muted-foreground">{employee.designation} ({employee.bps})</div>
                              <div className="text-xs text-muted-foreground">ID: {employee.cnic}</div>
                            </td>
                            <td className="p-4 align-top text-xs">
                                <div><strong>Father:</strong> {employee.fatherName}</div>
                                <div><strong>DOB:</strong> {employee.dateOfBirth}</div>
                                <div><strong>Contact:</strong> {employee.mobileNumber}</div>
                                <div><strong>Email:</strong> {employee.email}</div>
                                <div><strong>Education:</strong> {employee.education}</div>
                            </td>
                            <td className="p-4 align-top text-xs">
                                <div><strong>Station:</strong> {employee.station}</div>
                                <div><strong>Appointed:</strong> {employee.dateOfAppointment}</div>
                                <div><strong>Type:</strong> {employee.employmentType}</div>
                                <div><strong>Status:</strong> {employee.status}</div>
                                <div><strong>History:</strong> {formatTransferHistory(employee.transferHistory)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
