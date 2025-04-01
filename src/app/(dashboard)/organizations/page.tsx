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
        <h1 className="text-2xl font-bold dashboard-page-title">Your Organizations</h1>
        <Button 
          onClick={() => router.push('/organizations/new')}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> New Organization
        </Button>
      </div>
      
      {organizations.length === 0 ? (
        <div className="text-center p-8 border rounded-lg border-gray-200 shadow-sm">
          <p className="text-gray-500 mb-4">You don&apos;t have any organizations yet.</p>
          <Button 
            onClick={() => router.push('/organizations/new')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Create your first organization
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org.id} 
              className="cursor-pointer hover:border-green-600 hover:shadow-md transition-all border-gray-200 shadow-sm"
              onClick={() => handleSelectOrganization(org.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Store className="mr-2 h-5 w-5 text-green-600" />
                  {org.name}
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Created on {new Date(org.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOrganization(org.id);
                  }}
                >
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
