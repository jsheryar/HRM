
"use client";
import * as React from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid, differenceInDays } from "date-fns";
import { LeaveRequest } from "@/lib/data";

export default function EmployeeLeaveDetailsPage() {
  const params = useParams();
  const employeeId = params.employeeId as string;
  const { employees, leaveRequests, leavePolicies, user } = useAuth();

  const employee = React.useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId]
  );

  const employeeLeaveRequests = React.useMemo(
    () => leaveRequests.filter((req) => req.employeeId === employeeId),
    [leaveRequests, employeeId]
  );
  
  const calculateLeaveDays = (request: LeaveRequest) => {
    const from = parseISO(request.fromDate);
    const to = parseISO(request.toDate);
    if (isValid(from) && isValid(to)) {
      return differenceInDays(to, from) + 1;
    }
    return 0;
  };
  
  const leaveBalances = React.useMemo(() => {
    return leavePolicies.map(policy => {
      const taken = employeeLeaveRequests
        .filter(req => req.leaveType === policy.type && req.status === 'Approved')
        .reduce((acc, current) => acc + calculateLeaveDays(current), 0);
      return {
        ...policy,
        balance: policy.balance - taken
      };
    });
  }, [leavePolicies, employeeLeaveRequests]);

  const formatDateRange = (from: string, to: string) => {
    if (!from || !to) return "Invalid Dates";
    const fromDate = parseISO(from);
    const toDate = parseISO(to);
    if (isValid(fromDate) && isValid(toDate)) {
      return `${format(fromDate, "dd MMM, yyyy")} to ${format(toDate, "dd MMM, yyyy")}`;
    }
    return "Invalid Dates";
  };
  
  if (user?.role !== 'admin') {
      return (
        <div className="p-4">
            <p>You do not have permission to view this page.</p>
        </div>
    )
  }

  if (!employee) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Employee not found</h1>
        <p>The employee with ID "{employeeId}" could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Leave Details: {employee.fullName}
        </h1>
        <p className="text-muted-foreground">
          A detailed view of leave balances and history for {employee.designation}.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {leaveBalances.map((policy) => (
            policy.type !== "Unpaid Leave" && (
              <Card key={policy.id}>
                  <CardHeader>
                      <CardTitle>{policy.type}</CardTitle>
                      <CardDescription>Days remaining</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="text-4xl font-bold">{policy.balance}</p>
                  </CardContent>
              </Card>
            )
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Request History</CardTitle>
          <CardDescription>A log of all leave requests submitted by this employee.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeLeaveRequests.length > 0 ? (
                  employeeLeaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.leaveType}</TableCell>
                      <TableCell>{formatDateRange(request.fromDate, request.toDate)}</TableCell>
                       <TableCell>{calculateLeaveDays(request)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === 'Pending' ? 'secondary'
                              : request.status === 'Approved' ? 'default'
                              : 'destructive'
                          }
                          className={request.status === 'Approved' ? 'bg-green-500' : ''}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No leave requests found for this employee.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
