# EcoRide Render Deployment - Quick Start Guide

## 📋 What's Been Configured

✅ **Render Configuration File** - [backend/render.yaml](backend/render.yaml)
✅ **Database Schema** - 11 PostgreSQL tables ready
✅ **Build Scripts** - Automated Prisma generation and TypeScript compilation
✅ **Swagger Documentation** - Interactive API testing at `/api-docs`
✅ **Environment Variables** - Template ready in [backend/.env.example](backend/.env.example)

## 🚀 Quick Deployment Steps

### 1. Push to GitHub (Required First)

```bash
# From your project root
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Deploy to Render

**Option A: Blueprint (Easiest - Uses render.yaml)**

1. Go to https://dashboard.render.com
2. Click **New +** → **Blueprint**
3. Connect your GitHub account
4. Select your `ecoride` repository
5. Render auto-detects `render.yaml` - Click **Apply**
6. Add required environment variables (see below)
7. Click **Apply** to deploy

**Option B: Manual Setup**

See detailed instructions in [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)

### 3. Required Environment Variables

Add these in Render Dashboard after creating the service:

```
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GEMINI_API_KEY=your-gemini-api-key
```

**Note:** The following are auto-configured:
- `DATABASE_URL` (from PostgreSQL database)
- `JWT_SECRET` (auto-generated)
- `NODE_ENV` (set to production)
- `PORT` (set to 5000)

## 🔗 Your API Endpoints (After Deployment)

Your backend will be available at:
```
https://ecoride-backend.onrender.com
```

Key endpoints:
- **Health Check:** `GET /health`
- **API Docs:** `GET /api-docs` (Swagger UI)
- **Auth:** `POST /api/auth/signup`, `POST /api/auth/login`
- **Rides:** `GET /api/rides`, `POST /api/rides`
- **Bookings:** `GET /api/bookings`, `POST /api/bookings`
- **Wallet:** `GET /api/wallet`, `POST /api/wallet/load`

## 📊 Database Tables Created

Your PostgreSQL database includes:

1. **User** - User accounts and profiles
2. **Vehicle** - Driver vehicles
3. **Ride** - Ride offers
4. **Booking** - Ride bookings
5. **Wallet** - User wallets
6. **Transaction** - Payment transactions
7. **OTP** - One-time passwords
8. **Notification** - Push notifications
9. **Rating** - User ratings
10. **Conversation** - Chat conversations
11. **Message** - Chat messages

## 🛠️ Local Development

To run locally:

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev

# Access Swagger docs locally
# http://localhost:5000/api-docs
```

## 📖 Full Documentation

- **Complete Deployment Guide:** [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)
- **Environment Variables:** [backend/.env.example](backend/.env.example)
- **Render Config:** [backend/render.yaml](backend/render.yaml)
- **API Documentation:** Available at `/api-docs` after deployment

## ⚡ Important Notes

### Free Tier Limitations
- Web service sleeps after 15 minutes of inactivity
- Cold start takes 30-60 seconds
- Database expires after 90 days
- Consider upgrading for production

### Before Going Live
- [ ] Test all API endpoints with Swagger
- [ ] Verify database connections
- [ ] Check all environment variables are set
- [ ] Test OTP/SMS functionality
- [ ] Test payment gateway integration
- [ ] Update CORS settings for your frontend domain
- [ ] Set up monitoring and alerts

### Security Checklist
- [ ] All sensitive data in environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] JWT_SECRET is strong and unique
- [ ] Database uses internal URL for connections
- [ ] API rate limiting is enabled
- [ ] HTTPS is enforced (automatic on Render)

## 🆘 Troubleshooting

**Build fails?**
- Check Render logs for specific error
- Verify `DATABASE_URL` is set
- Ensure all dependencies are in `package.json`

**Can't connect to database?**
- Use "Internal Database URL" not "External"
- Verify database and web service are in same region
- Check database is running

**Environment variables not working?**
- Variables are case-sensitive
- Multiline values need proper quotes
- Restart service after adding variables

**Need help?**
- Check [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for detailed guide
- View Render docs: https://docs.render.com
- Check logs in Render dashboard

## 📱 Next Steps After Deployment

1. **Test Your API:**
   - Visit `https://your-app.onrender.com/api-docs`
   - Test authentication endpoints
   - Verify database operations

2. **Update Frontend:**
   - Update API base URL to your Render URL
   - Test frontend integration
   - Update CORS settings if needed

3. **Monitor:**
   - Check Render dashboard logs
   - Set up error tracking (optional)
   - Monitor database usage

4. **Production Readiness:**
   - Consider upgrading to paid tier
   - Set up custom domain
   - Configure backup strategy
   - Add monitoring/alerting

---

**Ready to deploy?** Follow the steps above and you'll have your backend live in minutes! 🚀
