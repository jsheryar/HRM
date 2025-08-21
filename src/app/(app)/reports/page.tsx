
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


export default function ReportsPage() {
    const { employees, user } = useAuth();

    const handleExcelExport = async () => {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(employees.map(emp => ({
            'Employee': formatEmployeeDetailsForExport(emp),
            'Details': formatPersonalDetailsForExport(emp),
            'Employment': formatEmploymentDetailsForExport(emp),
        })));

        // Set column widths
        worksheet['!cols'] = [
            { wch: 40 }, // Employee
            { wch: 40 }, // Details
            { wch: 40 }, // Employment
        ];

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
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
            }
        });

        doc.save('EmployeeReport.pdf');
    };
    
    const handlePrint = () => {
        window.print();
    };
    
    if (user?.role !== 'admin') {
      return (
          <div className="p-4">
              <p>You do not have permission to view this page.</p>
          </div>
      )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Download or print detailed employee records.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Data Export</CardTitle>
                    <CardDescription>Generate a comprehensive report of all employee details.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleExcelExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as Excel
                    </Button>
                    <Button onClick={handlePdfExport}>
                        <FileText className="mr-2 h-4 w-4" />
                        Download as PDF
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Report
                    </Button>
                </CardContent>
            </Card>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
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
