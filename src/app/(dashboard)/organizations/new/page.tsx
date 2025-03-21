"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    adminPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validasi input
      if (!formData.name.trim()) {
        throw new Error("Organization name is required");
      }

      if (!formData.adminPassword.trim()) {
        throw new Error("Admin password is required");
      }

      if (formData.adminPassword.length < 6) {
        throw new Error("Admin password must be at least 6 characters");
      }

      // Kirim data ke API
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create organization");
      }

      // Redirect ke halaman organizations
      router.push("/organizations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Organization</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="My Business"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="adminPassword" className="block text-sm font-medium mb-1">
            Admin Password
          </label>
          <input
            type="password"
            id="adminPassword"
            name="adminPassword"
            value={formData.adminPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Minimum 6 characters"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This password will be used for admin access to your organization.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Organization"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full p-2 border rounded-md text-center mt-2"
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
