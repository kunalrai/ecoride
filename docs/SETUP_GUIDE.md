# EcoRide Backend - Complete Setup Guide

## Overview

This guide will help you set up the complete EcoRide backend with all features including authentication, ride management, bookings, payments, AI features, location services, and real-time chat.

## Features

- ✅ **Authentication** - Phone/Email OTP with JWT
- ✅ **User Management** - Profiles, vehicles, ratings
- ✅ **Ride Management** - Create, search, recurring rides
- ✅ **Booking System** - Request, confirm, cancel workflow
- ✅ **Payment Integration** - Razorpay with wallet system
- ✅ **AI Features** - Google Gemini for descriptions & insights
- ✅ **Location Services** - Google Maps for geocoding & directions
- ✅ **Chat System** - Real-time messaging between users
- ✅ **Notifications** - Push, Email, SMS notifications
- ✅ **Matching Algorithm** - Geohash-based route matching

## Prerequisites

1. **Node.js** - Version 16 or higher
2. **PostgreSQL** - Version 14 or higher
3. **npm** or **yarn** - Package manager

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ecoride"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Server
PORT=5000
NODE_ENV=development
```

**Minimal setup** - The backend will work with just these variables. Other services will use mock/fallback data.

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed sample data
npx prisma db seed
```

### 4. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server will start at: `http://localhost:5000`

### 5. Verify Setup

Check health endpoint:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T12:00:00.000Z"
}
```

## Complete Setup (All Features)

To enable all features, configure these additional services:

### 1. Payment Gateway (Razorpay)

**Get API Keys:**
1. Create account at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys
3. Generate Key ID and Secret

**Add to .env:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Test Payment:**
```bash
curl -X POST http://localhost:5000/api/wallet/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

### 2. AI Features (Google Gemini)

**Get API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key

**Add to .env:**
```env
GEMINI_API_KEY=your_gemini_api_key
```

**Test AI:**
```bash
curl -X POST http://localhost:5000/api/ai/generate-ride-description \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Koramangala",
    "destination": "Electronic City",
    "date": "2025-11-30"
  }'
```

### 3. Location Services (Google Maps)

**Get API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable these APIs:
   - Geocoding API
   - Places API
   - Distance Matrix API
   - Directions API
3. Create API Key

**Add to .env:**
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Test Location:**
```bash
curl -X POST http://localhost:5000/api/location/reverse-geocode \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 12.9716, "lng": 77.5946}'
```

### 4. SMS Notifications (Twilio)

**Get Credentials:**
1. Create account at [twilio.com](https://www.twilio.com)
2. Get Account SID, Auth Token, and Phone Number

**Add to .env:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 5. Push Notifications (Firebase)

**Get Service Account:**
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate new private key

**Add to .env:**
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

### 6. Email (Optional)

**Add to .env:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ecoride.com
```

## Database Schema

The database includes these models:

1. **User** - User profiles, auth, ratings
2. **Vehicle** - User vehicles
3. **Ride** - Posted rides
4. **Booking** - Ride bookings
5. **Rating** - User ratings
6. **Wallet** - User wallets
7. **Transaction** - Payment transactions
8. **Notification** - Push/Email/SMS notifications
9. **Conversation** - Chat conversations
10. **Message** - Chat messages

View schema:
```bash
npx prisma studio
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register with phone
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login with email
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Rides
- `POST /api/rides` - Create ride
- `GET /api/rides` - List rides
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride

### Bookings
- `POST /api/bookings/search` - Search rides
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Wallet & Payments
- `POST /api/wallet/create-order` - Create Razorpay order
- `POST /api/wallet/verify-payment` - Verify and add funds
- `GET /api/wallet/balance` - Get balance
- `GET /api/wallet/transactions` - Transaction history

### AI Features
- `POST /api/ai/generate-ride-description` - AI ride description
- `POST /api/ai/route-insights` - Route insights
- `POST /api/ai/assistant` - AI chatbot
- `POST /api/ai/suggest-meeting-points` - Meeting point suggestions

### Location Services
- `POST /api/location/reverse-geocode` - Coords to address
- `POST /api/location/search` - Place search
- `GET /api/location/place/:placeId` - Place details
- `POST /api/location/distance` - Calculate distance
- `POST /api/location/directions` - Get directions

### Chat
- `POST /api/chat/conversations` - Create/get conversation
- `POST /api/chat/:id/messages` - Send message
- `GET /api/chat/:id/messages` - Get messages
- `PUT /api/chat/:id/read` - Mark as read
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/unread-count` - Unread count

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

**Complete API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Testing

### Get Authentication Token

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "name": "Test User"
  }'

# 2. Verify OTP (use OTP from console logs in dev mode)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456"
  }'

# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Test Ride Creation

```bash
curl -X POST http://localhost:5000/api/rides \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startAddress": "Koramangala, Bangalore",
    "endAddress": "Electronic City, Bangalore",
    "startLat": 12.9352,
    "startLng": 77.6245,
    "endLat": 12.8456,
    "endLng": 77.6603,
    "departureTime": "2025-12-01T09:00:00Z",
    "availableSeats": 3,
    "pricePerSeat": 150,
    "vehicleId": "vehicle-id-here"
  }'
```

### Test Chat

```bash
# Create conversation
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rideId": "ride-id-here"}'

# Send message
curl -X POST http://localhost:5000/api/chat/conv-id/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! Looking forward to the ride.",
    "messageType": "TEXT"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Prisma client
│   │   ├── firebase.ts       # Firebase admin
│   │   └── twilio.ts         # Twilio client
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── rideController.ts
│   │   ├── bookingController.ts
│   │   ├── walletController.ts
│   │   ├── aiController.ts
│   │   ├── locationController.ts
│   │   ├── chatController.ts
│   │   └── notificationController.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── rideService.ts
│   │   ├── bookingService.ts
│   │   ├── walletService.ts
│   │   ├── geminiService.ts
│   │   ├── locationService.ts
│   │   ├── chatService.ts
│   │   └── notificationService.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── rideRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   ├── walletRoutes.ts
│   │   ├── aiRoutes.ts
│   │   ├── locationRoutes.ts
│   │   ├── chatRoutes.ts
│   │   └── notificationRoutes.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── validator.ts      # Request validation
│   │   └── errorHandler.ts   # Error handling
│   ├── utils/
│   │   ├── logger.ts         # Winston logger
│   │   ├── geohash.ts        # Geohashing utilities
│   │   └── otp.ts            # OTP generation
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── app.ts                # Express app
│   └── server.ts             # Server entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── .env.example              # Environment template
├── package.json
└── tsconfig.json
```

## Development Workflow

### 1. Make Schema Changes

Edit `prisma/schema.prisma`, then:
```bash
npx prisma migrate dev --name describe_your_change
npx prisma generate
```

### 2. View Database

```bash
npx prisma studio
```

### 3. Check Logs

```bash
# Real-time logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Search logs
grep "error" logs/combined.log
```

### 4. Run Tests

```bash
npm test
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` file
- Use strong JWT secret (32+ characters)
- Rotate secrets regularly

### 2. API Keys
- Restrict API keys to server IP
- Enable only required APIs
- Monitor usage in respective consoles

### 3. Rate Limiting
- Default: 100 requests per 15 minutes
- Adjust in `src/app.ts` if needed

### 4. Database
- Use connection pooling
- Enable SSL in production
- Regular backups

### 5. Authentication
- JWT expires in 30 days (configurable)
- OTP expires in 10 minutes
- Validate all inputs

## Deployment

### Environment Setup

**Production .env:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:password@db-host:5432/ecoride?sslmode=require"
JWT_SECRET="production-secret-minimum-32-characters-long"

# Required for full functionality
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
GEMINI_API_KEY=xxxxx
GOOGLE_MAPS_API_KEY=xxxxx
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
FIREBASE_PROJECT_ID=xxxxx
FIREBASE_PRIVATE_KEY="xxxxx"
FIREBASE_CLIENT_EMAIL=xxxxx
```

### Build for Production

```bash
npm run build
npm start
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ecoride-backend .
docker run -p 5000:5000 --env-file .env ecoride-backend
```

### Database Migrations

```bash
# Production migration
npx prisma migrate deploy
```

## Monitoring

### Health Check

```bash
curl http://localhost:5000/health
```

### Metrics to Monitor

1. **Response Time** - API latency
2. **Error Rate** - 4xx and 5xx responses
3. **Database** - Query performance, connections
4. **External APIs** - Razorpay, Gemini, Google Maps usage
5. **Notifications** - Delivery success rate

### Logging

All operations are logged via Winston:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output in development

## Cost Estimation

### Monthly Costs (1000 active users)

**Google Maps API:**
- Geocoding: ~$30/month
- Place Search: ~$45/month
- Distance Matrix: ~$15/month
- Directions: ~$7.50/month
- **Subtotal: ~$100/month** (with caching: ~$50/month)

**Google Gemini AI:**
- Free tier: 15 RPM, 1 million tokens/day
- Paid: $0.00025 per 1K characters
- **Subtotal: ~$10-20/month**

**Razorpay:**
- 2% per transaction
- No setup or monthly fees
- **Variable based on volume**

**Twilio SMS:**
- $0.0079 per SMS (India)
- OTPs + notifications: ~$50/month

**Firebase FCM:**
- Free for push notifications

**Database (PostgreSQL):**
- Managed hosting: ~$20-50/month

**Total: ~$130-220/month** (excluding transaction fees)

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Test connection
psql -h localhost -U postgres -d ecoride
```

### Prisma Migration Issues

```bash
# Reset database (development only!)
npx prisma migrate reset

# Generate client
npx prisma generate
```

### Port Already in Use

```bash
# Find process
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)
```

### API Key Not Working

1. Check `.env` file is loaded
2. Verify API key is active in respective console
3. Check API restrictions (IP, API limits)
4. Review usage quotas

## Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Razorpay Integration](RAZORPAY_INTEGRATION.md) - Payment setup
- [AI Features](AI_API_DOCUMENTATION.md) - Gemini AI setup
- [Location Services](LOCATION_API_DOCUMENTATION.md) - Google Maps setup
- [Chat System](CHAT_API_DOCUMENTATION.md) - Messaging features
- [Migration Guides](CHAT_MIGRATION.md) - Implementation guides

## Support

### Issues

Report issues at: [GitHub Issues](https://github.com/yourusername/ecoride/issues)

### Community

- Discord: [discord.gg/ecoride](#)
- Email: support@ecoride.com

## License

MIT License - see LICENSE file

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: November 2025
