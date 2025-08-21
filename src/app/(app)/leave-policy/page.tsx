
"use client"
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { LeavePolicy } from "@/lib/data";

export default function LeavePolicyPage() {
  const { leavePolicies, setLeavePolicies, user } = useAuth();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedPolicy, setSelectedPolicy] = React.useState<LeavePolicy | null>(null);
  const [policyToDelete, setPolicyToDelete] = React.useState<string | null>(null);

  const openFormDialog = (policy: LeavePolicy | null = null) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    const balance = Number(formData.get("balance"));

    if (!type || isNaN(balance)) {
      toast({ title: "Error", description: "Please fill out all fields correctly.", variant: "destructive" });
      return;
    }

    if (selectedPolicy) {
      // Edit existing policy
      setLeavePolicies(policies =>
        policies.map(p => (p.id === selectedPolicy.id ? { ...p, type, balance } : p))
      );
      toast({ title: "Success", description: "Leave policy updated successfully." });
    } else {
      // Add new policy
      const newPolicy: LeavePolicy = {
        id: `LPOL${String(leavePolicies.length + 1).padStart(3, '0')}`,
        type,
        balance,
      };
      setLeavePolicies(policies => [...policies, newPolicy]);
      toast({ title: "Success", description: "New leave policy added." });
    }

    setIsFormOpen(false);
    setSelectedPolicy(null);
  };
  
  const handleDeleteClick = (policyId: string) => {
    setPolicyToDelete(policyId);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (policyToDelete) {
      setLeavePolicies(policies => policies.filter(p => p.id !== policyToDelete));
      toast({
        title: "Success",
        description: "Leave policy deleted.",
      });
    }
    setIsDeleteAlertOpen(false);
    setPolicyToDelete(null);
  }

  if (user?.role !== 'Admin' && user?.role !== 'Sub Admin') {
      return (
          <div className="p-4">
              <p>You do not have permission to view this page.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Leave Policy</h1>
            <p className="text-muted-foreground">Manage leave types and their annual balances for employees.</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setSelectedPolicy(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => openFormDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedPolicy ? 'Edit Leave Policy' : 'Add New Leave Policy'}</DialogTitle>
                    <DialogDescription>
                        {selectedPolicy ? 'Update the details for this leave type.' : 'Define a new type of leave available to employees.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFormSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Leave Type Name</Label>
                            <Input id="type" name="type" defaultValue={selectedPolicy?.type} placeholder="e.g., Annual Leave" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balance">Annual Balance (Days)</Label>
                            <Input id="balance" name="balance" type="number" defaultValue={selectedPolicy?.balance} placeholder="e.g., 12" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">{selectedPolicy ? 'Save Changes' : 'Add Policy'}</Button>
                    </DialogFooter>
                </form>
              </DialogContent>
          </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave Type</TableHead>
              <TableHead>Annual Balance (Days)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leavePolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">{policy.type}</TableCell>
                <TableCell>{policy.balance}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openFormDialog(policy)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(policy.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the leave policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
