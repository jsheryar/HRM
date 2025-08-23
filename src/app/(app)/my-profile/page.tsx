
"use client"
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/lib/data";
import { format, isValid, parseISO, intervalToDuration } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { CheckSquare, Award, TrendingUp } from "lucide-react";

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, "dd MMM, yyyy");
    }
    return 'Invalid date';
}

const formatTenure = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    if (isValid(date)) {
        const today = new Date();
        const duration = intervalToDuration({ start: date, end: today });
        let tenure = "";
        if (duration.years) tenure += `${duration.years} years, `;
        if(duration.months) tenure += `${duration.months} months`;
        return tenure || "0 months";
    }
    return 'Invalid date';
}

export default function MyProfilePage() {
  const { user, employees } = useAuth();
  const [employee, setEmployee] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    if(user?.role !== 'Admin') {
      const foundEmployee = employees.find(e => e.cnic === user?.id);
      setEmployee(foundEmployee || null);
    } else {
      // Admins should be redirected, but as a fallback, show a message.
      setEmployee(null);
    }
  }, [user, employees]);

  if (!employee) {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold tracking-tight">My Profile</h1>
            <Card>
                <CardContent className="pt-6">
                    <p>{user?.role === 'Admin' ? "Admins do not have a profile page. Please navigate using the sidebar." : "Loading employee data..."}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Your personal and employment details.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardContent className="pt-6 flex flex-col items-center text-center">
                   <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={employee.photo} alt={employee.fullName} data-ai-hint="person avatar" />
                      <AvatarFallback>
                        {employee.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{employee.fullName}</h2>
                    <p className="text-muted-foreground">{employee.designation}</p>
                    <Badge className="mt-2" variant={employee.status === 'Active' ? 'default' : 'destructive'}>{employee.status}</Badge>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <p><span className="font-medium">Email:</span> {employee.email}</p>
                   <p><span className="font-medium">Mobile:</span> {employee.mobileNumber}</p>
                   <p><span className="font-medium">CNIC:</span> {employee.cnic}</p>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div><span className="font-medium">Employee ID:</span> {employee.cnic}</div>
                    <div><span className="font-medium">Department:</span> {employee.department}</div>
                    <div><span className="font-medium">BPS:</span> {employee.bps}</div>
                    <div><span className="font-medium">Employment Type:</span> {employee.employmentType}</div>
                    <div><span className="font-medium">Date of Appointment:</span> {formatDate(employee.dateOfAppointment)}</div>
                     <div><span className="font-medium">Total Tenure:</span> {formatTenure(employee.dateOfAppointment)}</div>
                    <div><span className="font-medium">Current Station:</span> {employee.station}</div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div><span className="font-medium">Father's Name:</span> {employee.fatherName}</div>
                    <div><span className="font-medium">Date of Birth:</span> {formatDate(employee.dateOfBirth)}</div>
                    <div><span className="font-medium">Domicile:</span> {employee.domicile}</div>
                    <div><span className="font-medium">Education:</span> {employee.education}</div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Promotion History</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.promotionHistory && employee.promotionHistory.length > 0 ? (
                    <ul className="space-y-3">
                      {employee.promotionHistory.map((p, i) => (
                        <li key={i} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                           <span>{p.designation} ({p.bps})</span>
                           <span>{formatDate(p.date)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No promotion history recorded.</p>
                  )}
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>Transfer History</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.transferHistory && employee.transferHistory.length > 0 ? (
                    <ul className="space-y-3">
                      {employee.transferHistory.map((t, i) => (
                        <li key={i} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                           <span>{t.station}</span>
                           <span>{formatDate(t.fromDate)} - {t.toDate ? formatDate(t.toDate) : 'Present'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No transfer history recorded.</p>
                  )}
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5"/> Trainings Attended</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.trainings && employee.trainings.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {employee.trainings.map((t, i) => (
                        <li key={i} className="text-sm">
                           {t.name} ({formatDate(t.date)})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No training records found.</p>
                  )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Certificates Awarded</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.certificates && employee.certificates.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {employee.certificates.map((c, i) => (
                        <li key={i} className="text-sm">
                           {c.name} ({formatDate(c.date)})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No certificates recorded.</p>
                  )}
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}

    