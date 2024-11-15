import { NextRequest } from 'next/server';

// bKash API Configuration
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_BASE_URL = process.env.BKASH_BASE_URL;

// Get bKash Auth Token
export async function getBkashToken() {
  try {
    if (!BKASH_USERNAME || !BKASH_PASSWORD || !BKASH_APP_KEY || !BKASH_APP_SECRET) {
      throw new Error('bKash credentials not configured');
    }

    console.log('Attempting to get bKash token with credentials:', {
      username: BKASH_USERNAME,
      appKey: BKASH_APP_KEY,
      baseUrl: BKASH_BASE_URL
    });

    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'username': BKASH_USERNAME,
        'password': BKASH_PASSWORD
      },
      body: JSON.stringify({
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET
      })
    });

    const data = await response.json();
    console.log('bKash token response:', data);

    if (!response.ok) {
      throw new Error(data.msg || data.statusMessage || 'Failed to get token');
    }

    return data.id_token;
  } catch (error) {
    console.error('bKash token error:', error);
    throw error;
  }
}

// Create Payment
export async function createBkashPayment(amount: number, orderId: string) {
  try {
    const token = await getBkashToken();
    
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');
    }

    const payload = {
      mode: '0011',
      payerReference: orderId,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/bkash/callback`,
      amount: amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: orderId
    };

    console.log('Creating bKash payment with payload:', payload);

    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_APP_KEY!
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('bKash create payment response:', data);

    if (!response.ok) {
      throw new Error(data.msg || data.statusMessage || 'Failed to create payment');
    }

    return {
      paymentID: data.paymentID,
      bkashURL: data.bkashURL,
      amount: data.amount,
      currency: data.currency,
      paymentCreateTime: data.paymentCreateTime,
      transactionStatus: data.transactionStatus,
      merchantInvoiceNumber: data.merchantInvoiceNumber
    };
  } catch (error) {
    console.error('bKash create payment error:', error);
    throw error;
  }
}

// Execute Payment
export async function executeBkashPayment(paymentId: string) {
  try {
    const token = await getBkashToken();
    
    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_APP_KEY!
      },
      body: JSON.stringify({ paymentID: paymentId })
    });

    const data = await response.json();
    console.log('bKash execute payment response:', data);

    if (!response.ok) {
      throw new Error(data.msg || data.statusMessage || 'Failed to execute payment');
    }

    return data;
  } catch (error) {
    console.error('bKash execute payment error:', error);
    throw error;
  }
}

// Query Payment Status
export async function queryBkashPayment(paymentId: string) {
  try {
    const token = await getBkashToken();
    
    const response = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'X-APP-Key': BKASH_APP_KEY!
      },
      body: JSON.stringify({ paymentID: paymentId })
    });

    const data = await response.json();
    console.log('bKash query payment response:', data);

    if (!response.ok) {
      throw new Error(data.msg || data.statusMessage || 'Failed to query payment');
    }

    return data;
  } catch (error) {
    console.error('bKash query payment error:', error);
    throw error;
  }
}