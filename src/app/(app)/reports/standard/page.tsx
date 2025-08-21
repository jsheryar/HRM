
"use client";
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { Employee, Transfer } from "@/lib/data";


// Dynamically import client-side libraries
import type jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatTransferHistory = (history: Transfer[]): string => {
    if (!history || history.length === 0) return 'N/A';
    return history.map(t => `${t.station} (${t.fromDate} to ${t.toDate || 'Present'})`).join('; ');
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
    if (fields.includes('dateOfAppointment')) details.push(`Appointed: ${emp.dateOfAppointment}`);
    if (fields.includes('employmentType')) details.push(`Type: ${emp.employmentType}`);
    if (fields.includes('status')) details.push(`Status: ${emp.status}`);
    if (fields.includes('transferHistory')) details.push(`History: ${formatTransferHistory(emp.transferHistory)}`);
    return details.join('\n');
}


export default function StandardReportsPage() {
    const { employees, user } = useAuth();
    const activeFields = allFields.map(f => f.id);

    const handleExcelExport = async () => {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(employees.map((emp, index) => ({
            'Sr. No.': index + 1,
            'Employee': formatEmployeeDetailsForExport(emp, allFields.map(f => f.id)),
            'Details': formatPersonalDetailsForExport(emp, allFields.map(f => f.id)),
            'Employment': formatEmploymentDetailsForExport(emp, allFields.map(f => f.id)),
        })));

        worksheet['!cols'] = [ { wch: 8 }, { wch: 40 }, { wch: 40 }, { wch: 40 } ];
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
            head: [['Sr. No.', 'Employee', 'Details', 'Employment']],
            body: employees.map((emp, index) => [
                index + 1,
                formatEmployeeDetailsForExport(emp, allFields.map(f => f.id)),
                formatPersonalDetailsForExport(emp, allFields.map(f => f.id)),
                formatEmploymentDetailsForExport(emp, allFields.map(f => f.id))
            ]),
            headStyles: { fillColor: [22, 163, 74] },
            styles: { cellPadding: 2, fontSize: 8, valign: 'top' },
            columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' }, 3: { cellWidth: 'auto' } }
        });

        doc.save('EmployeeReport.pdf');
    };
    
    const handlePrint = () => { window.print(); };
    
    if (user?.role !== 'Admin' && user?.role !== 'Sub Admin') {
      return ( <div className="p-4"><p>You do not have permission to view this page.</p></div> )
    }

    return (
        <div className="space-y-8">
            <div className="no-print">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Standard Report</h1>
                <p className="text-muted-foreground">Download or print detailed employee records.</p>
            </div>

            <Card className="no-print">
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
                      <caption className="mt-4 text-sm text-muted-foreground">Employee Report</caption>
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sr. No.</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employment</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {employees.map((employee, index) => (
                          <tr key={employee.id} className="border-b">
                            <td className="p-4 align-top">{index + 1}</td>
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
