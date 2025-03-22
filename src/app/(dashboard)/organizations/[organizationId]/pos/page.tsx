"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { use } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export default function POSPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const resolvedParams = use(params);
  const organizationId = resolvedParams.organizationId;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

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

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      // Check if product already in cart
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if already in cart
        const updatedCart = [...prevCart];
        const newQuantity = updatedCart[existingItemIndex].quantity + 1;
        
        // Check stock
        if (product.stock !== null && newQuantity > product.stock) {
          toast.error("Stock limit reached", {
            description: `Only ${product.stock} units available for ${product.name}`
          });
          return prevCart;
        }
        
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: newQuantity,
          subtotal: newQuantity * product.price,
        };
        return updatedCart;
      } else {
        // Add new item to cart
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            subtotal: product.price,
          },
        ];
      }
    });
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    const product = cart[index].product;
    
    // Check stock
    if (product.stock !== null && newQuantity > product.stock) {
      toast.error("Stock limit reached", {
        description: `Only ${product.stock} units available for ${product.name}`
      });
      return;
    }
    
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: newQuantity,
        subtotal: newQuantity * product.price,
      };
      return updatedCart;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Empty cart", {
        description: "Please add products to cart before checkout"
      });
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      const saleData = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        customerName: customerName || null,
      };
      
      const response = await fetch(`/api/organizations/${organizationId}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to process sale");
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await response.json();
      
      toast.success("Sale completed", {
        description: `Total: ${formatPrice(calculateTotal())}`
      });
      
      // Clear cart and refresh products
      setCart([]);
      setCustomerName("");
      fetchProducts();
      
      // TODO: Print receipt or show receipt modal
      
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error", {
        description: "Failed to process sale. Please try again."
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) return <div className="p-8">Loading products...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Products Section */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU or barcode..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => addToCart(product)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm truncate">{product.name}</CardTitle>
                <CardDescription className="text-xs">
                  Stock: {product.stock}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="font-bold text-lg">{formatPrice(product.price)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Cart Section */}
      <div className="w-1/3 border-l bg-gray-50 flex flex-col">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Cart</h2>
            {cart.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCart([])}
              >
                Clear
              </Button>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(item.subtotal)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(index)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto p-6 bg-white border-t">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Customer Name (Optional)</label>
              <Input
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleCheckout}
              disabled={processingPayment || cart.length === 0}
            >
              {processingPayment ? "Processing..." : "Complete Sale"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 