import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { employees } from "@/lib/data";
import { differenceInDays, parseISO } from 'date-fns';

const documents = [
  {
    employeeId: "EMP005",
    docType: "Employment Contract",
    issueDate: "2023-03-01",
    expiryDate: "2024-02-29",
  },
  {
    employeeId: "EMP008",
    docType: "Employment Contract",
    issueDate: "2023-06-12",
    expiryDate: "2024-06-11",
  },
  {
    employeeId: "EMP001",
    docType: "Aadhar Card",
    issueDate: "2020-01-15",
    expiryDate: null,
  },
  {
    employeeId: "EMP002",
    docType: "PAN Card",
    issueDate: "2019-03-22",
    expiryDate: null,
  },
  {
    employeeId: "EMP006",
    docType: "Medical Insurance",
    issueDate: "2023-07-22",
    expiryDate: "2024-07-21",
  },
   {
    employeeId: "EMP014",
    docType: "Employment Contract",
    issueDate: "2022-08-20",
    expiryDate: "2023-08-19",
  },
];

const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || "Unknown Employee";
}

const getExpiryBadge = (expiryDate: string | null) => {
    if (!expiryDate) return <Badge variant="secondary">N/A</Badge>;
    
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    
    if (daysUntilExpiry < 0) return <Badge variant="destructive">Expired</Badge>;
    if (daysUntilExpiry <= 30) return <Badge variant="outline" className="bg-yellow-200 text-yellow-800">Expires Soon</Badge>;
    
    return <Badge variant="default" className="bg-green-500">Valid</Badge>;
}

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Digital Filing Cabinet</h1>
        <p className="text-muted-foreground">Manage and track employee documents and their expiry.</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableCaption>A list of employee documents.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{getEmployeeName(doc.employeeId)}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{doc.docType}</span>
                    </div>
                </TableCell>
                <TableCell>{doc.expiryDate || "N/A"}</TableCell>
                <TableCell>{getExpiryBadge(doc.expiryDate)}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
