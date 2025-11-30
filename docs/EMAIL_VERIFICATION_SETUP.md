# Email Verification Setup Guide

## Overview

The EcoRide backend now includes email verification functionality that allows users to verify their email addresses using OTP (One-Time Password) codes sent via email.

## Implementation Details

### 1. Email Sending Service

Located in [backend/src/services/otpService.ts](../backend/src/services/otpService.ts)

**Key Functions:**
- `sendEmailOTP(email: string)` - Generates and sends a 6-digit OTP to the specified email
- `verifyOTP(identifier: string, otp: string, type: 'PHONE' | 'EMAIL')` - Verifies the OTP code

**Email Configuration:**
Uses nodemailer with SMTP settings from environment variables:
- `SMTP_HOST` - SMTP server host (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - Email address to send from
- `SMTP_PASS` - Email password or App Password
- `OTP_EXPIRY_MINUTES` - OTP validity duration (default: 10 minutes)

### 2. API Endpoints

Located in [backend/src/routes/authRoutes.ts](../backend/src/routes/authRoutes.ts)

#### Send Email Verification
```
POST /api/auth/send-email-verification
```

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "Verification code sent to email"
}
```

#### Verify Email
```
POST /api/auth/verify-email
```

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "isEmailVerified": true,
    ...
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired verification code"
}
```

### 3. Controllers

Located in [backend/src/controllers/authController.ts](../backend/src/controllers/authController.ts)

- `sendEmailVerification` - Handles sending verification email
- `verifyEmail` - Handles OTP verification and updates user profile

## Gmail Configuration

### IMPORTANT: Gmail App Password Setup

Gmail requires an **App Password** for third-party applications. Regular passwords will not work.

### Steps to Generate Gmail App Password:

1. **Enable 2-Step Verification:**
   - Go to your Google Account: https://myaccount.google.com
   - Navigate to Security → 2-Step Verification
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and enter "EcoRide Backend"
   - Click "Generate"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Update .env File:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password (remove spaces)
   OTP_EXPIRY_MINUTES=10
   ```

### Alternative Email Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

## Testing Email Functionality

A test script is provided to verify email configuration:

```bash
cd backend
npx ts-node test-email.ts
```

This will:
1. Verify SMTP connection
2. Send a test email to the configured SMTP_USER address
3. Display the test OTP code
4. Confirm successful delivery

### Expected Output (Success):
```
Testing Email Configuration...

SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: ***configured***

Verifying SMTP connection...
✓ SMTP connection verified successfully!

Sending test email...
To: your-email@gmail.com
OTP: 123456

✓ Test email sent successfully!
Message ID: <message-id>

Please check your inbox at: your-email@gmail.com

==========================================
EMAIL SENDING TEST: PASSED ✓
==========================================
```

## Database Schema

The OTP table stores verification codes:

```prisma
model OTP {
  id         String   @id @default(uuid())
  identifier String   // Email or phone number
  otp        String   // 6-digit code
  type       OTPType  // PHONE or EMAIL
  verified   Boolean  @default(false)
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([identifier, type])
}

enum OTPType {
  PHONE
  EMAIL
}
```

## Email Template

The email sent to users includes:
- Professional HTML formatting
- Clear display of the 6-digit OTP code
- Expiry time information
- EcoRide branding

Example email content:
```html
<h2>Email Verification</h2>
<p>Your EcoRide OTP is: <strong>123456</strong></p>
<p>Valid for 10 minutes.</p>
```

## Security Features

1. **OTP Expiration:** Codes expire after configured minutes (default: 10)
2. **One-Time Use:** OTPs are marked as verified after successful use
3. **Database Cleanup:** Old OTP records are deleted when new ones are generated
4. **Secure Storage:** OTPs are stored in the database, not sent in URLs
5. **Rate Limiting:** Protected by Express rate limiting middleware

## Frontend Integration

### Profile Page Example

In [pages/Profile.tsx](../pages/Profile.tsx):

```typescript
const handleSendVerification = async () => {
  try {
    const response = await backendService.sendEmailVerification(email);
    alert('Verification code sent to your email!');
  } catch (error) {
    alert('Failed to send verification code');
  }
};

const handleVerifyEmail = async () => {
  try {
    const response = await backendService.verifyEmail(email, otp);
    alert('Email verified successfully!');
    // Update user profile
  } catch (error) {
    alert('Invalid verification code');
  }
};
```

### Backend Service Methods

Add to [services/backendService.ts](../services/backendService.ts):

```typescript
export const sendEmailVerification = async (email: string) => {
  const response = await apiClient.post('/auth/send-email-verification', { email });
  return response.data;
};

export const verifyEmail = async (email: string, otp: string) => {
  const response = await apiClient.post('/auth/verify-email', { email, otp });
  return response.data;
};
```

## Troubleshooting

### Error: "Invalid login: Username and Password not accepted"
- **Cause:** Using regular Gmail password instead of App Password
- **Solution:** Generate and use a Gmail App Password (see Gmail Configuration above)

### Error: "Connection timeout"
- **Cause:** Firewall blocking SMTP port or incorrect SMTP host
- **Solution:** Check firewall settings and verify SMTP_HOST configuration

### Error: "Failed to send OTP"
- **Cause:** SMTP credentials incorrect or email service down
- **Solution:** Run test-email.ts to diagnose the issue

### Emails not received
- **Check:** Spam/junk folder
- **Check:** SMTP_USER is a valid, active email address
- **Check:** Email service provider limits/quotas

## Production Recommendations

1. **Use Professional Email Service:**
   - SendGrid, Mailgun, or Amazon SES for better deliverability
   - Gmail has daily sending limits (500 emails/day)

2. **Environment Variables:**
   - Never commit SMTP credentials to version control
   - Use secure secret management in production

3. **Email Templates:**
   - Consider using email template engines (Handlebars, EJS)
   - Add company branding and styling

4. **Monitoring:**
   - Log email sending success/failures
   - Track delivery rates
   - Set up alerts for email service failures

5. **Rate Limiting:**
   - Implement per-user rate limits for OTP requests
   - Prevent abuse and spam

## Summary

✅ Email OTP service implemented in `otpService.ts`
✅ API endpoints added: `/send-email-verification` and `/verify-email`
✅ Controllers created for handling email verification
✅ Test script provided for validation
✅ Gmail App Password setup documented
✅ Security features implemented

**Next Steps:**
1. Generate Gmail App Password
2. Update backend/.env with App Password
3. Run test-email.ts to verify configuration
4. Integrate frontend UI for email verification
5. Test end-to-end email verification flow
