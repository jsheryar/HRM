
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Printer } from "lucide-react";
import { Employee } from "@/lib/data";
import { generateExplanationLetter, GenerateLetterInput } from "@/ai/flows/generate-letter-flow";

export default function ExplanationLetterPage() {
    const { employees, user } = useAuth();
    const { toast } = useToast();
    const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | undefined>();
    const [reason, setReason] = React.useState("");
    const [generatedLetter, setGeneratedLetter] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    
    const letterRef = React.useRef<HTMLDivElement>(null);

    const handleGenerateLetter = async () => {
        if (!selectedEmployeeId || !reason) {
            toast({
                title: "Error",
                description: "Please select an employee and provide a reason.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setGeneratedLetter("");

        try {
            const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
            if (!selectedEmployee) {
                 toast({ title: "Error", description: "Selected employee not found.", variant: "destructive" });
                 setIsLoading(false);
                 return;
            }

            const input: GenerateLetterInput = {
                employeeName: selectedEmployee.fullName,
                employeeDesignation: selectedEmployee.designation,
                reason: reason,
            };
            
            const result = await generateExplanationLetter(input);
            
            if (result.letter) {
                setGeneratedLetter(result.letter.replace(/\n/g, '<br />'));
                toast({ title: "Success", description: "Explanation letter generated." });
            } else {
                 toast({ title: "Error", description: "AI failed to generate a letter. Please try again.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error generating letter:", error);
            toast({ title: "Error", description: "An unexpected error occurred while generating the letter.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=800');
        if(printWindow && letterRef.current) {
            printWindow.document.write('<html><head><title>Explanation Letter</title>');
            printWindow.document.write('<style>body { font-family: sans-serif; line-height: 1.5; } .letter-content { white-space: pre-wrap; word-wrap: break-word; }</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<div class="letter-content">${generatedLetter.replace(/<br \/>/g, '\n')}</div>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const userRole = user?.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'sub admin') {
        return <div className="p-4"><p>You do not have permission to view this page.</p></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Issue Explanation Letter</h1>
                <p className="text-muted-foreground">Select an employee and generate an explanation letter using AI.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Letter Details</CardTitle>
                        <CardDescription>Provide the necessary information for the letter.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee">Select Employee</Label>
                            <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((emp: Employee) => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.fullName} ({emp.designation})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Explanation Letter</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Unsanctioned absence from duty on..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={5}
                            />
                        </div>
                        <Button onClick={handleGenerateLetter} disabled={isLoading}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isLoading ? 'Generating...' : 'Generate Letter'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Generated Letter</CardTitle>
                                <CardDescription>Review the AI-generated letter below.</CardDescription>
                            </div>
                            <Button variant="outline" size="icon" onClick={handlePrint} disabled={!generatedLetter}>
                                <Printer className="h-4 w-4"/>
                                <span className="sr-only">Print</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading && (
                             <div className="flex items-center justify-center p-8">
                                <p>Generating, please wait...</p>
                            </div>
                        )}
                        {generatedLetter && (
                            <div ref={letterRef} className="prose prose-sm max-w-none rounded-md border p-4" dangerouslySetInnerHTML={{ __html: generatedLetter }} />
                        )}
                         {!isLoading && !generatedLetter && (
                             <div className="flex items-center justify-center p-8 rounded-md border border-dashed">
                                <p className="text-sm text-muted-foreground">The generated letter will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
