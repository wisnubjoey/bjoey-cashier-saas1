import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, count, sql } from 'drizzle-orm';

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
    
    // Get total products count
    const productsCount = await db.select({
      count: count()
    })
    .from(products)
    .where(eq(products.organizationId, organizationId));
    
    const totalProducts = productsCount[0]?.count || 0;
    
    // Get low stock products count
    const lowStockCount = await db.select({
      count: count()
    })
    .from(products)
    .where(
      and(
        eq(products.organizationId, organizationId),
        sql`${products.stock} <= ${products.minStockLevel}`
      )
    );
    
    const lowStockProducts = lowStockCount[0]?.count || 0;
    
    // Get total inventory value
    // This is a bit complex because we need to calculate based on costPrice or fallback to price
    const productsWithStock = await db.query.products.findMany({
      where: eq(products.organizationId, organizationId),
      columns: {
        stock: true,
        price: true,
        costPrice: true
      }
    });
    
    const totalInventoryValue = productsWithStock.reduce((total, product) => {
      if (!product.stock) return total;
      
      const valuePerUnit = product.costPrice 
        ? parseFloat(product.costPrice.toString()) 
        : parseFloat(product.price.toString()) * 0.7; // Fallback to 70% of selling price
        
      return total + (valuePerUnit * product.stock);
    }, 0);
    
    return NextResponse.json({
      totalProducts,
      lowStockProducts,
      totalInventoryValue
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory summary' }, 
      { status: 500 }
    );
  }
} 