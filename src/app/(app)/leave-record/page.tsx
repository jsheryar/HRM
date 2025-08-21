
"use client"
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { employees, leaveRequests as initialLeaveRequests, LeaveRequest } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export default function LeaveRecordPage() {
  const { user } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [leaveType, setLeaveType] = React.useState<string>();
  const [employeeId, setEmployeeId] = React.useState<string | undefined>(user?.role === 'admin' ? undefined : user?.id);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>(initialLeaveRequests);
  const { toast } = useToast();

  const leaveBalances = {
    "Annual Leave": 12,
    "Sick Leave": 8,
    "Casual Leave": 5,
  };
  
  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.fullName || "Unknown";
  }

  const handleRequestStatusChange = (requestId: string, newStatus: 'Approved' | 'Rejected') => {
    setLeaveRequests(currentRequests =>
      currentRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
    const employeeName = getEmployeeName(leaveRequests.find(r => r.id === requestId)!.employeeId);
    toast({
        title: `Request ${newStatus}`,
        description: `Leave request for ${employeeName} has been ${newStatus.toLowerCase()}.`
    })
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !leaveType || !employeeId) {
        toast({
            title: "Incomplete Form",
            description: "Please select a leave type and date.",
            variant: "destructive"
        });
        return;
    }
    
    if (leaveBalances[leaveType as keyof typeof leaveBalances] <= 0) {
      toast({
          title: "AI Check Failed",
          description: "Cannot request leave. Your balance for this leave type is zero or negative.",
          variant: "destructive"
      });
      return;
    }

    const newRequest: LeaveRequest = {
        id: `LVE${String(leaveRequests.length + 1).padStart(3, '0')}`,
        employeeId,
        leaveType,
        date: format(date, "yyyy-MM-dd"),
        status: 'Pending',
    };

    setLeaveRequests(currentRequests => [...currentRequests, newRequest]);
    const employeeName = employees.find(emp => emp.id === employeeId)?.fullName || "Unknown";

    toast({
        title: "Leave Request Submitted",
        description: `Request for ${employeeName} for ${leaveType} on ${format(date, "PPP")} has been submitted for approval.`,
    });
  };

  const isAdmin = user?.role === 'admin';
  const displayedLeaveRequests = isAdmin
    ? leaveRequests
    : leaveRequests.filter(req => req.employeeId === user?.id);

  React.useEffect(() => {
    if (user?.role === 'employee') {
        setEmployeeId(user.id);
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Leave Record</h1>
        <p className="text-muted-foreground">Manage your leave requests and balances.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(leaveBalances).map(([type, days]) => (
            <Card key={type}>
                <CardHeader>
                    <CardTitle>{type}</CardTitle>
                    <CardDescription>Days remaining</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{days}</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Leave Request</CardTitle>
          <CardDescription>Submit a new request for time off. It will be sent for approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
               {isAdmin && (
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select onValueChange={setEmployeeId} value={employeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>{employee.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
               )}
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select onValueChange={setLeaveType} value={leaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                    <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button type="submit">Submit Request</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Leave Approval" : "My Leave Requests"}</CardTitle>
          <CardDescription>{isAdmin ? "Review and approve or reject leave requests." : "A history of your submitted leave requests."}</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {isAdmin && <TableHead>Employee</TableHead>}
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedLeaveRequests.map((request) => (
                            <TableRow key={request.id}>
                                {isAdmin && <TableCell className="font-medium">{getEmployeeName(request.employeeId)}</TableCell>}
                                <TableCell>{request.leaveType}</TableCell>
                                <TableCell>{format(parseISO(request.date), "PPP")}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        request.status === 'Pending' ? 'secondary' : 
                                        request.status === 'Approved' ? 'default' : 'destructive'
                                    } className={request.status === 'Approved' ? 'bg-green-500' : ''}>
                                        {request.status}
                                    </Badge>
                                </TableCell>
                                {isAdmin && <TableCell className="text-right">
                                    {request.status === 'Pending' && (
                                        <>
                                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleRequestStatusChange(request.id, 'Approved')}>
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="sr-only">Approve</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleRequestStatusChange(request.id, 'Rejected')}>
                                                <XCircle className="h-4 w-4" />
                                                <span className="sr-only">Reject</span>
                                            </Button>
                                        </>
                                    )}
                                </TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
