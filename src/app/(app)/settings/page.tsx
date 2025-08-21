
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
    const { user, logoUrl, setLogoUrl } = useAuth();
    const [logoPreview, setLogoPreview] = React.useState<string | null>(logoUrl);
    const { toast } = useToast();

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

    const handleSave = () => {
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
                    <Button onClick={handleSave}>Save Logo</Button>
                </CardContent>
            </Card>
        </div>
    );
}
