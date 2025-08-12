"use client";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Employee } from "@/lib/data";
import { format } from "date-fns";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Appointment</TableHead>
            <TableHead>Transfer History</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.photo} alt={employee.fullName} data-ai-hint="person avatar" />
                      <AvatarFallback>
                        {employee.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        S/o {employee.fatherName}
                      </div>
                       <div className="text-sm text-muted-foreground">
                        {employee.designation} ({employee.bps})
                      </div>
                       <div className="text-sm text-muted-foreground">
                        DOB: {format(new Date(employee.dateOfBirth), "dd MMM, yyyy")}
                      </div>
                       <div className="text-sm text-muted-foreground">
                        Education: {employee.education}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{employee.mobileNumber}</div>
                  <div className="text-sm text-muted-foreground">{employee.email}</div>
                  <div className="text-sm text-muted-foreground">CNIC: {employee.cnic}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{format(new Date(employee.dateOfAppointment), "dd MMM, yyyy")}</div>
                  <div className="text-sm text-muted-foreground">{employee.stationOfAppointment}</div>
                </TableCell>
                 <TableCell>
                  {employee.transferHistory.length > 0 ? (
                    <ul className="text-sm text-muted-foreground list-disc pl-4">
                      {employee.transferHistory.map((t, i) => (
                        <li key={i}>
                          {t.station} ({format(new Date(t.fromDate), "MMM yyyy")} - {t.toDate ? format(new Date(t.toDate), "MMM yyyy") : 'Present'})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">No transfers</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className={employee.status === 'Active' ? 'bg-green-500' : ''}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(employee.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
