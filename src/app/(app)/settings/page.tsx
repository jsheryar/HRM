
"use client"
import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
    const { user, logoUrl, setLogoUrl, changePassword } = useAuth();
    const [logoPreview, setLogoPreview] = React.useState<string | null>(logoUrl);
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");


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

    if (user?.role !== 'admin') {
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
                    <form onSubmit={handlePasswordChange} className="space-y-6">
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
        </div>
    );
}
