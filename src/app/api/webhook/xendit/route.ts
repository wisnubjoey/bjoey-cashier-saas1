import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { isSandboxMode } from '@/lib/xendit';

// Fungsi untuk memverifikasi webhook dari Xendit
function verifyXenditWebhook(requestBody: string, xenditSignature: string) {
  // Dalam mode sandbox, kita bisa melewati verifikasi untuk testing lokal
  if (isSandboxMode() && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const webhookSecret = process.env.XENDIT_WEBHOOK_SECRET || '';
  
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(requestBody);
  const generatedSignature = hmac.digest('hex');
  
  return generatedSignature === xenditSignature;
}

export async function POST(request: Request) {
  try {
    // Dapatkan body request sebagai string untuk verifikasi
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    
    console.log('Received Xendit webhook:', body);
    
    // Verifikasi webhook
    const headersList = headers();
    const xenditSignature = headersList.get('x-callback-token') || '';
    
    if (!verifyXenditWebhook(bodyText, xenditSignature)) {
      console.error('Invalid Xendit webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Proses webhook berdasarkan jenis event
    if (body.event === 'invoice.paid') {
      const { external_id, status } = body.data;
      
      console.log(`Processing paid invoice: ${external_id} with status: ${status}`);
      
      // Update status subscription
      await db.update(subscriptions)
        .set({
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.externalId, external_id));
      
      console.log(`Subscription updated for: ${external_id}`);
      
      return NextResponse.json({ success: true });
    }
    
    // Handle other events if needed
    console.log(`Unhandled event type: ${body.event}`);
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' }, 
      { status: 500 }
    );
  }
} 