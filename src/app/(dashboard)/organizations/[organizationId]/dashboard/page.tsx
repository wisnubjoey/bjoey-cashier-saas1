"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";

export default function DashboardPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const resolvedParams = use(params);
  const organizationId = resolvedParams.organizationId;
  
  const [salesData, setSalesData] = useState([]);
  const [timeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  
  const [inventoryData, setInventoryData] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalInventoryValue: 0
  });
  
  useEffect(() => {
    fetchSalesData();
    fetchInventoryData();
  }, [organizationId, timeRange]);
  
  async function fetchSalesData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${organizationId}/sales/stats?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }
      
      const data = await response.json();
      setSalesData(data.data || []);
      setStats(data.stats || {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
      });
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchInventoryData() {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/inventory/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }
      
      const data = await response.json();
      setInventoryData(data);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    }
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  if (loading && !salesData.length) return <div className="p-8">Loading dashboard data...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{formatPrice(stats.totalSales)}</div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" />
              For the selected period
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              Avg. {formatPrice(stats.averageOrderValue)} per order
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">
              {formatPrice(inventoryData.totalInventoryValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {inventoryData.totalProducts} products in stock
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => window.location.href = `/organizations/${organizationId}/pos`}>
              Open POS
            </Button>
            <Button className="w-full border-green-600 text-green-600 hover:bg-green-50" variant="outline" onClick={() => window.location.href = `/organizations/${organizationId}/products`}>
              Manage Products
            </Button>
            <Button className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200" variant="outline" onClick={() => window.location.href = `/organizations/${organizationId}/inventory`}>
              View Inventory
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-lg font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <div className="text-3xl font-bold">{inventoryData.lowStockProducts}</div>
              {inventoryData.lowStockProducts > 0 && (
                <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <Link href={`/organizations/${organizationId}/inventory`} className="text-green-600 hover:underline">
                View inventory report
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 