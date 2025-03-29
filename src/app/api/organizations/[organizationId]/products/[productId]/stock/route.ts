import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, organizations, stockHistory } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

// POST - Adjust stock for a product
export async function POST(
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
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      )
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { changeAmount, reason, notes } = body;
    
    if (changeAmount === undefined || !reason) {
      return NextResponse.json(
        { error: 'Change amount and reason are required' }, 
        { status: 400 }
      );
    }
    
    const previousStock = product.stock || 0;
    const newStock = previousStock + changeAmount;
    
    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' }, 
        { status: 400 }
      );
    }
    
    // Update product stock
    const [updatedProduct] = await db
      .update(products)
      .set({
        stock: newStock,
        updatedAt: new Date()
      })
      .where(and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      ))
      .returning();
    
    // Record stock history
    const [stockHistoryEntry] = await db
      .insert(stockHistory)
      .values({
        productId,
        previousStock,
        newStock,
        changeAmount,
        reason,
        notes,
        userId
      })
      .returning();
    
    return NextResponse.json({
      product: updatedProduct,
      stockHistory: stockHistoryEntry
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return NextResponse.json(
      { error: 'Failed to adjust stock' }, 
      { status: 500 }
    );
  }
}

// GET - Get stock history for a product
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
    
    // Check if product exists and belongs to organization
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.organizationId, organizationId)
      )
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Get stock history
    const history = await db.query.stockHistory.findMany({
      where: eq(stockHistory.productId, productId),
      orderBy: (stockHistory, { desc }) => [desc(stockHistory.createdAt)]
    });
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching stock history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock history' }, 
      { status: 500 }
    );
  }
} 