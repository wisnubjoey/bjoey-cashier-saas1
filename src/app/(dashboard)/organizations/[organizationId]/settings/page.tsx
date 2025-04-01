"use client";

import { useState, useEffect, use } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { withAdminAuth } from "@/components/withAdminAuth";

function SettingsPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = use(params);
  const { user } = useUser();
  const router = useRouter();

  const [orgDetails, setOrgDetails] = useState<{
    name: string;
    adminPassword: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Fetch organization details
  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}`);
        if (!response.ok) throw new Error("Failed to fetch organization details");
        const data = await response.json();
        setOrgDetails(data);
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast.error("Error", {
          description: "Failed to load organization details"
        });
      }
    };

    fetchOrgDetails();
  }, [organizationId]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!passwordForm.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/organizations/${organizationId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }
      
      // Reset form and close dialog
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordDialogOpen(false);
      
      toast.success("Password updated", {
        description: "Admin password has been updated successfully"
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    setDeleteError(null);
    
    // Validate admin password
    if (!adminPassword) {
      setDeleteError("Admin password is required");
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify admin password first
      const verifyResponse = await fetch(`/api/organizations/${organizationId}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Incorrect admin password");
      }
      
      // If password is correct, proceed with deletion
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete organization");
      }
      
      toast.success("Organization deleted", {
        description: "The organization has been permanently deleted"
      });
      
      // Redirect to organizations page
      router.push("/organizations");
    } catch (error) {
      console.error("Error deleting organization:", error);
      setDeleteError(error instanceof Error ? error.message : "Failed to delete organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Account</CardTitle>
              <CardDescription>
                Manage your personal account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0">
                  <UserButton />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.fullName || user?.username}</h3>
                  <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Account Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click on your profile picture above to manage your account settings, 
                  including password, email, and profile information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage settings for this organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Admin Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The admin password is used for administrative access to the POS system.
                  This password is shared with staff who need to access administrative functions.
                </p>
                <div className="flex items-center gap-2">
                  <input 
                    type="password" 
                    value="••••••••" 
                    disabled 
                    className="px-3 py-2 border rounded-md w-full max-w-xs"
                  />
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Change</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Admin Password</DialogTitle>
                        <DialogDescription>
                          Update the admin password for this organization
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {passwordError && (
                          <div className="text-sm font-medium text-red-500">
                            {passwordError}
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Current Password</label>
                          <Input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">New Password</label>
                          <Input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Confirm New Password</label>
                          <Input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                <p className="text-sm text-red-500 mb-4">
                  Once you delete an organization, there is no going back. Please be certain.
                </p>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Delete Organization</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Organization</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete the
                        organization and all associated data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <p className="text-sm mb-2">
                          To confirm, please type the name of the organization:
                          <span className="font-semibold"> {orgDetails?.name}</span>
                        </p>
                        <Input
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="Type organization name to confirm"
                        />
                      </div>
                      
                      <div>
                        <p className="text-sm mb-2">
                          Enter admin password to authorize deletion:
                        </p>
                        <Input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter admin password"
                        />
                      </div>
                      
                      {deleteError && (
                        <div className="text-sm font-medium text-red-500">
                          {deleteError}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteOrganization}
                        disabled={
                          loading || 
                          deleteConfirmation !== orgDetails?.name || 
                          !adminPassword
                        }
                      >
                        {loading ? "Deleting..." : "Delete Organization"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wrap the component with admin auth protection
export default withAdminAuth(SettingsPage); 