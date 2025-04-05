import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, count } from 'drizzle-orm';
import { canUseFeature } from "@/lib/subscription";

// GET - Get all products for an organization
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
    
    // Get all products for this organization
    const productsList = await db.query.products.findMany({
      where: eq(products.organizationId, organizationId),
      orderBy: (products, { asc }) => [asc(products.name)]
    });
    
    return NextResponse.json(productsList);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}

// POST - Create a new product
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
    
    // Count existing products for this organization to check subscription limits
    const productCount = await db.select({ count: count() })
      .from(products)
      .where(eq(products.organizationId, organizationId));
    
    const currentCount = productCount[0]?.count || 0;
    
    // Check if user can create more products based on their subscription
    const canCreate = await canUseFeature(userId, 'products', currentCount);
    
    if (!canCreate) {
      return NextResponse.json({
        error: 'You have reached the product limit for your plan. Please upgrade to create more products.'
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { name, description, price, sku, barcode, stock, imageUrl, minStockLevel, costPrice } = body;
    
    if (!name || price === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' }, 
        { status: 400 }
      );
    }
    
    // Create new product
    const newProduct = await db.insert(products).values({
      organizationId: organizationId,
      name,
      description,
      price,
      sku,
      barcode,
      stock: stock || 0,
      imageUrl,
      minStockLevel: minStockLevel || 0,
      costPrice: costPrice || null
    }).returning();
    
    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' }, 
      { status: 500 }
    );
  }
}
