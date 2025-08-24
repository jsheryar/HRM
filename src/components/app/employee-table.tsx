
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, KeyRound, CalendarDays, Award, CheckSquare, TrendingUp, ArrowUpCircle, Briefcase } from "lucide-react";
import type { Employee } from "@/lib/data";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  onManagePassword: (employee: Employee) => void;
  permissions: {
      canEdit: boolean;
      canDelete: boolean;
      canManagePassword: boolean;
      canViewLeaveDetails: boolean;
  }
  selectedEmployeeIds: Set<string>;
  setSelectedEmployeeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = parseISO(dateString);
  if (isValid(date)) {
    return format(date, "MMM yyyy");
  }
  return 'Invalid date';
}


export function EmployeeTable({ employees, onEdit, onDelete, onManagePassword, permissions, selectedEmployeeIds, setSelectedEmployeeIds }: EmployeeTableProps) {
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(new Set(employees.map(e => e.id)));
    } else {
      setSelectedEmployeeIds(new Set());
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedEmployeeIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedEmployeeIds(newSet);
  }
  
  const isAllSelected = employees.length > 0 && selectedEmployeeIds.size === employees.length;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {permissions.canDelete && <TableHead className="w-[50px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                aria-label="Select all rows"
              />
            </TableHead>}
            <TableHead>Employee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Appointment</TableHead>
            <TableHead>Transfer History</TableHead>
            <TableHead>Promotion History</TableHead>
            <TableHead>Upgradation History</TableHead>
            <TableHead>Training & Certs</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <TableRow key={employee.id} data-state={selectedEmployeeIds.has(employee.id) ? "selected" : ""}>
                 {permissions.canDelete && <TableCell>
                   <Checkbox
                      checked={selectedEmployeeIds.has(employee.id)}
                      onCheckedChange={(checked) => handleSelectOne(employee.id, Boolean(checked))}
                      aria-label={`Select row for ${employee.fullName}`}
                    />
                </TableCell>}
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
                        DOB: {isValid(new Date(employee.dateOfBirth)) ? format(new Date(employee.dateOfBirth), "dd MMM, yyyy") : 'N/A'}
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
                  <div className="text-sm text-muted-foreground">Domicile: {employee.domicile}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{isValid(new Date(employee.dateOfAppointment)) ? format(new Date(employee.dateOfAppointment), "dd MMM, yyyy") : 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{employee.station}</div>
                </TableCell>
                 <TableCell>
                  {employee.transferHistory && employee.transferHistory.length > 0 ? (
                    <ul className="text-sm text-muted-foreground list-disc pl-4">
                      {employee.transferHistory.map((t, i) => (
                        <li key={i}>
                          {t.station} ({t.fromDate ? formatDate(t.fromDate) : ''} - {t.toDate ? formatDate(t.toDate) : 'Present'})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">No transfers</span>
                  )}
                </TableCell>
                <TableCell>
                  {employee.promotionHistory && employee.promotionHistory.length > 0 ? (
                    <ul className="text-sm text-muted-foreground list-disc pl-4">
                      {employee.promotionHistory.map((p, i) => (
                        <li key={i}>
                          {p.designation} ({p.bps}) on {formatDate(p.date)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">No promotions</span>
                  )}
                </TableCell>
                 <TableCell>
                  {employee.upgradationHistory && employee.upgradationHistory.length > 0 ? (
                    <ul className="text-sm text-muted-foreground list-disc pl-4">
                      {employee.upgradationHistory.map((u, i) => (
                        <li key={i}>
                          {u.designation} ({u.bps}) on {formatDate(u.date)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">No upgradations</span>
                  )}
                </TableCell>
                 <TableCell>
                    <div className="text-sm text-muted-foreground space-y-2">
                        {employee.trainings && employee.trainings.length > 0 && (
                            <div className="flex items-start gap-1.5">
                                <CheckSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                <ul>
                                    {employee.trainings.map((t, i) => <li key={i}>{t.name} ({formatDate(t.date)})</li>)}
                                </ul>
                            </div>
                        )}
                        {employee.certificates && employee.certificates.length > 0 && (
                             <div className="flex items-start gap-1.5">
                                <Award className="h-4 w-4 mt-0.5 shrink-0" />
                                <ul>
                                    {employee.certificates.map((c, i) => <li key={i}>{c.name} ({formatDate(c.date)})</li>)}
                                </ul>
                            </div>
                        )}
                         {(!employee.trainings || employee.trainings.length === 0) && (!employee.certificates || employee.certificates.length === 0) &&
                            <span>No records</span>
                         }
                    </div>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.status === 'Active' ? 'default' : 'destructive'} className={employee.status === 'Active' ? 'bg-green-500' : ''}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    {permissions.canEdit && <Button variant="ghost" size="icon" onClick={() => onEdit(employee)} title="Edit Employee">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>}
                     {permissions.canManagePassword && <Button variant="ghost" size="icon" onClick={() => onManagePassword(employee)} title="Manage Credentials">
                        <KeyRound className="h-4 w-4" />
                        <span className="sr-only">Manage Credentials</span>
                    </Button>}
                     {permissions.canViewLeaveDetails && <Button variant="ghost" size="icon" asChild title="Leave Details">
                        <Link href={`/employees/${employee.id}/leave-details`}>
                            <CalendarDays className="h-4 w-4" />
                            <span className="sr-only">Leave Details</span>
                        </Link>
                    </Button>}
                    {permissions.canDelete && <Button variant="ghost" size="icon" onClick={() => onDelete(employee.id)} className="text-destructive hover:text-destructive" title="Delete Employee">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No employees found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

    