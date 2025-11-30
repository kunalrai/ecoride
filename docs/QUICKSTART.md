# EcoRide Backend - Quick Start Guide

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v18+ installed
- **PostgreSQL** v14+ running
- **npm** or **yarn** package manager

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Minimum required settings:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecoride
JWT_SECRET=your-super-secret-key-change-this
```

### Step 3: Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Step 4: Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Step 5: Test the API
```bash
# Health check
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-01T10:00:00.000Z"}
```

## Quick Test Flow

### 1. Signup a User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "name": "Test User"
  }'
```

### 2. Verify with OTP (check console for OTP in dev mode)
```bash
curl -X POST http://localhost:5000/api/auth/verify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "name": "Test User",
    "otp": "123456"
  }'
```

Save the returned `token` for next requests.

### 3. Get Profile
```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Development Tools

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```
Opens at `http://localhost:5555`

### View Logs
Logs are written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

### Run in Production Mode
```bash
npm run build
npm start
```

## Common Issues & Solutions

### Issue: Database connection failed
**Solution:**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Create database: `createdb ecoride`

### Issue: Prisma client not found
**Solution:**
```bash
npm run prisma:generate
```

### Issue: Migration failed
**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name init
```

### Issue: Port 5000 already in use
**Solution:** Change PORT in .env file
```env
PORT=3000
```

## Optional Services Setup

### Twilio (SMS OTP)
1. Sign up at https://www.twilio.com
2. Get Account SID, Auth Token, and Phone Number
3. Add to .env:
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_phone
```

### Stripe (Payments)
1. Sign up at https://stripe.com
2. Get API keys from Dashboard
3. Add to .env:
```env
STRIPE_SECRET_KEY=sk_test_...
```

### Firebase (Push Notifications)
1. Create project at https://console.firebase.google.com
2. Download service account JSON
3. Add to .env:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
```

## Next Steps

1. **Import Postman Collection**: Use `postman_collection_example.json`
2. **Read API Docs**: Check `API_DOCUMENTATION.md`
3. **Review Implementation**: See `IMPLEMENTATION_SUMMARY.md`
4. **Add Test Data**: Use Prisma Studio to add sample data

## File Structure Quick Reference

```
backend/
├── src/
│   ├── controllers/    # HTTP request handlers
│   ├── services/       # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, validation, errors
│   └── utils/          # Helpers (JWT, logger, geohash)
├── prisma/
│   └── schema.prisma   # Database models
└── .env                # Your configuration
```

## Support & Documentation

- Full README: `README.md`
- API Reference: `API_DOCUMENTATION.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for your domain
- [ ] Set up proper logging (consider external service)
- [ ] Configure rate limiting appropriately
- [ ] Set up monitoring (e.g., PM2, New Relic)
- [ ] Enable database backups
- [ ] Review and test all third-party integrations

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run prisma:studio    # Open database GUI

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations

# Production
npm run build           # Compile TypeScript
npm start              # Run production server

# Code Quality
npm run lint           # Run ESLint
npm test              # Run tests (when configured)
```

---

**You're all set!** 🚀

Visit `http://localhost:5000/health` to verify the server is running.
