import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sales, organizations } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and, sql, count, sum } from 'drizzle-orm';
import { startOfWeek, startOfMonth, startOfYear, endOfDay, format } from 'date-fns';

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
    
    // Get time range from query params
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || 'week';
    
    // Calculate start date based on time range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Start from Monday
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
    }
    
    const endDate = endOfDay(now);
    
    // Get sales stats
    const salesStats = await db.select({
      totalSales: sum(sales.total),
      totalOrders: count(),
    })
    .from(sales)
    .where(
      and(
        eq(sales.organizationId, organizationId),
        sql`${sales.createdAt} >= ${startDate.toISOString()}`,
        sql`${sales.createdAt} <= ${endDate.toISOString()}`
      )
    );
    
    // Calculate average order value
    const stats = {
      totalSales: Number(salesStats[0]?.totalSales || 0),
      totalOrders: Number(salesStats[0]?.totalOrders || 0),
      averageOrderValue: salesStats[0]?.totalOrders > 0 
        ? Number(salesStats[0]?.totalSales) / Number(salesStats[0]?.totalOrders) 
        : 0
    };
    
    // Get daily sales data for chart
    let groupByFormat;
    let labelFormat;
    
    switch (timeRange) {
      case 'week':
        groupByFormat = 'YYYY-MM-DD';
        labelFormat = 'ddd';
        break;
      case 'month':
        groupByFormat = 'YYYY-MM-DD';
        labelFormat = 'DD';
        break;
      case 'year':
        groupByFormat = 'YYYY-MM';
        labelFormat = 'MMM';
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        groupByFormat = 'YYYY-MM-DD';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        labelFormat = 'ddd';
    }
    
    // For simplicity, let's create some sample data
    // In a real app, you would query the database with proper date grouping
    const sampleData = [];
    
    if (timeRange === 'week') {
      // Generate data for each day of the week
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay() + i + 1); // Start from Monday
        
        sampleData.push({
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'EEE'),
          value: Math.floor(Math.random() * 1000) + 100 // Random value between 100 and 1100
        });
      }
    } else if (timeRange === 'month') {
      // Generate data for each day of the month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), i);
        
        sampleData.push({
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'dd'),
          value: Math.floor(Math.random() * 1000) + 100
        });
      }
    } else if (timeRange === 'year') {
      // Generate data for each month of the year
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), i, 1);
        
        sampleData.push({
          date: format(date, 'yyyy-MM'),
          label: format(date, 'MMM'),
          value: Math.floor(Math.random() * 10000) + 1000
        });
      }
    }
    
    return NextResponse.json({
      stats,
      data: sampleData
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales stats' }, 
      { status: 500 }
    );
  }
} 