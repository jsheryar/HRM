
"use client"
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Employee } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyRound, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function SettingsPage() {
    const { user, logoUrl, setLogoUrl, changePassword, users, setUsers } = useAuth();
    const [logoPreview, setLogoPreview] = React.useState<string | null>(logoUrl);
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");

    // State for user management
    const [isUserFormOpen, setIsUserFormOpen] = React.useState(false);
    const [isUserDeleteAlertOpen, setIsUserDeleteAlertOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [userToDelete, setUserToDelete] = React.useState<string | null>(null);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setLogoPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
    }

    const handleSaveLogo = () => {
        if(logoPreview) {
            setLogoUrl(logoPreview);
            toast({
                title: "Success",
                description: "Company logo updated successfully.",
            });
        } else {
             toast({
                title: "Error",
                description: "No logo selected to save.",
                variant: "destructive",
            });
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
            return;
        }
        if (!user) return;

        const success = await changePassword(user.id, currentPassword, newPassword);

        if (success) {
            toast({ title: "Success", description: "Password changed successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } else {
            toast({ title: "Error", description: "Failed to change password. Please check your current password.", variant: "destructive" });
        }
    }

     const openUserFormDialog = (user: User | null = null) => {
        setSelectedUser(user);
        setIsUserFormOpen(true);
    };

    const handleUserFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as User['role'];
        const password = formData.get("password") as string;

        if(!name || !email || !role || (!selectedUser && !password) ) {
            toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        if (selectedUser) {
             setUsers(currentUsers =>
                currentUsers.map(u => {
                    if (u.id === selectedUser.id) {
                        const updatedUser = { ...u, name, email, role };
                        if (password) {
                           (updatedUser as any).password = password;
                        }
                        return updatedUser;
                    }
                    return u;
                })
            );
            toast({ title: "Success", description: "User updated successfully." });
        } else {
             const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                role,
                password
            };
            setUsers(currentUsers => [...currentUsers, newUser]);
            toast({ title: "Success", description: "New user created." });
        }

        setIsUserFormOpen(false);
        setSelectedUser(null);
    }
    
    const handleDeleteUserClick = (userId: string) => {
        if(userId === 'admin') {
            toast({ title: "Error", description: "Cannot delete the main admin account.", variant: "destructive"});
            return;
        }
        setUserToDelete(userId);
        setIsUserDeleteAlertOpen(true);
    }

    const handleDeleteUserConfirm = () => {
        if(userToDelete) {
            setUsers(users => users.filter(u => u.id !== userToDelete));
            toast({ title: "Success", description: "User has been deleted." });
        }
        setIsUserDeleteAlertOpen(false);
        setUserToDelete(null);
    }


    if (user?.role !== 'Admin') {
      return ( <div className="p-4"><p>You do not have permission to view this page.</p></div> )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage application-wide settings and branding.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Logo</CardTitle>
                    <CardDescription>Upload your company logo. This will be displayed in the sidebar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo Image</Label>
                        <div className="flex items-center gap-4">
                            {logoPreview ? (
                                <Image 
                                    src={logoPreview} 
                                    alt="Company logo preview" 
                                    width={120} 
                                    height={40}
                                    className="h-10 w-auto rounded-md border p-1"
                                    data-ai-hint="logo"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-10 w-32 rounded-md border border-dashed">
                                    <span className="text-xs text-muted-foreground">No Logo</span>
                                </div>
                            )}
                            <Input id="logo" name="logo" type="file" onChange={handlePhotoChange} accept="image/*" />
                        </div>
                    </div>
                    <Button onClick={handleSaveLogo}>Save Logo</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update the password for your admin account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-sm">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <Button type="submit">Save Password</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Create and manage users with different access levels.</CardDescription>
                         </div>
                         <Dialog open={isUserFormOpen} onOpenChange={(isOpen) => { setIsUserFormOpen(isOpen); if (!isOpen) setSelectedUser(null); }}>
                            <DialogTrigger asChild>
                                <Button onClick={() => openUserFormDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add User
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUserFormSubmit}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" defaultValue={selectedUser?.name} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email (Login ID)</Label>
                                            <Input id="email" name="email" type="email" defaultValue={selectedUser?.email} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select name="role" defaultValue={selectedUser?.role} required>
                                                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sub Admin">Sub Admin</SelectItem>
                                                    <SelectItem value="Editor">Editor</SelectItem>
                                                    <SelectItem value="Data Entry Operator">Data Entry Operator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input id="password" name="password" type="password" placeholder={selectedUser ? 'Leave blank to keep unchanged' : ''} required={!selectedUser} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Save User</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                         </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(u => (
                                    u.role !== 'employee' &&
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => openUserFormDialog(u)}>
                                                <Pencil className="h-4 w-4" /> <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUserClick(u.id)} className="text-destructive hover:text-destructive" disabled={u.role === 'Admin'}>
                                                <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
            </Card>

            <AlertDialog open={isUserDeleteAlertOpen} onOpenChange={setIsUserDeleteAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteUserConfirm}>Delete</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
