import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addDays } from "date-fns";
import { createId } from "@paralleldrive/cuid2";

// Constants
export const TRIAL_DAYS = 2;
export const FREE_PLAN_LIMITS = {
  organizations: 1,
  products: 10,
  sales: 10,
};

// Types
export type SubscriptionStatus = "free" | "trial" | "pro";

/**
 * Get a user's subscription status
 * 
 * @param userId The Clerk user ID
 * @returns The user's subscription status and details
 */
export async function getUserSubscription(userId: string) {
  // Get the user's subscription from the database
  const subscription = await db.query.userSubscriptions.findFirst({
    where: eq(userSubscriptions.userId, userId),
  });

  // If no subscription record exists, create one with free plan
  if (!subscription) {
    await createUserSubscription(userId);
    return {
      status: "free" as SubscriptionStatus,
      plan: "free",
      isTrialAvailable: true,
      trialStartDate: null,
      trialEndDate: null,
      currentPeriodEnd: null,
    };
  }

  // Check if user is on a trial
  if (subscription.status === "trial" && subscription.trialEndDate) {
    const now = new Date();
    // If trial has expired, update to free plan
    if (now > subscription.trialEndDate) {
      await endUserTrial(userId);
      return {
        status: "free" as SubscriptionStatus,
        plan: "free",
        isTrialAvailable: false,
        isTrialExpired: true,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        currentPeriodEnd: null,
      };
    }

    // Active trial
    return {
      status: "trial" as SubscriptionStatus,
      plan: "pro", // During trial, users have pro features
      isTrialAvailable: false,
      trialStartDate: subscription.trialStartDate,
      trialEndDate: subscription.trialEndDate,
      currentPeriodEnd: null,
    };
  }

  // Check if subscription is active
  if (subscription.status === "active" && subscription.currentPeriodEnd) {
    const now = new Date();
    // If subscription has expired, update to free plan
    if (now > subscription.currentPeriodEnd) {
      await updateSubscriptionStatus(userId, "free");
      return {
        status: "free" as SubscriptionStatus,
        plan: "free",
        isTrialAvailable: false,
        currentPeriodEnd: null,
      };
    }

    // Active subscription
    return {
      status: "pro" as SubscriptionStatus,
      plan: subscription.plan,
      isTrialAvailable: false,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  // Default: free plan
  return {
    status: "free" as SubscriptionStatus,
    plan: "free",
    isTrialAvailable: !subscription.isTrialUsed,
    trialStartDate: null,
    trialEndDate: null,
    currentPeriodEnd: null,
  };
}

/**
 * Create a new user subscription with free plan
 * 
 * @param userId The Clerk user ID
 * @returns The created subscription
 */
export async function createUserSubscription(userId: string) {
  return await db.insert(userSubscriptions).values({
    id: createId(),
    userId,
    status: "trial",
    plan: "free",
    isTrialUsed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
}

/**
 * Start a free trial for a user
 * 
 * @param userId The Clerk user ID
 * @returns The updated subscription
 */
export async function startUserTrial(userId: string) {
  const now = new Date();
  const trialEndDate = addDays(now, TRIAL_DAYS);

  return await db
    .update(userSubscriptions)
    .set({
      status: "trial",
      plan: "pro",
      isTrialUsed: true,
      trialStartDate: now,
      trialEndDate,
      updatedAt: now,
    })
    .where(eq(userSubscriptions.userId, userId))
    .returning();
}

/**
 * End a user's trial and revert to free plan
 * 
 * @param userId The Clerk user ID
 * @returns The updated subscription
 */
export async function endUserTrial(userId: string) {
  return await db
    .update(userSubscriptions)
    .set({
      status: "trial",
      plan: "free",
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.userId, userId))
    .returning();
}

/**
 * Update a user's subscription status
 * 
 * @param userId The Clerk user ID
 * @param plan The plan to update to
 * @param periodStartDate Start date of the subscription period
 * @param periodEndDate End date of the subscription period
 * @returns The updated subscription
 */
export async function updateSubscriptionStatus(
  userId: string,
  plan: string,
  periodStartDate?: Date,
  periodEndDate?: Date
) {
  const updates: {
    status: "active" | "canceled" | "past_due" | "trial";
    plan: string;
    updatedAt: Date;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  } = {
    status: plan === "free" ? "trial" : "active",
    plan,
    updatedAt: new Date(),
  };

  if (periodStartDate) {
    updates.currentPeriodStart = periodStartDate;
  }

  if (periodEndDate) {
    updates.currentPeriodEnd = periodEndDate;
  }

  return await db
    .update(userSubscriptions)
    .set(updates)
    .where(eq(userSubscriptions.userId, userId))
    .returning();
}

/**
 * Check if a user can use a specific feature based on their subscription
 * 
 * @param userId The Clerk user ID
 * @param feature The feature to check
 * @param currentCount The current count of the feature
 * @returns Whether the user can use the feature
 */
export async function canUseFeature(
  userId: string,
  feature: keyof typeof FREE_PLAN_LIMITS,
  currentCount: number
) {
  const subscription = await getUserSubscription(userId);
  
  // If user is on pro plan or trial, they can use all features
  if (subscription.status === "pro" || subscription.status === "trial") {
    return true;
  }
  
  // If user is on free plan, check the limits
  const limit = FREE_PLAN_LIMITS[feature];
  return currentCount < limit;
} 