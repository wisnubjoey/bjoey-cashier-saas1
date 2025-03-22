import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sales, products } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, gte, sum, count, sql } from 'drizzle-orm';
import { subDays } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { organizationId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7days';
    
    // Calculate date range
    let startDate;
    switch (timeRange) {
      case '30days':
        startDate = subDays(new Date(), 30);
        break;
      case '90days':
        startDate = subDays(new Date(), 90);
        break;
      default: // 7days
        startDate = subDays(new Date(), 7);
        break;
    }
    
    // Get total sales count
    const salesCount = await db.select({
      count: count()
    })
    .from(sales)
    .where(
      and(
        eq(sales.organizationId, params.organizationId),
        gte(sales.createdAt, startDate)
      )
    );
    
    const totalSales = salesCount[0]?.count || 0;
    
    // Get total revenue
    const revenueResult = await db.select({
      total: sum(sales.total)
    })
    .from(sales)
    .where(
      and(
        eq(sales.organizationId, params.organizationId),
        gte(sales.createdAt, startDate)
      )
    );
    
    const totalRevenue = parseFloat(revenueResult[0]?.total || '0');
    
    // Get total products count
    const productsCount = await db.select({
      count: count()
    })
    .from(products)
    .where(eq(products.organizationId, params.organizationId));
    
    const totalProducts = productsCount[0]?.count || 0;
    
    // Calculate average order value
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Get sales by day
    const salesByDay = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as sales,
        SUM(CAST(total AS DECIMAL)) as revenue
      FROM sales
      WHERE organization_id = ${params.organizationId}
        AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    
    // Get top products
    const topProducts = await db.execute(sql`
      SELECT 
        p.id,
        p.name,
        SUM(si.quantity) as quantity,
        SUM(CAST(si.price AS DECIMAL) * si.quantity) as revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.organization_id = ${params.organizationId}
        AND s.created_at >= ${startDate}
      GROUP BY p.id, p.name
      ORDER BY quantity DESC
      LIMIT 5
    `);
    
    return NextResponse.json({
      totalSales,
      totalRevenue,
      totalProducts,
      averageOrderValue,
      salesByDay: salesByDay.rows,
      topProducts: topProducts.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' }, 
      { status: 500 }
    );
  }
} 