
"use client"
import * as React from "react";
import { addDays, format, parseISO, isValid, formatRelative } from "date-fns";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, CheckCircle, XCircle, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { LeaveRequest } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function LeaveRecordPage() {
  const { user, employees, leaveRequests, setLeaveRequests, leavePolicies } = useAuth();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [leaveType, setLeaveType] = React.useState<string>();
  const [employeeId, setEmployeeId] = React.useState<string | undefined>(user?.role === 'employee' ? user.id : undefined);
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin';

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.cnic === id)?.fullName || "Unknown";
  }

  const handleRequestStatusChange = (requestId: string, newStatus: 'Approved' | 'Rejected') => {
    setLeaveRequests(currentRequests =>
      currentRequests.map(req => {
        if (req.id === requestId) {
          const newHistoryEntry = { status: newStatus, timestamp: new Date().toISOString() };
          return { 
            ...req, 
            status: newStatus,
            statusHistory: [...(req.statusHistory || []), newHistoryEntry] 
          };
        }
        return req;
      })
    );
    const employeeName = getEmployeeName(leaveRequests.find(r => r.id === requestId)!.employeeId);
    toast({
        title: `Request ${newStatus}`,
        description: `Leave request for ${employeeName} has been ${newStatus.toLowerCase()}.`
    })
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateRange?.from || !dateRange?.to || !leaveType || !employeeId) {
        toast({
            title: "Incomplete Form",
            description: "Please select an employee, leave type, and date range.",
            variant: "destructive"
        });
        return;
    }
    
    const policy = leavePolicies.find(p => p.type === leaveType);
    if (policy && policy.balance <= 0 && policy.type !== "Unpaid Leave") {
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
        fromDate: format(dateRange.from, "yyyy-MM-dd"),
        toDate: format(dateRange.to, "yyyy-MM-dd"),
        status: 'Pending',
        statusHistory: [{ status: 'Pending', timestamp: new Date().toISOString() }]
    };

    setLeaveRequests(currentRequests => [...currentRequests, newRequest]);
    const employeeName = employees.find(emp => emp.cnic === employeeId)?.fullName || "Unknown";

    toast({
        title: "Leave Request Submitted",
        description: `Request for ${employeeName} for ${leaveType} from ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")} has been submitted for approval.`,
    });
    
    // Reset form
    setDateRange({ from: new Date(), to: addDays(new Date(), 1) });
    setLeaveType(undefined);
    if(isAdmin) {
        setEmployeeId(undefined);
    }
  };

  
  const displayedLeaveRequests = isAdmin
    ? leaveRequests
    : leaveRequests.filter(req => req.employeeId === user?.id);

  React.useEffect(() => {
    if (user?.role === 'employee') {
        setEmployeeId(user.id);
    }
  }, [user]);

  const formatDateRange = (from: string, to: string) => {
    if(!from || !to) return "Invalid Dates";
    const fromDate = parseISO(from);
    const toDate = parseISO(to);
    if(isValid(fromDate) && isValid(toDate)) {
      return `${format(fromDate, "PPP")} to ${format(toDate, "PPP")}`;
    }
    return "Invalid Dates";
  }
  
  const formatHistoryTimestamp = (timestamp: string) => {
      if(!timestamp || !isValid(parseISO(timestamp))) return "Invalid Date";
      return format(parseISO(timestamp), "dd MMM, yyyy 'at' hh:mm a");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Leave Record</h1>
        <p className="text-muted-foreground">Manage your leave requests and balances.</p>
      </div>

      {!isAdmin && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {leavePolicies.map((policy) => (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Leave Request</CardTitle>
          <CardDescription>Submit a new request for time off. It will be sent for approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`grid gap-4 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
               {isAdmin && (
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select onValueChange={setEmployeeId} value={employeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.cnic} value={employee.cnic}>{employee.fullName}</SelectItem>
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
                    {leavePolicies.map(policy => (
                        <SelectItem key={policy.id} value={policy.type}>{policy.type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
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
                            <TableHead>Dates</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedLeaveRequests.map((request) => (
                            <TableRow key={request.id}>
                                {isAdmin && <TableCell className="font-medium">{getEmployeeName(request.employeeId)}</TableCell>}
                                <TableCell>{request.leaveType}</TableCell>
                                <TableCell>{formatDateRange(request.fromDate, request.toDate)}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        request.status === 'Pending' ? 'secondary' : 
                                        request.status === 'Approved' ? 'default' : 'destructive'
                                    } className={request.status === 'Approved' ? 'bg-green-500' : ''}>
                                        {request.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {isAdmin && (
                                        <>
                                            {request.status === 'Pending' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleRequestStatusChange(request.id, 'Approved')} title="Approve">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="sr-only">Approve</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleRequestStatusChange(request.id, 'Rejected')} title="Reject">
                                                        <XCircle className="h-4 w-4" />
                                                        <span className="sr-only">Reject</span>
                                                    </Button>
                                                </>
                                            )}
                                            {request.status === 'Approved' && (
                                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleRequestStatusChange(request.id, 'Rejected')} title="Reject">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="sr-only">Reject</span>
                                                </Button>
                                            )}
                                            {request.status === 'Rejected' && (
                                                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleRequestStatusChange(request.id, 'Approved')} title="Approve">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="sr-only">Approve</span>
                                                </Button>
                                            )}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" title="View History">
                                                        <History className="h-4 w-4" />
                                                        <span className="sr-only">View History</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Status History</DialogTitle>
                                                        <DialogDescription>
                                                            Log of status changes for leave request by {getEmployeeName(request.employeeId)}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        {request.statusHistory?.map((history, index) => (
                                                            <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                                <Badge variant={history.status === 'Pending' ? 'secondary' : history.status === 'Approved' ? 'default' : 'destructive'} className={history.status === 'Approved' ? 'bg-green-500' : ''}>{history.status}</Badge>
                                                                <span className="text-sm text-muted-foreground">{formatHistoryTimestamp(history.timestamp)}</span>
                                                            </div>
                                                        )).reverse()}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </>
                                    )}
                                    {!isAdmin && (
                                       <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" title="View History">
                                                    <History className="h-4 w-4" />
                                                    <span className="sr-only">View History</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Status History</DialogTitle>
                                                    <DialogDescription>
                                                        Log of status changes for your leave request.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    {request.statusHistory?.map((history, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                                            <Badge variant={history.status === 'Pending' ? 'secondary' : history.status === 'Approved' ? 'default' : 'destructive'} className={history.status === 'Approved' ? 'bg-green-500' : ''}>{history.status}</Badge>
                                                            <span className="text-sm text-muted-foreground">{formatHistoryTimestamp(history.timestamp)}</span>
                                                        </div>
                                                    )).reverse()}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </TableCell>
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

    