"use client"
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, MinusCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { employees } from "@/lib/data";
import { Label } from "@/components/ui/label";

export default function LeaveRecordPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [leaveType, setLeaveType] = React.useState<string>();
  const [employeeId, setEmployeeId] = React.useState<string>();
  const { toast } = useToast();

  const leaveBalances = {
    "Annual Leave": 12,
    "Sick Leave": 8,
    "Casual Leave": 5,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !leaveType || !employeeId) {
        toast({
            title: "Incomplete Form",
            description: "Please select an employee, leave type, and date.",
            variant: "destructive"
        });
        return;
    }
    
    // Mock AI check for negative balance
    if (leaveBalances[leaveType as keyof typeof leaveBalances] <= 0) {
      toast({
          title: "AI Check Failed",
          description: "Cannot request leave. Your balance for this leave type is zero or negative.",
          variant: "destructive"
      });
      return;
    }

    const employeeName = employees.find(emp => emp.id === employeeId)?.fullName || "Unknown";

    toast({
        title: "Leave Request Submitted",
        description: `Request for ${employeeName} for ${leaveType} on ${format(date, "PPP")} has been submitted for approval.`,
    });
  };


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
          <CardDescription>Submit a new request for time off. It will be sent to a manager for approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
               <div className="space-y-2">
                <Label>Employee</Label>
                <Select onValueChange={setEmployeeId}>
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
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select onValueChange={setLeaveType}>
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
    </div>
  );
}
