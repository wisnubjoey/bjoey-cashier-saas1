/**
 * Midtrans API integration for payment processing
 * Using Midtrans Sandbox for development and testing purposes
 */

// Sandbox credentials and configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-YOUR_SERVER_KEY";
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-YOUR_CLIENT_KEY";
const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const MIDTRANS_API_URL = "https://api.sandbox.midtrans.com";

// Configuration for production (to be used later)
// const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
// const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
// const MIDTRANS_SNAP_URL = "https://app.midtrans.com/snap/snap.js";
// const MIDTRANS_API_URL = "https://api.midtrans.com";

export const PLANS = {
  free: {
    name: "Free Plan",
    price: 0,
    features: [
      "1 organization",
      "10 products",
      "10 sales records",
      "Basic reporting"
    ]
  },
  pro: {
    name: "Pro Plan",
    price: 99000, // IDR 99,000
    features: [
      "Unlimited organizations",
      "Unlimited products",
      "Advanced reporting & analytics",
      "Data export capability",
      "Priority support"
    ]
  }
};

/**
 * Create a Midtrans Snap token for payment processing
 * 
 * @param orderId Unique order ID
 * @param amount Payment amount in IDR
 * @param customerDetails Customer details (name, email, etc.)
 * @returns The Snap token and redirect URL
 */
export async function createSnapToken(
  orderId: string,
  amount: number,
  customerDetails: {
    firstName: string;
    lastName?: string;
    email: string;
  }
) {
  const encodedServerKey = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  
  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    },
    credit_card: {
      secure: true
    },
    customer_details: {
      first_name: customerDetails.firstName,
      last_name: customerDetails.lastName || "",
      email: customerDetails.email
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/error`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/pending`
    }
  };

  try {
    const response = await fetch(`${MIDTRANS_API_URL}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${encodedServerKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Midtrans API error: ${errorData.error_messages?.[0] || response.statusText}`);
    }

    const data = await response.json();
    return {
      token: data.token,
      redirectUrl: data.redirect_url
    };
  } catch (error) {
    console.error("Error creating Midtrans snap token:", error);
    throw error;
  }
}

/**
 * Get transaction status from Midtrans
 * 
 * @param orderId The order ID to check
 * @returns Transaction status details
 */
export async function getTransactionStatus(orderId: string) {
  const encodedServerKey = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
  
  try {
    const response = await fetch(`${MIDTRANS_API_URL}/v2/${orderId}/status`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Basic ${encodedServerKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Midtrans API error: ${errorData.error_messages?.[0] || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting transaction status:", error);
    throw error;
  }
}

/**
 * Get Midtrans client configuration
 */
export function getMidtransClientConfig() {
  return {
    clientKey: MIDTRANS_CLIENT_KEY,
    snapUrl: MIDTRANS_SNAP_URL,
  };
}

/**
 * Get formatted currency amount (IDR)
 * 
 * @param amount Amount to format
 * @returns Formatted amount string
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
} 