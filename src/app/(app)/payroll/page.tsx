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

const salaryStructures = [
  {
    designation: "Software Engineer",
    location: "Head Office",
    baseSalary: "₹ 1,200,000",
    grade: "L3",
    allowances: "Standard",
  },
  {
    designation: "HR Manager",
    location: "Zonal Office",
    baseSalary: "₹ 900,000",
    grade: "M2",
    allowances: "Zonal + HRA",
  },
  {
    designation: "Supervisor",
    location: "Labour Colony",
    baseSalary: "₹ 450,000",
    grade: "S1",
    allowances: "Colony + PF/ESI",
  },
  {
    designation: "Labourer",
    location: "Labour Colony",
    baseSalary: "₹ 9,000 / month",
    grade: "D-W",
    allowances: "PF/ESI",
  },
  {
    designation: "Zonal Manager",
    location: "Zonal Office",
    baseSalary: "₹ 1,500,000",
    grade: "M4",
    allowances: "Zonal + HRA + Car",
  },
  {
    designation: "Accountant",
    location: "Head Office",
    baseSalary: "₹ 750,000",
    grade: "L2",
    allowances: "Standard",
  },
];

export default function PayrollPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Payroll Management</h1>
        <p className="text-muted-foreground">Define and view salary structures for different roles and locations.</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableCaption>A list of defined salary structures.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Designation</TableHead>
              <TableHead>Location Type</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Base Salary (p.a.)</TableHead>
              <TableHead>Allowances</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salaryStructures.map((structure) => (
              <TableRow key={structure.designation + structure.location}>
                <TableCell className="font-medium">{structure.designation}</TableCell>
                <TableCell>
                  <Badge variant={
                    structure.location === 'Head Office' ? 'default' :
                    structure.location === 'Zonal Office' ? 'secondary' : 'outline'
                  }>
                    {structure.location}
                  </Badge>
                </TableCell>
                <TableCell>{structure.grade}</TableCell>
                <TableCell>{structure.baseSalary}</TableCell>
                <TableCell>{structure.allowances}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
