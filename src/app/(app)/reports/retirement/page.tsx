
"use client";
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { Employee } from "@/lib/data";
import { parseISO, format, isValid } from "date-fns";

// Dynamically import client-side libraries
import type jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatDateSafe = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    if (isValid(date)) {
        return format(date, 'dd MMM, yyyy');
    }
    return 'N/A';
};

export default function RetiredEmployeesReportPage() {
    const { employees, user } = useAuth();
    
    const retiredEmployees = React.useMemo(() => {
        return employees.filter(emp => emp.status === 'Retired');
    }, [employees]);

    const handleExcelExport = async () => {
        const XLSX = await import('xlsx');
        const dataToExport = retiredEmployees.map((emp, index) => ({
            'Sr. No.': index + 1,
            'Full Name': emp.fullName,
            'Designation': emp.designation,
            'BPS': emp.bps,
            'Date of Birth': formatDateSafe(emp.dateOfBirth),
            'Date of Appointment': formatDateSafe(emp.dateOfAppointment),
            'Date of Retirement': formatDateSafe(emp.dateOfRetirement),
            'Station': emp.station,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'RetiredEmployeesReport');
        XLSX.writeFile(workbook, `RetiredEmployeesReport.xlsx`);
    };

    const handlePdfExport = async () => {
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.text(`Retired Employees Report`, 14, 16);
        (doc as any).autoTable({
            startY: 22,
            head: [['Sr. No.', 'Employee Name', 'Designation (BPS)', 'Date of Birth', 'Appointment', 'Retirement']],
            body: retiredEmployees.map((emp, index) => [
                index + 1,
                emp.fullName,
                `${emp.designation} (${emp.bps})`,
                formatDateSafe(emp.dateOfBirth),
                formatDateSafe(emp.dateOfAppointment),
                formatDateSafe(emp.dateOfRetirement),
            ]),
            headStyles: { fillColor: [22, 163, 74] },
            styles: { cellPadding: 2, fontSize: 8, valign: 'top' },
        });

        doc.save(`RetiredEmployeesReport.pdf`);
    };
    
    const handlePrint = () => { window.print(); };
    
    const userRole = user?.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'sub admin') {
      return ( <div className="p-4"><p>You do not have permission to view this page.</p></div> )
    }

    return (
        <div className="space-y-8">
            <div className="no-print">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Retired Employees List</h1>
                <p className="text-muted-foreground">A report of all employees with 'Retired' status.</p>
            </div>

            <Card className="no-print">
                <CardHeader>
                    <CardTitle>Export Report</CardTitle>
                    <CardDescription>Download the list of retired employees in various formats.</CardDescription>
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
                      <caption className="mt-4 text-sm text-muted-foreground">Retired Employees Report</caption>
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sr. No.</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date of Birth</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Appointment Date</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Retirement Date</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Station</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {retiredEmployees.length > 0 ? retiredEmployees.map((employee, index) => (
                          <tr key={employee.id} className="border-b">
                            <td className="p-4 align-top">{index + 1}</td>
                            <td className="p-4 align-top">
                                <div className="font-medium">{employee.fullName}</div>
                                <div className="text-muted-foreground">{employee.designation} ({employee.bps})</div>
                            </td>
                            <td className="p-4 align-top">{formatDateSafe(employee.dateOfBirth)}</td>
                            <td className="p-4 align-top">{formatDateSafe(employee.dateOfAppointment)}</td>
                            <td className="p-4 align-top font-medium">{formatDateSafe(employee.dateOfRetirement)}</td>
                            <td className="p-4 align-top">{employee.station}</td>
                          </tr>
                        )) : (
                            <tr className="border-b">
                                <td colSpan={6} className="p-4 text-center text-muted-foreground">No retired employees found.</td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
