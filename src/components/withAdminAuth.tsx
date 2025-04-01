"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { use } from "react";

// Higher Order Component (HOC) to protect pages with admin password
export function withAdminAuth<P extends { params: Promise<{ organizationId: string }> }>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AdminProtectedPage(props: P) {
    const [showAuth, setShowAuth] = useState(true);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const resolvedParams = use(props.params);
    const organizationId = resolvedParams.organizationId;
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      
      if (!password.trim()) {
        setError("Password is required");
        return;
      }
      
      setLoading(true);
      
      try {
        const response = await fetch(`/api/organizations/${organizationId}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Authentication failed");
        }
        
        // If authentication is successful, show the protected component
        setShowAuth(false);
      } catch (error) {
        console.error("Authentication error:", error);
        setError(error instanceof Error ? error.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    };
    
    // If authentication is done, render the wrapped component
    if (!showAuth) {
      return <Component {...props} />;
    }
    
    // Otherwise, show the authentication form
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter Admin Password</CardTitle>
            <CardDescription>
              Please enter the admin password to access this page
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <div className="text-sm font-medium text-red-500 mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  };
} 