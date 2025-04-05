import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateSubscriptionStatus } from '@/lib/subscription';
import { addMonths } from 'date-fns';

/**
 * Webhook handler for Midtrans payment notifications
 * https://docs.midtrans.com/en/after-payment/http-notification
 */
export async function POST(req: NextRequest) {
  try {
    // Verify if the notification comes from Midtrans
    // In production, you should validate the request signature
    
    const data = await req.json();
    
    // Extract payment details
    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type
    } = data;
    
    // Log the webhook data for debugging
    console.log('Midtrans webhook received:', {
      order_id,
      transaction_status,
      fraud_status,
      payment_type
    });
    
    // Get payment record from database
    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.midtransOrderId, order_id));
    
    if (!paymentRecords || paymentRecords.length === 0) {
      console.error(`No payment found for order ID: ${order_id}`);
      return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    }
    
    const payment = paymentRecords[0];
    
    // Map Midtrans status to our status
    let paymentStatus = payment.status;
    
    // Transaction is successful
    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      if (fraud_status === 'accept' || fraud_status === null) {
        paymentStatus = 'success';
      }
    }
    // Transaction is pending
    else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    }
    // Transaction is failed or denied
    else if (
      transaction_status === 'deny' ||
      transaction_status === 'expire' ||
      transaction_status === 'cancel'
    ) {
      paymentStatus = 'failed';
    }
    
    // Update payment status in database
    await db
      .update(payments)
      .set({
        status: paymentStatus,
        paymentType: payment_type,
        midtransTransactionId: data.transaction_id || null,
        metadata: JSON.stringify(data),
        updatedAt: new Date()
      })
      .where(eq(payments.id, payment.id));
    
    // If payment successful, update user subscription
    if (paymentStatus === 'success') {
      const now = new Date();
      const endDate = addMonths(now, 1); // Subscription valid for 1 month
      
      await updateSubscriptionStatus(payment.userId, 'pro', now, endDate);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Midtrans webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// This is required for Midtrans to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
} 