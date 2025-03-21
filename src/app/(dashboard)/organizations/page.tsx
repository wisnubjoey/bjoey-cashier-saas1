"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Organization } from "@/lib/db/types";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch('/api/organizations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        setError('Error loading organizations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrganizations();
  }, []);

  if (loading) return <div>Loading organizations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Organizations</h1>
      
      {organizations.length === 0 ? (
        <p>You don&apos;t have any organizations yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizations.map(org => (
            <div 
              key={org.id} 
              className="border p-4 rounded-lg cursor-pointer hover:border-black"
              onClick={() => router.push(`/organizations/${org.id}`)}
            >
              <h2 className="font-bold text-lg">{org.name}</h2>
              <p className="text-sm text-gray-500">
                Created: {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="mt-6 bg-black text-white px-4 py-2 rounded-md"
        onClick={() => router.push('/organizations/new')}
      >
        Create New Organization
      </button>
    </div>
  );
}
