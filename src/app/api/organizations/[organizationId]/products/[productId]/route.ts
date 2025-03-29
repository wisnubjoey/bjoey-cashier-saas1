import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

// GET - Get a specific product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; productId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Resolve params first
    const resolvedParams = await params;
    const { organizationId, productId } = resolvedParams;
    
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
    
    // Get the product
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      )
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' }, 
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; productId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Resolve params first
    const resolvedParams = await params;
    const { organizationId, productId } = resolvedParams;
    
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
    
    // Check if product exists and belongs to organization
    const existingProduct = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      )
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { name, description, price, sku, barcode, stock, imageUrl, minStockLevel, costPrice } = body;
    
    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set({
        name: name !== undefined ? name : existingProduct.name,
        description,
        price: price !== undefined ? price : existingProduct.price,
        sku,
        barcode,
        stock: stock !== undefined ? stock : existingProduct.stock,
        imageUrl,
        minStockLevel: minStockLevel !== undefined ? minStockLevel : existingProduct.minStockLevel,
        costPrice,
        updatedAt: new Date()
      })
      .where(and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      ))
      .returning();
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; productId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Resolve params first
    const resolvedParams = await params;
    const { organizationId, productId } = resolvedParams;
    
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
    
    // Delete the product
    await db.delete(products)
      .where(and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      ));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' }, 
      { status: 500 }
    );
  }
} 