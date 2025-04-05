import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from "@clerk/nextjs/server";
import { getAuth } from "@clerk/nextjs/server";
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUserSubscription, startUserTrial, updateSubscriptionStatus } from '@/lib/subscription';
import { createSnapToken, PLANS } from '@/lib/midtrans';
import { addMonths } from 'date-fns';

/**
 * GET - Get user subscription status
 */
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const subscription = await getUserSubscription(userId);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error getting subscription:", error);
    return NextResponse.json({ error: "Failed to get subscription" }, { status: 500 });
  }
}

/**
 * POST - Start trial or create payment
 */
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { action } = await req.json();
    console.log("Subscription action:", action, "for user:", userId);
    
    // Get current user subscription
    const subscription = await getUserSubscription(userId);
    console.log("Current subscription status:", subscription.status);
    
    // Start free trial
    if (action === "startTrial") {
      // Check if user already used trial
      if (!subscription.isTrialAvailable) {
        return NextResponse.json({ error: "Trial already used" }, { status: 400 });
      }
      
      await startUserTrial(userId);
      return NextResponse.json({ success: true, message: "Trial started successfully" });
    }
    
    // Create payment for pro subscription
    if (action === "upgrade") {
      // Get user info
      let userFirstName = "User"; // Default
      let userLastName = "";
      let userEmail = "user@example.com"; // Default
      
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        userFirstName = user.firstName || userFirstName;
        userLastName = user.lastName || userLastName;
        userEmail = user.emailAddresses[0]?.emailAddress || userEmail;
        
        console.log("User info retrieved:", { 
          userFirstName, 
          userLastName, 
          userEmail: userEmail.substring(0, 3) + "..." 
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ 
          error: "Could not fetch user details. Please try again." 
        }, { status: 500 });
      }
      
      // Generate unique order ID
      const orderId = `ORDER-${createId()}-${Date.now()}`;
      console.log("Generated order ID:", orderId);
      
      // Create Midtrans payment token
      try {
        console.log("Calling Midtrans with amount:", PLANS.pro.price);
        
        const { token, redirectUrl } = await createSnapToken(
          orderId,
          PLANS.pro.price,
          {
            firstName: userFirstName, 
            lastName: userLastName, 
            email: userEmail
          }
        );
        
        console.log("Midtrans token received:", token ? "success" : "null");
        console.log("Redirect URL:", redirectUrl ? redirectUrl.substring(0, 30) + "..." : "null");
        
        // Store payment details in database
        await db.insert(payments).values({
          id: createId(),
          userId,
          amount: PLANS.pro.price.toString(), // Convert to string
          status: "pending",
          midtransOrderId: orderId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.log("Midtrans token created:", { token: token ? "exists" : "null", redirectUrl });
        
        return NextResponse.json({ token, redirectUrl, orderId });
      } catch (error) {
        console.error("Error creating Midtrans payment:", error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Payment service temporarily unavailable";
        
        console.error("Detailed error:", errorMessage);
        
        return NextResponse.json({ 
          error: errorMessage 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing subscription:", error);
    return NextResponse.json({ 
      error: "Failed to process subscription. Please try again later." 
    }, { status: 500 });
  }
}

/**
 * PATCH - Update subscription based on payment status
 */
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, userId: requestUserId } = await req.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Get payment record to find user ID if not provided
    const paymentRecords = await db
      .select()
      .from(payments)
      .where(eq(payments.midtransOrderId, orderId));
    
    if (!paymentRecords || paymentRecords.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    
    const payment = paymentRecords[0];
    const userId = requestUserId || payment.userId;
    
    // Update payment status
    await db
      .update(payments)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(payments.midtransOrderId, orderId));
    
    // If payment successful, update subscription
    if (status === "success") {
      const now = new Date();
      const endDate = addMonths(now, 1); // Subscription valid for 1 month
      
      await updateSubscriptionStatus(userId, "pro", now, endDate);
      
      return NextResponse.json({ success: true, message: "Subscription updated successfully" });
    }
    
    return NextResponse.json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
} 