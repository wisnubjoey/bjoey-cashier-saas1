import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Invoice, isSandboxMode } from '@/lib/xendit';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';

const plans = {
  basic: {
    name: "Basic Plan",
    price: 99000,
    interval: "month",
  },
  pro: {
    name: "Professional Plan",
    price: 199000,
    interval: "month",
  },
  enterprise: {
    name: "Enterprise Plan",
    price: 499000,
    interval: "month",
  },
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { planId, email } = body;
    
    if (!planId || !email) {
      return NextResponse.json(
        { error: 'Plan ID and email are required' }, 
        { status: 400 }
      );
    }
    
    const plan = plans[planId as keyof typeof plans];
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' }, 
        { status: 400 }
      );
    }
    
    // Create a unique external ID
    const externalId = `sub_${userId}_${planId}_${Date.now()}`;
    
    // Tambahkan notifikasi mode sandbox jika diperlukan
    const description = isSandboxMode() 
      ? `[TEST MODE] Subscription to ${plan.name}` 
      : `Subscription to ${plan.name}`;
    
    // Create invoice with Xendit
    const invoice = await Invoice.createInvoice({
      externalId,
      amount: plan.price,
      payerEmail: email,
      description,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?plan=${planId}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/failed?plan=${planId}`,
      currency: 'IDR',
      items: [
        {
          name: plan.name,
          quantity: 1,
          price: plan.price,
          category: 'Subscription',
        }
      ]
    });
    
    // Save pending subscription in database
    await db.insert(subscriptions).values({
      userId,
      planId,
      status: 'pending',
      externalId,
      amount: plan.price.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({
      invoiceUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
      isSandbox: isSandboxMode(),
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
} 