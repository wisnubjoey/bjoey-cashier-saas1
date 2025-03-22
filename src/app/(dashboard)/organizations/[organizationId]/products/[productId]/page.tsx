"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { use } from "react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be a positive number"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductPage({ params }: { params: Promise<{ organizationId: string, productId: string }> }) {
  const resolvedParams = use(params);
  const organizationId = resolvedParams.organizationId;
  const productId = resolvedParams.productId;
  
  const router = useRouter();
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      sku: "",
      barcode: "",
      description: "",
    },
  });

  // Determine if we're creating a new product or editing an existing one
  useEffect(() => {
    if (productId === "new") {
      setIsNew(true);
      setInitialLoading(false);
      return;
    }
    
    setIsNew(false);
    fetchProductData();
  }, [productId]);

  async function fetchProductData() {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/organizations/${organizationId}/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      
      // Set form values
      form.reset({
        name: data.name,
        price: data.price,
        stock: data.stock,
        sku: data.sku || "",
        barcode: data.barcode || "",
        description: data.description || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error", {
        description: "Failed to load product data"
      });
      router.push(`/organizations/${organizationId}/products`);
    } finally {
      setInitialLoading(false);
    }
  }

  async function onSubmit(values: ProductFormValues) {
    try {
      setLoading(true);
      
      const endpoint = isNew 
        ? `/api/organizations/${organizationId}/products` 
        : `/api/organizations/${organizationId}/products/${productId}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
      
      toast.success(isNew ? "Product created" : "Product updated", {
        description: `${values.name} has been ${isNew ? 'added' : 'updated'} successfully`
      });
      
      router.push(`/organizations/${organizationId}/products`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to save product"
      });
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <div className="p-8">Loading product data...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "Add New Product" : "Edit Product"}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter product description" 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/organizations/${organizationId}/products`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isNew ? "Create Product" : "Update Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 