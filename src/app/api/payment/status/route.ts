import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';
import { getTransactionStatus } from '@/lib/midtrans';

/**
 * GET endpoint to check payment status
 */
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId');
  
  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }
  
  try {
    // First check in our database
    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.midtransOrderId, orderId));
    
    if (paymentRecords && paymentRecords.length > 0) {
      const payment = paymentRecords[0];
      
      // Map our status to frontend status
      let status: 'success' | 'pending' | 'failed' = 'pending';
      
      if (payment.status === 'success') {
        status = 'success';
      } else if (payment.status === 'failed' || payment.status === 'expired') {
        status = 'failed';
      }
      
      return NextResponse.json({ 
        status, 
        orderId,
        paymentId: payment.id,
        timestamp: payment.updatedAt
      });
    }
    
    // If not found in database, check with Midtrans
    try {
      const transactionStatus = await getTransactionStatus(orderId);
      
      let status: 'success' | 'pending' | 'failed' = 'pending';
      
      if (
        transactionStatus.transaction_status === 'capture' || 
        transactionStatus.transaction_status === 'settlement'
      ) {
        status = 'success';
      } else if (
        transactionStatus.transaction_status === 'deny' || 
        transactionStatus.transaction_status === 'expire' || 
        transactionStatus.transaction_status === 'cancel'
      ) {
        status = 'failed';
      }
      
      return NextResponse.json({ 
        status, 
        orderId,
        transactionStatus: transactionStatus.transaction_status,
        timestamp: new Date()
      });
    } catch (error) {
      // If we can't get status from Midtrans, return pending
      console.error('Error checking Midtrans transaction status:', error);
      return NextResponse.json({ 
        status: 'pending', 
        orderId,
        message: 'Payment is being processed',
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
  }
} 