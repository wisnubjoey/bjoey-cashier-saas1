import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sales, saleItems, products, organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, count } from 'drizzle-orm';
import { canUseFeature } from "@/lib/subscription";

// GET - Fetch all sales for an organization
export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Resolve params first
    const resolvedParams = await params;
    const organizationId = resolvedParams.organizationId;
    
    // Check if organization exists and belongs to user
    const org = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.id, organizationId),
        eq(organizations.userId, userId)
      )
    });
    
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Fetch sales
    const salesList = await db.query.sales.findMany({
      where: eq(sales.organizationId, organizationId),
      orderBy: (sales, { desc }) => [desc(sales.createdAt)],
      with: {
        items: {
          with: {
            product: true
          }
        }
      }
    });
    
    return NextResponse.json(salesList);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' }, 
      { status: 500 }
    );
  }
}

// POST - Create a new sale
export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Resolve params first
    const resolvedParams = await params;
    const organizationId = resolvedParams.organizationId;
    
    // Check if organization exists and belongs to user
    const org = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.id, organizationId),
        eq(organizations.userId, userId)
      )
    });
    
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Count existing sales for this organization to check subscription limits
    const salesCount = await db.select({ count: count() })
      .from(sales)
      .where(eq(sales.organizationId, organizationId));
    
    const currentCount = salesCount[0]?.count || 0;
    
    // Check if user can create more sales based on their subscription
    const canCreate = await canUseFeature(userId, 'sales', currentCount);
    
    if (!canCreate) {
      return NextResponse.json({
        error: 'You have reached the sales limit for your plan. Please upgrade to record more sales.'
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { items, paymentMethod, customerName } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return NextResponse.json(
        { error: 'Items and payment method are required' }, 
        { status: 400 }
      );
    }
    
    // Calculate total
    let total = 0;
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid item data' }, 
          { status: 400 }
        );
      }
      
      // Get product price
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.id, item.productId),
          eq(products.organizationId, organizationId)
        )
      });
      
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` }, 
          { status: 404 }
        );
      }
      
      // Check stock
      if (product.stock !== null && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Not enough stock for product: ${product.name}` }, 
          { status: 400 }
        );
      }
      
      const itemSubtotal = parseFloat(product.price) * item.quantity;
      total += itemSubtotal;
      
      // Update product stock
      await db.update(products)
        .set({
          stock: product.stock !== null ? product.stock - item.quantity : null,
          updatedAt: new Date()
        })
        .where(eq(products.id, product.id));
    }
    
    // Create sale
    const newSale = await db.insert(sales).values({
      organizationId: organizationId,
      total: total.toString(),
      paymentMethod,
      customerName,
    }).returning();
    
    // Create sale items
    const saleId = newSale[0].id;
    const saleItemsData = [];
    
    for (const item of items) {
      const product = await db.query.products.findFirst({
        where: eq(products.id, item.productId)
      });
      
      if (product) {
        const price = parseFloat(product.price);
        const subtotal = price * item.quantity;
        
        const newSaleItem = await db.insert(saleItems).values({
          saleId,
          productId: item.productId,
          quantity: item.quantity,
          price: price.toString(),
          subtotal: subtotal.toString(),
        }).returning();
        
        saleItemsData.push(newSaleItem[0]);
      }
    }
    
    return NextResponse.json({
      ...newSale[0],
      items: saleItemsData
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' }, 
      { status: 500 }
    );
  }
} 