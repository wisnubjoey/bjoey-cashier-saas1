"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Store } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      setLoading(true);
      const response = await fetch('/api/organizations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError('Error loading organizations');
      console.error(err);
      toast.error("Error", {
        description: "Failed to load organizations"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSelectOrganization = (id: string) => {
    router.push(`/organizations/${id}/dashboard`);
  };

  if (loading) return <div className="p-8">Loading organizations...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Organizations</h1>
        <Button onClick={() => router.push('/organizations/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Organization
        </Button>
      </div>
      
      {organizations.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">You don&apos;t have any organizations yet.</p>
          <Button onClick={() => router.push('/organizations/new')}>
            Create your first organization
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelectOrganization(org.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  {org.name}
                </CardTitle>
                <CardDescription>
                  Created on {new Date(org.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOrganization(org.id);
                }}>
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
