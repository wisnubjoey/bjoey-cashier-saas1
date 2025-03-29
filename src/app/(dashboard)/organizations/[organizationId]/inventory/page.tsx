"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  barcode: string | null;
  minStockLevel: number;
  costPrice: number | null;
}

// Default low stock threshold
const DEFAULT_LOW_STOCK_THRESHOLD = 3;

export default function InventoryReportPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const resolvedParams = use(params);
  const organizationId = resolvedParams.organizationId;
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Calculated values
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= DEFAULT_LOW_STOCK_THRESHOLD).length;
  const totalInventoryValue = products.reduce((total, product) => {
    // Hanya gunakan costPrice jika tersedia
    if (product.costPrice) {
      return total + (product.costPrice * product.stock);
    }
    // Jika tidak ada costPrice, gunakan harga jual saja untuk perhitungan
    return total + (product.price * product.stock);
  }, 0);
  
  useEffect(() => {
    fetchProducts();
  }, [organizationId]);
  
  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${organizationId}/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Error loading products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Prepare data for charts
  const stockDistributionData = products.map(product => ({
    name: product.name,
    value: product.stock
  })).sort((a, b) => b.value - a.value).slice(0, 5);
  
  const inventoryValueData = products.map(product => ({
    name: product.name,
    value: (product.costPrice || product.price * 0.7) * product.stock
  })).sort((a, b) => b.value - a.value).slice(0, 5);
  
  
  
  if (loading) return <div className="p-8">Loading inventory data...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Report</h1>
        <Button onClick={() => router.push(`/organizations/${organizationId}/products`)}>
          Manage Products
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Products with 3 or fewer items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="text-3xl font-bold">{lowStockProducts}</p>
              {lowStockProducts > 0 && (
                <AlertTriangle className="ml-2 h-5 w-5 text-amber-500" />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(totalInventoryValue)}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Stock</CardTitle>
            <CardDescription>Products with highest stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} units`, 'Stock']} />
                  <Bar dataKey="value" fill="#8884d8" name="Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Value</CardTitle>
            <CardDescription>Products with highest inventory value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => formatPrice(value).replace('Rp', '')} />
                  <Tooltip formatter={(value) => [formatPrice(value as number), 'Value']} />
                  <Bar dataKey="value" fill="#82ca9d" name="Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>
            Overview of all products in inventory
          </CardDescription>
          <div className="flex items-center mt-2">
            <Search className="h-4 w-4 mr-2 text-gray-500" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min. Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(product => {
                  const isLowStock = product.stock <= DEFAULT_LOW_STOCK_THRESHOLD;
                  const stockValue = (product.costPrice || product.price * 0.7) * product.stock;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku || '-'}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{DEFAULT_LOW_STOCK_THRESHOLD}</TableCell>
                      <TableCell>
                        {isLowStock ? (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            In Stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatPrice(stockValue)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/organizations/${organizationId}/products/${product.id}`)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>
            Products with 3 or fewer items in stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min. Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter(p => p.stock <= DEFAULT_LOW_STOCK_THRESHOLD).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No low stock items
                  </TableCell>
                </TableRow>
              ) : (
                products
                  .filter(p => p.stock <= DEFAULT_LOW_STOCK_THRESHOLD)
                  .map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-red-600 font-medium">{product.stock}</TableCell>
                      <TableCell>{DEFAULT_LOW_STOCK_THRESHOLD}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/organizations/${organizationId}/products/${product.id}?tab=stock`)}
                        >
                          Adjust Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 