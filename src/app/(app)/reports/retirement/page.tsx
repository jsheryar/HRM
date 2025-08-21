
"use client";
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { Employee } from "@/lib/data";
import { differenceInYears, parseISO, format } from "date-fns";

// Dynamically import client-side libraries
import type jsPDF from 'jspdf';
import 'jspdf-autotable';

const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    try {
        const birthDate = parseISO(dob);
        const today = new Date();
        return differenceInYears(today, birthDate);
    } catch (e) {
        return 0;
    }
};

export default function RetirementReportPage() {
    const { employees, user } = useAuth();

    const retirementAge = 59;
    
    const retiringEmployees = React.useMemo(() => {
        return employees.filter(emp => calculateAge(emp.dateOfBirth) === retirementAge);
    }, [employees]);

    const handleExcelExport = async () => {
        const XLSX = await import('xlsx');
        const dataToExport = retiringEmployees.map((emp, index) => ({
            'Sr. No.': index + 1,
            'Full Name': emp.fullName,
            'Designation': emp.designation,
            'BPS': emp.bps,
            'Date of Birth': emp.dateOfBirth ? format(parseISO(emp.dateOfBirth), 'dd MMM, yyyy') : 'N/A',
            'Age': calculateAge(emp.dateOfBirth),
            'Station': emp.station,
            'Date of Appointment': emp.dateOfAppointment ? format(parseISO(emp.dateOfAppointment), 'dd MMM, yyyy') : 'N/A',
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'RetirementReport');
        XLSX.writeFile(workbook, `RetirementReport_${retirementAge}Years.xlsx`);
    };

    const handlePdfExport = async () => {
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        doc.text(`Retirement Report (Employees at Age ${retirementAge})`, 14, 16);
        (doc as any).autoTable({
            startY: 22,
            head: [['Sr. No.', 'Full Name', 'Designation', 'Date of Birth', 'Age', 'Appointment Date']],
            body: retiringEmployees.map((emp, index) => [
                index + 1,
                emp.fullName,
                `${emp.designation} (${emp.bps})`,
                emp.dateOfBirth ? format(parseISO(emp.dateOfBirth), 'dd MMM, yyyy') : 'N/A',
                calculateAge(emp.dateOfBirth),
                emp.dateOfAppointment ? format(parseISO(emp.dateOfAppointment), 'dd MMM, yyyy') : 'N/A',
            ]),
            headStyles: { fillColor: [22, 163, 74] },
            styles: { cellPadding: 2, fontSize: 8, valign: 'top' },
        });

        doc.save(`RetirementReport_${retirementAge}Years.pdf`);
    };
    
    const handlePrint = () => { window.print(); };
    
    if (user?.role !== 'admin' && user?.role !== 'sub-admin') {
      return ( <div className="p-4"><p>You do not have permission to view this page.</p></div> )
    }

    return (
        <div className="space-y-8">
            <div className="no-print">
                <h1 className="text-3xl font-headline font-bold tracking-tight">Retirement Report</h1>
                <p className="text-muted-foreground">List of employees who are currently {retirementAge} years old.</p>
            </div>

            <Card className="no-print">
                <CardHeader>
                    <CardTitle>Export Report</CardTitle>
                    <CardDescription>Download the retirement report in various formats.</CardDescription>
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
                      <caption className="mt-4 text-sm text-muted-foreground">Retirement Report (Employees at Age {retirementAge})</caption>
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Sr. No.</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date of Birth</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Age</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Appointment Date</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Station</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {retiringEmployees.length > 0 ? retiringEmployees.map((employee, index) => (
                          <tr key={employee.id} className="border-b">
                            <td className="p-4 align-top">{index + 1}</td>
                            <td className="p-4 align-top">
                                <div className="font-medium">{employee.fullName}</div>
                                <div className="text-muted-foreground">{employee.designation} ({employee.bps})</div>
                            </td>
                            <td className="p-4 align-top">{employee.dateOfBirth ? format(parseISO(employee.dateOfBirth), 'dd MMM, yyyy') : 'N/A'}</td>
                            <td className="p-4 align-top">{calculateAge(employee.dateOfBirth)}</td>
                             <td className="p-4 align-top">{employee.dateOfAppointment ? format(parseISO(employee.dateOfAppointment), 'dd MMM, yyyy') : 'N/A'}</td>
                            <td className="p-4 align-top">{employee.station}</td>
                          </tr>
                        )) : (
                            <tr className="border-b">
                                <td colSpan={6} className="p-4 text-center text-muted-foreground">No employees found at age {retirementAge}.</td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
