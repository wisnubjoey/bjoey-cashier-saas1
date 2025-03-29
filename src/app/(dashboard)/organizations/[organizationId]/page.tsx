import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function OrganizationPage({ 
  params 
}: { 
  params: { organizationId: string } 
}) {
  // Redirect ke dashboard
  redirect(`/organizations/${params.organizationId}/dashboard`);

  // Tambahkan state untuk data inventaris
  const [inventoryData, setInventoryData] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalInventoryValue: 0
  });

  // Tambahkan fungsi untuk mengambil data inventaris
  async function fetchInventoryData() {
    try {
      const response = await fetch(`/api/organizations/${params.organizationId}/inventory/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const data = await response.json();
      setInventoryData(data);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    }
  }

  // Panggil fungsi ini di useEffect
  useEffect(() => {
    fetchInventoryData();
  }, [params.organizationId]);

  // Tambahkan kartu inventaris di dashboard
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    {/* Kartu yang sudah ada */}
    
    {/* Kartu inventaris baru */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Inventory Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatPrice(inventoryData.totalInventoryValue)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {inventoryData.totalProducts} products in stock
        </p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Low Stock Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="text-3xl font-bold">{inventoryData.lowStockProducts}</div>
          {inventoryData.lowStockProducts > 0 && (
            <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          <Link to={`/organizations/${params.organizationId}/inventory`} className="text-blue-500 hover:underline">
            View inventory report
          </Link>
        </p>
      </CardContent>
    </Card>
  </div>
} 

function formatPrice(totalInventoryValue: number): import("react").ReactNode {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalInventoryValue);
}