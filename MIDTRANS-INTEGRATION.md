# Midtrans Payment Integration

This document provides an overview of the Midtrans payment integration in the application and how to test it.

## Overview

The application uses Midtrans Snap for payment processing. Midtrans is a popular payment gateway in Indonesia that supports various payment methods such as credit cards, bank transfers, e-wallets, and more.

## Configuration

The following environment variables need to be set in the `.env.local` file:

```
# Midtrans credentials (Sandbox)
MIDTRANS_SERVER_KEY=YOUR_SERVER_KEY_HERE
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=YOUR_CLIENT_KEY_HERE
```

You can obtain these keys from the Midtrans dashboard:
1. Log in to the Midtrans dashboard (https://dashboard.sandbox.midtrans.com/ for testing)
2. Go to Settings > Access Keys
3. Copy the Server Key and Client Key

## Integration Points

The integration consists of the following components:

1. **Midtrans Utility (`src/lib/midtrans.ts`)**
   - Contains functions for creating payment tokens and checking transaction status
   - Defines subscription plans and their features
   - Provides helper functions for formatting currency

2. **Payment Component (`src/components/subscription/MidtransPayment.tsx`)**
   - Client-side component that loads the Midtrans Snap JavaScript
   - Handles payment flow including success, error, and pending states
   - Updates payment status on the backend

3. **Subscription API (`src/app/api/subscription/route.ts`)**
   - Handles subscription actions (starting trial, upgrading to paid plan)
   - Creates payment transactions in Midtrans
   - Updates subscription status based on payment results

4. **Subscription Page (`src/app/(auth)/subscription/page.tsx`)**
   - Displays available plans
   - Integrates with the payment component

## Testing the Integration

To test the Midtrans integration:

1. Make sure your `.env.local` file has the proper Midtrans credentials set up
2. Run the application (`npm run dev`)
3. Navigate to the subscription page
4. Select a plan and click the payment button
5. You will be redirected to the Midtrans Snap payment page
6. Use Midtrans test cards for testing:
   - Card Number: 4811 1111 1111 1114
   - Expiry Date: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - OTP/3DS: 112233

## Debugging

If you encounter issues with the payment process:

1. Check the browser console for detailed logs
2. Verify that your Midtrans credentials are correct
3. Make sure the Midtrans API is available (https://status.midtrans.com/)
4. Validate that your payment details are formatted correctly

For more detailed information, consult the [Midtrans Snap Documentation](https://snap-docs.midtrans.com/).

## Production Deployment

Before deploying to production:

1. Update the Midtrans environment variables to use production credentials
2. Update the Midtrans API URLs in the code to point to the production endpoints
3. Test thoroughly in a staging environment
4. Make sure error handling is robust for all payment scenarios

## Common Issues and Solutions

1. **Script loading failure**
   - Make sure the client key is correctly set in the environment variables
   - Check network connectivity to Midtrans domains

2. **Payment token creation failure**
   - Verify server key is correct
   - Ensure payload format matches Midtrans requirements
   - Check for any restrictions on your Midtrans account

3. **Callback issues**
   - Ensure callback URLs are correctly set
   - Check that your application can handle both successful and failed payments

4. **Invalid transaction status**
   - Verify order IDs are unique across transactions
   - Check transaction status directly in the Midtrans dashboard 