# Payment Integration Changes - Stripe to Razorpay

## Summary

The EcoRide backend has been updated to use **Razorpay** instead of Stripe for payment processing. Razorpay is better suited for Indian market with support for UPI, Net Banking, and local payment methods.

## Changes Made

### 1. Package Dependencies

**File:** [package.json](package.json:37)

```diff
- "stripe": "^14.7.0",
+ "razorpay": "^2.9.2",
```

### 2. Environment Variables

**File:** [.env.example](.env.example:28-30)

```diff
- # Stripe (Payments)
- STRIPE_SECRET_KEY=your-stripe-secret-key
- STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

+ # Razorpay (Payments)
+ RAZORPAY_KEY_ID=your-razorpay-key-id
+ RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 3. Wallet Service

**File:** [src/services/walletService.ts](src/services/walletService.ts)

**Changes:**
- Replaced Stripe SDK with Razorpay SDK
- Implemented `createRazorpayOrder()` - Creates payment order
- Implemented `verifyRazorpayPayment()` - Verifies payment signature
- Updated `loadWallet()` - Now accepts Razorpay payment details
- All payment amounts are in INR (paise conversion handled)

**New Functions:**
```typescript
createRazorpayOrder(userId: string, amount: number): Promise<any>
verifyRazorpayPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean>
```

### 4. Wallet Controller

**File:** [src/controllers/walletController.ts](src/controllers/walletController.ts)

**Changes:**
- Added `createOrder()` - Creates Razorpay order before payment
- Renamed `loadWallet()` to `verifyAndLoadWallet()`
- Updated to handle Razorpay payment verification flow

### 5. Wallet Routes

**File:** [src/routes/walletRoutes.ts](src/routes/walletRoutes.ts)

**Changes:**
```diff
- POST /wallet/load
+ POST /wallet/create-order     # Step 1: Create order
+ POST /wallet/verify-payment   # Step 2: Verify & load wallet
```

## New Payment Flow

### Step 1: Create Order (Backend)
```http
POST /api/wallet/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}
```

**Response:**
```json
{
  "id": "order_xxxxxxxxxxxx",
  "amount": 100000,
  "currency": "INR",
  "receipt": "wallet_load_user123_1234567890"
}
```

### Step 2: Payment (Frontend - Razorpay Checkout)
```javascript
const options = {
  key: 'rzp_test_xxxxxxxxxxxx',
  amount: order.amount,
  currency: 'INR',
  order_id: order.id,
  handler: function(response) {
    // Step 3: Verify payment
    verifyPayment(response);
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

### Step 3: Verify Payment (Backend)
```http
POST /api/wallet/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "razorpayOrderId": "order_xxxxxxxxxxxx",
  "razorpayPaymentId": "pay_xxxxxxxxxxxx",
  "razorpaySignature": "generated_signature"
}
```

**Response:**
```json
{
  "wallet": {
    "balance": 1000,
    "points": 10000
  },
  "transaction": {
    "amount": 1000,
    "type": "CREDIT",
    "category": "WALLET_LOAD"
  }
}
```

## Migration Guide

### For Existing Projects

1. **Install Razorpay:**
```bash
npm uninstall stripe
npm install razorpay
```

2. **Update Environment:**
```bash
# Remove Stripe keys
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

# Add Razorpay keys
+ RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
+ RAZORPAY_KEY_SECRET=your_secret_key
```

3. **Update Frontend:**
   - Add Razorpay checkout script
   - Update payment flow to use new endpoints
   - See [RAZORPAY_INTEGRATION.md](RAZORPAY_INTEGRATION.md) for details

4. **Test:**
   - Use Razorpay test mode
   - Test card: 4111 1111 1111 1111
   - Verify signature validation

## Benefits of Razorpay

### 1. **India-First Payment Methods**
- UPI (Google Pay, PhonePe, PayTM)
- Net Banking (50+ banks)
- Wallets (PayTM, PhonePe, Amazon Pay)
- Cards (Visa, Mastercard, RuPay)
- EMI & Cardless EMI

### 2. **Better Rates for Indian Market**
- Lower transaction fees
- No setup fees
- Transparent pricing

### 3. **Local Support**
- Indian customer support
- INR as native currency
- Compliance with Indian regulations

### 4. **Advanced Features**
- Instant settlements
- Auto-retry failed payments
- Smart routing
- Detailed analytics

## Testing

### Test Credentials

**Test Mode:**
- Key ID: `rzp_test_xxxxxxxxxxxx`
- Get from: https://dashboard.razorpay.com/app/keys

**Test Cards:**
```
Success: 4111 1111 1111 1111
Failure: 4111 1111 1111 1234
CVV: Any 3 digits
Expiry: Any future date
```

**Test UPI:**
- UPI ID: `success@razorpay`
- Auto-approves payment

### Production Setup

1. Complete KYC on Razorpay
2. Submit business documents
3. Get activation approval
4. Switch to live keys
5. Update `.env` with live keys

## Security

### Signature Verification

All payments are verified using HMAC SHA256 signature:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(razorpayOrderId + '|' + razorpayPaymentId)
  .digest('hex');

const isValid = expectedSignature === razorpaySignature;
```

This prevents:
- Payment tampering
- Fake payment confirmations
- Man-in-the-middle attacks

## Documentation

- **Full Integration Guide:** [RAZORPAY_INTEGRATION.md](RAZORPAY_INTEGRATION.md)
- **API Reference:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Razorpay Docs:** https://razorpay.com/docs/

## Breaking Changes

### API Endpoints Changed

| Old (Stripe) | New (Razorpay) | Purpose |
|-------------|----------------|---------|
| `POST /wallet/load` | `POST /wallet/create-order` | Create order |
| - | `POST /wallet/verify-payment` | Verify & load |

### Request Parameters Changed

**Old (Stripe):**
```json
{
  "amount": 1000,
  "paymentMethodId": "pm_xxxx"
}
```

**New (Razorpay):**
```json
{
  "amount": 1000,
  "razorpayOrderId": "order_xxxx",
  "razorpayPaymentId": "pay_xxxx",
  "razorpaySignature": "signature_xxxx"
}
```

## Rollback Plan

If needed to rollback to Stripe:

1. Restore `walletService.ts` from git history
2. Restore `walletController.ts` from git history
3. Restore `walletRoutes.ts` from git history
4. Run: `npm uninstall razorpay && npm install stripe`
5. Update `.env` with Stripe keys
6. Restart server

## Support

- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **Support:** support@razorpay.com
- **Docs:** https://razorpay.com/docs
- **Integration Issues:** Check [RAZORPAY_INTEGRATION.md](RAZORPAY_INTEGRATION.md)

---

**Updated:** 2024
**Status:** ✅ Production Ready
