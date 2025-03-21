import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

// GET - Fetch all products for an organization
export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if organization exists and belongs to user
    const org = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.id, params.organizationId),
        eq(organizations.userId, userId)
      )
    });
    
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Fetch products
    const productsList = await db.query.products.findMany({
      where: eq(products.organizationId, params.organizationId)
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
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if organization exists and belongs to user
    const org = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.id, params.organizationId),
        eq(organizations.userId, userId)
      )
    });
    
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { name, description, price, sku, barcode, stock, imageUrl } = body;
    
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' }, 
        { status: 400 }
      );
    }
    
    // Create new product
    const newProduct = await db.insert(products).values({
      organizationId: params.organizationId,
      name,
      description,
      price,
      sku,
      barcode,
      stock: stock || 0,
      imageUrl
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
