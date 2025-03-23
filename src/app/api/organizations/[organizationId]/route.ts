import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizations, products, sales, saleItems } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, inArray } from 'drizzle-orm';

// GET - Fetch organization details
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
    
    // Fetch organization
    const org = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.id, organizationId),
        eq(organizations.userId, userId)
      )
    });
    
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      id: org.id,
      name: org.name,
      adminPassword: "••••••••" // Don't send actual password to client
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete an organization
export async function DELETE(
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
    
    // Transaksi untuk menghapus semua data terkait
    try {
      // 1. Hapus semua sale items terkait dengan sales dari organisasi ini
      const orgSales = await db.query.sales.findMany({
        where: eq(sales.organizationId, organizationId),
        columns: { id: true }
      });
      
      const saleIds = orgSales.map(sale => sale.id);
      
      if (saleIds.length > 0) {
        await db.delete(saleItems)
          .where(
            inArray(saleItems.saleId, saleIds)
          );
      }
      
      // 2. Hapus semua sales dari organisasi
      await db.delete(sales)
        .where(eq(sales.organizationId, organizationId));
      
      // 3. Hapus semua products dari organisasi
      await db.delete(products)
        .where(eq(products.organizationId, organizationId));
      
      // 4. Terakhir, hapus organisasi
      await db.delete(organizations)
        .where(eq(organizations.id, organizationId));
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error in delete transaction:', error);
      return NextResponse.json(
        { error: 'Failed to delete related data' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' }, 
      { status: 500 }
    );
  }
} 