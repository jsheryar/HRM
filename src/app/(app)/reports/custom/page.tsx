
"use client";
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Settings2 } from "lucide-react";
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

const allFields = [
    { id: 'fullName', label: 'Full Name', group: 'employee' },
    { id: 'designation', label: 'Designation', group: 'employee' },
    { id: 'bps', label: 'BPS', group: 'employee' },
    { id: 'cnic', label: 'CNIC', group: 'employee' },
    { id: 'fatherName', label: "Father's Name", group: 'personal' },
    { id: 'dateOfBirth', label: 'Date of Birth', group: 'personal' },
    { id: 'mobileNumber', label: 'Mobile Number', group: 'personal' },
    { id: 'email', label: 'Email', group: 'personal' },
    { id: 'education', label: 'Education', group: 'personal' },
    { id: 'station', label: 'Station', group: 'employment' },
    { id: 'department', label: 'Department', group: 'employment' },
    { id: 'dateOfAppointment', label: 'Date of Appointment', group: 'employment' },
    { id: 'employmentType', label: 'Employment Type', group: 'employment' },
    { id: 'status', label: 'Status', group: 'employment' },
    { id: 'transferHistory', label: 'Service History', group: 'employment' },
] as const;

type FieldId = typeof allFields[number]['id'];

const formatEmployeeDetailsForExport = (emp: Employee, fields: FieldId[]) => {
    const details = [];
    if (fields.includes('fullName')) details.push(`Name: ${emp.fullName}`);
    if (fields.includes('designation') && fields.includes('bps')) details.push(`Designation: ${emp.designation} (${emp.bps})`);
    else if(fields.includes('designation')) details.push(`Designation: ${emp.designation}`);
    else if(fields.includes('bps')) details.push(`BPS: ${emp.bps}`);
    if (fields.includes('cnic')) details.push(`ID: ${emp.cnic}`);
    return details.join('\n');
}

const formatPersonalDetailsForExport = (emp: Employee, fields: FieldId[]) => {
     const details = [];
    if (fields.includes('fatherName')) details.push(`Father: ${emp.fatherName}`);
    if (fields.includes('dateOfBirth')) details.push(`DOB: ${emp.dateOfBirth}`);
    if (fields.includes('mobileNumber')) details.push(`Contact: ${emp.mobileNumber}`);
    if (fields.includes('email')) details.push(`Email: ${emp.email}`);
    if (fields.includes('education')) details.push(`Education: ${emp.education}`);
    return details.join('\n');
}

const formatEmploymentDetailsForExport = (emp: Employee, fields: FieldId[]) => {
    const details = [];
    if (fields.includes('station')) details.push(`Station: ${emp.station}`);
    if (fields.includes('department')) details.push(`Department: ${emp.department}`);
    if (fields.includes('dateOfAppointment')) details.push(`Appointed: ${emp.dateOfAppointment}`);
    if (fields.includes('employmentType')) details.push(`Type: ${emp.employmentType}`);
    if (fields.includes('status')) details.push(`Status: ${emp.status}`);
    if (fields.includes('transferHistory')) details.push(`History: ${formatTransferHistory(emp.transferHistory)}`);
    return details.join('\n');
}

export default function CustomReportsPage() {
    const { employees, user } = useAuth();
    const { toast } = useToast();
    const [selectedFields, setSelectedFields] = React.useState<FieldId[]>(allFields.map(f => f.id));
    const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>(employees);
    const [activeFields, setActiveFields] = React.useState<FieldId[]>(allFields.map(f => f.id));


    // Filters state
    const [dateFilterField, setDateFilterField] = React.useState<"dateOfAppointment" | "dateOfBirth" | "">("");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [stationFilter, setStationFilter] = React.useState("all");
    const [departmentFilter, setDepartmentFilter] = React.useState("all");
    const [employmentTypeFilter, setEmploymentTypeFilter] = React.useState("all");
    
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

        if (stationFilter && stationFilter !== 'all') {
            tempEmployees = tempEmployees.filter(e => e.station === stationFilter);
        }
        if (departmentFilter && departmentFilter !== 'all') {
            tempEmployees = tempEmployees.filter(e => e.department === departmentFilter);
        }
        if (employmentTypeFilter && employmentTypeFilter !== 'all') {
            tempEmployees = tempEmployees.filter(e => e.employmentType === employmentTypeFilter);
        }
        if (dateFilterField && dateFrom && dateTo) {
            try {
                const from = parseISO(dateFrom);
                const to = parseISO(dateTo);
                tempEmployees = tempEmployees.filter(e => {
                    if (!e[dateFilterField]) return false;
                    const dateToTest = parseISO(e[dateFilterField as keyof Employee] as string);
                    return isWithinInterval(dateToTest, { start: from, end: to });
                });
            } catch (error) {
                toast({ title: "Invalid Date", description: "Please ensure the date range is valid.", variant: "destructive" });
                return;
            }
        }
        setFilteredEmployees(tempEmployees);
        setActiveFields(selectedFields);
        toast({ title: "Filters Applied", description: `Report updated to show ${tempEmployees.length} employees.` });
    };

    const handleCustomExcelExport = async () => {
        if (activeFields.length === 0) {
            toast({ title: "No fields selected", description: "Please select at least one field to include in the report.", variant: "destructive" });
            return;
        }
        const XLSX = await import('xlsx');
        const dataToExport = filteredEmployees.map(emp => ({
            'Employee': formatEmployeeDetailsForExport(emp, activeFields),
            'Details': formatPersonalDetailsForExport(emp, activeFields),
            'Employment': formatEmploymentDetailsForExport(emp, activeFields),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        worksheet['!cols'] = [ { wch: 40 }, { wch: 40 }, { wch: 40 } ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'CustomEmployeeReport');
        XLSX.writeFile(workbook, 'CustomEmployeeReport.xlsx');
    };

    const handleCustomPdfExport = async () => {
        if (activeFields.length === 0) {
            toast({ title: "No fields selected", description: "Please select at least one field to include in the report.", variant: "destructive" });
            return;
        }
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        const body = filteredEmployees.map(emp => [
            formatEmployeeDetailsForExport(emp, activeFields),
            formatPersonalDetailsForExport(emp, activeFields),
            formatEmploymentDetailsForExport(emp, activeFields)
        ]);

        doc.text("Custom Employee Report", 14, 16);
        (doc as any).autoTable({
            startY: 22,
            head: [['Employee', 'Details', 'Employment']],
            body: body,
            headStyles: { fillColor: [22, 163, 74] },
            styles: { cellPadding: 2, fontSize: 8, valign: 'top', cellWidth: 'auto' },
            didParseCell: function (data: any) {
                if (data.section === 'body') {
                    data.cell.styles.fontStyle = 'normal';
                }
            }
        });

        doc.save('CustomEmployeeReport.pdf');
    };
    
    if (user?.role !== 'admin') {
      return ( <div className="p-4"><p>You do not have permission to view this page.</p></div> )
    }

    return (
        <div className="space-y-8">
            <div className="no-print">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Custom Reports</h1>
                <p className="text-muted-foreground">Generate and download custom employee reports.</p>
            </div>

            <Card className="no-print">
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
                                        <SelectItem value="all">All Stations</SelectItem>
                                        {stations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Filter by Department</Label>
                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                                    <SelectContent>
                                         <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Filter by Employment Type</Label>
                                <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
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
                    .no-print { display: none; }
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
            
            <div className="print-area">
                <div className="rounded-lg border">
                    <table className="w-full caption-bottom text-sm">
                        <caption className="mt-4 text-sm text-muted-foreground">Custom Employee Report</caption>
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employment</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredEmployees.map((employee) => (
                            <tr key={employee.id} className="border-b">
                                <td className="p-4 align-top whitespace-pre-wrap">
                                    {formatEmployeeDetailsForExport(employee, activeFields)}
                                </td>
                                <td className="p-4 align-top text-xs whitespace-pre-wrap">
                                    {formatPersonalDetailsForExport(employee, activeFields)}
                                </td>
                                <td className="p-4 align-top text-xs whitespace-pre-wrap">
                                    {formatEmploymentDetailsForExport(employee, activeFields)}
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

    