# Midtrans Payment Integration Documentation

This document provides an overview of the Midtrans payment integration implemented in the SaaS Cashier application.

## Overview

The integration allows users to:
1. Try the Pro plan for free for 2 days
2. Pay for the Pro subscription using Midtrans (in sandbox mode for testing)

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```
# Midtrans Sandbox credentials (replace with actual sandbox keys)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Components and Files

### Main Components

1. **MidtransPayment Component** (`src/components/subscription/MidtransPayment.tsx`)
   - Handles payment processing through Midtrans
   - Loads Midtrans Snap script
   - Handles free trial activation

2. **SubscriptionBanner Component** (`src/components/dashboard/SubscriptionBanner.tsx`)
   - Shows subscription status
   - Displays countdown for trial expiration
   - Provides upgrade button

3. **FeatureLimiter Component** (`src/components/subscription/FeatureLimiter.tsx`)
   - Restricts access to features based on subscription plan
   - Shows upgrade prompt when limits are reached

### API Routes

1. **Subscription API** (`src/app/api/subscription/route.ts`)
   - GET: Retrieves subscription status
   - POST: Starts a trial or creates a payment
   - PATCH: Updates subscription based on payment status

2. **Midtrans Webhook** (`src/app/api/webhooks/midtrans/route.ts`)
   - Handles payment notifications from Midtrans
   - Updates payment and subscription status

3. **Payment Status API** (`src/app/api/payment/status/route.ts`)
   - Checks payment status from database or Midtrans API

### Utility Files

1. **Midtrans Utils** (`src/lib/midtrans.ts`)
   - Functions to interact with Midtrans API
   - Plan definitions and pricing

2. **Subscription Utils** (`src/lib/subscription.ts`)
   - Functions to manage subscription status
   - Feature limitations for free plan

## Database Schema

The integration uses two main tables:

1. **user_subscriptions** - Tracks user subscription status
2. **payments** - Records payment history and status

## Testing the Integration

1. **Free Trial Testing**:
   - Create a new account
   - Click "Coba Pro Gratis 2 Hari" (Try Pro Free for 2 Days)
   - Verify you have access to all Pro features
   - After 2 days, verify it reverts to free plan

2. **Payment Testing (Midtrans Sandbox)**:
   - Use Midtrans test cards: `4811 1111 1111 1114`
   - Other test cards can be found in [Midtrans documentation](https://docs.midtrans.com/en/technical-reference/sandbox-test)

## Subscription Flow

1. **New User**:
   - Default free plan with trial available
   - Limited features (1 organization, 10 products, 10 sales)

2. **Trial User**:
   - 2-day free access to Pro features
   - After trial, reverts to free plan

3. **Pro User**:
   - Unlimited organizations and products
   - Access to all premium features
   - Subscription valid for 1 month from payment date

## Security Considerations

For production, implement these additional security measures:

1. Verify Midtrans webhook signatures
2. Use HTTPS for all API endpoints
3. Add proper error handling and logging
4. Consider adding CSRF protection for payment routes

## Troubleshooting

Common issues:

1. **Payment not processed**: Check Midtrans dashboard for transaction status
2. **Webhook not working**: Ensure webhook URL is accessible from the internet
3. **Trial not starting**: Check database connections and permissions

## Useful Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Dashboard](https://dashboard.sandbox.midtrans.com/) 