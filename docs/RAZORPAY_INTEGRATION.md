# Razorpay Integration Guide

## Overview

EcoRide uses Razorpay for payment processing. This guide explains how the wallet loading flow works with Razorpay.

## Setup

### 1. Get Razorpay API Keys

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate API Keys (Test/Live mode)
4. Copy the Key ID and Key Secret

### 2. Configure Environment Variables

Add to your `.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

## Payment Flow

### Step 1: Create Razorpay Order

**Endpoint:** `POST /api/wallet/create-order`

**Request:**
```json
{
  "amount": 1000
}
```

**Response:**
```json
{
  "id": "order_xxxxxxxxxxxx",
  "entity": "order",
  "amount": 100000,
  "amount_paid": 0,
  "amount_due": 100000,
  "currency": "INR",
  "receipt": "wallet_load_user123_1234567890",
  "status": "created",
  "notes": {
    "userId": "user_uuid",
    "type": "wallet_load"
  }
}
```

### Step 2: Client-Side Payment (Frontend)

On your frontend, use Razorpay Checkout:

```javascript
// Load Razorpay script
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Initialize payment
const options = {
  key: 'rzp_test_xxxxxxxxxxxx', // Your Razorpay Key ID
  amount: order.amount, // Amount in paise
  currency: 'INR',
  name: 'EcoRide',
  description: 'Wallet Recharge',
  order_id: order.id, // Order ID from Step 1
  handler: function (response) {
    // Step 3: Send payment details to backend for verification
    verifyPayment({
      amount: 1000, // Amount in rupees
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    });
  },
  prefill: {
    name: 'User Name',
    email: 'user@example.com',
    contact: '+919876543210'
  },
  theme: {
    color: '#10b981' // Your brand color
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

### Step 3: Verify Payment and Update Wallet

**Endpoint:** `POST /api/wallet/verify-payment`

**Request:**
```json
{
  "amount": 1000,
  "razorpayOrderId": "order_xxxxxxxxxxxx",
  "razorpayPaymentId": "pay_xxxxxxxxxxxx",
  "razorpaySignature": "generated_signature_here"
}
```

**Response:**
```json
{
  "wallet": {
    "id": "wallet_uuid",
    "userId": "user_uuid",
    "balance": 1000,
    "points": 10000
  },
  "transaction": {
    "id": "transaction_uuid",
    "type": "CREDIT",
    "category": "WALLET_LOAD",
    "amount": 1000,
    "pointsChanged": 10000,
    "balanceBefore": 0,
    "balanceAfter": 1000,
    "pointsBefore": 0,
    "pointsAfter": 10000,
    "description": "Wallet loaded with ₹1000",
    "paymentGatewayId": "pay_xxxxxxxxxxxx"
  }
}
```

## Security

### Signature Verification

The backend automatically verifies the Razorpay signature using HMAC SHA256:

```typescript
const crypto = require('crypto');
const body = razorpayOrderId + '|' + razorpayPaymentId;

const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest('hex');

const isValid = expectedSignature === razorpaySignature;
```

This ensures that the payment notification is genuinely from Razorpay and hasn't been tampered with.

## Complete Frontend Example (React)

```jsx
import { useState } from 'react';
import axios from 'axios';

function WalletRecharge() {
  const [amount, setAmount] = useState(1000);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load Razorpay SDK');
      return;
    }

    try {
      // Step 1: Create order
      const { data: order } = await axios.post(
        '/api/wallet/create-order',
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Step 2: Open Razorpay checkout
      const options = {
        key: 'rzp_test_xxxxxxxxxxxx',
        amount: order.amount,
        currency: 'INR',
        name: 'EcoRide',
        description: 'Wallet Recharge',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment
            const { data } = await axios.post(
              '/api/wallet/verify-payment',
              {
                amount,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            alert('Payment successful! Wallet loaded with ₹' + amount);
            console.log('Updated wallet:', data.wallet);
          } catch (error) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.phone
        },
        theme: {
          color: '#10b981'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert('Failed to create order');
    }
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min="1"
      />
      <button onClick={handlePayment}>
        Recharge Wallet - ₹{amount}
      </button>
      <p>You will earn {amount * 10} points!</p>
    </div>
  );
}

export default WalletRecharge;
```

## Testing

### Test Mode

Use test credentials for development:

**Test Key ID:** `rzp_test_xxxxxxxxxxxx`

**Test Cards:**
- Success: `4111 1111 1111 1111`
- Failure: `4111 1111 1111 1234`
- CVV: Any 3 digits
- Expiry: Any future date

### Production Mode

1. Complete KYC verification on Razorpay
2. Switch to live keys
3. Update environment variables with live keys:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
```

## Payment Methods Supported

Razorpay supports multiple payment methods:
- Credit/Debit Cards (Visa, Mastercard, RuPay, Maestro)
- Net Banking (50+ banks)
- UPI (Google Pay, PhonePe, PayTM, etc.)
- Wallets (PayTM, PhonePe, Amazon Pay, etc.)
- EMI
- Cardless EMI

Users can choose their preferred method during checkout.

## Error Handling

### Common Errors

1. **Payment Failed**
   - User cancels payment
   - Insufficient funds
   - Network issues

2. **Signature Verification Failed**
   - Tampered request
   - Incorrect key secret
   - Invalid signature

3. **Order Creation Failed**
   - Invalid amount
   - Razorpay API issues

### Error Response Example

```json
{
  "error": "Payment verification failed"
}
```

## Webhooks (Optional)

For additional security, you can set up Razorpay webhooks:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Save webhook secret

**Implement webhook handler:**
```typescript
router.post('/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Process webhook event
  const { event, payload } = req.body;

  if (event === 'payment.captured') {
    // Handle successful payment
  } else if (event === 'payment.failed') {
    // Handle failed payment
  }

  res.status(200).json({ status: 'ok' });
});
```

## Currency

Currently configured for **INR (Indian Rupees)**. Amounts are stored in rupees and sent to Razorpay in paise (₹1 = 100 paise).

## Points System

- **Earning:** 10 points per ₹1 spent
- **Example:** Loading ₹1000 = 10,000 points
- Points can be redeemed for rewards or used for ride discounts

## Support

For Razorpay-related issues:
- Documentation: [https://razorpay.com/docs](https://razorpay.com/docs)
- Support: [https://razorpay.com/support](https://razorpay.com/support)
- Test Mode: Use test keys for development
- Production: Complete KYC before going live
