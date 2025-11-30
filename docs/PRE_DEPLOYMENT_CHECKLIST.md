# Pre-Deployment Checklist for Render

Before deploying your EcoRide backend to Render, complete this checklist:

## ✅ Code Repository

- [ ] Code is pushed to GitHub
- [ ] `.env` file is NOT committed (check `.gitignore`)
- [ ] All changes are committed
- [ ] Repository is set to public or Render has access

## ✅ Configuration Files

- [ ] `render.yaml` exists in backend directory
- [ ] `package.json` has correct build and start scripts
- [ ] `.env.example` is present for reference
- [ ] Prisma schema is up to date

## ✅ API Keys & Credentials Ready

Gather these before starting deployment:

### SMS/OTP (Twilio)
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`

### Email (SMTP)
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS` (use App Password for Gmail)

### Firebase (Push Notifications)
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `FIREBASE_CLIENT_EMAIL`

### Payment Gateway (Razorpay)
- [ ] `RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`

### Google Services
- [ ] `GOOGLE_MAPS_API_KEY`
- [ ] `GEMINI_API_KEY`

## ✅ Render Account Setup

- [ ] Created account at https://render.com
- [ ] Connected GitHub account to Render
- [ ] Verified email address

## ✅ Database Preparation

- [ ] Prisma schema is finalized
- [ ] Understand free tier limitations (90 days expiration)
- [ ] Know data migration strategy if needed

## ✅ Application Testing (Local)

- [ ] Backend runs locally without errors: `npm run dev`
- [ ] Database connection works
- [ ] API endpoints tested via Swagger
- [ ] Authentication flow tested
- [ ] Environment variables loaded correctly

## ✅ Security Review

- [ ] No hardcoded secrets in code
- [ ] Strong `JWT_SECRET` will be generated
- [ ] CORS configured appropriately
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] `.gitignore` includes `.env`, `node_modules`, `dist`

## ✅ Documentation

- [ ] API endpoints documented in Swagger
- [ ] README updated with deployment info
- [ ] Environment variables documented
- [ ] Team knows how to access deployed API

## 🚀 Ready to Deploy?

Once all items are checked:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Deploy to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Select your repository
   - Add environment variables
   - Click "Apply"

3. **Post-Deployment:**
   - [ ] Verify health endpoint works
   - [ ] Check Swagger UI is accessible
   - [ ] Test authentication endpoints
   - [ ] Verify database tables created
   - [ ] Check logs for errors
   - [ ] Test API from frontend

## 📊 Build Process

Your build will run these commands:
```bash
npm install                    # Install dependencies
prisma generate               # Generate Prisma Client
npx prisma db push            # Create database tables
tsc                           # Compile TypeScript
node dist/server.js           # Start server
```

## 🔍 Monitoring After Deployment

Within first 24 hours:
- [ ] Check Render logs for errors
- [ ] Verify cold start behavior
- [ ] Test all critical endpoints
- [ ] Monitor database connections
- [ ] Check external service integrations (Twilio, Firebase, etc.)

## 📱 Frontend Integration

After backend is deployed:
- [ ] Update frontend API base URL
- [ ] Update CORS allowed origins in backend
- [ ] Test end-to-end flow
- [ ] Verify authentication tokens work
- [ ] Test real-time features

## 🆘 Common Issues & Solutions

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check Render build logs

### Database Connection Error
- Use Internal Database URL
- Verify database is running
- Check region match

### Environment Variables Missing
- Re-check variable names (case-sensitive)
- Ensure no typos
- Restart service after adding variables

### Service Won't Start
- Check logs for specific error
- Verify `dist/server.js` was created
- Ensure PORT environment variable is set

## 📚 Resources

- [Render Documentation](https://docs.render.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Full Deployment Guide](DEPLOYMENT.md)
- [Quick Start Summary](../RENDER_DEPLOYMENT_SUMMARY.md)

---

**All checked?** You're ready to deploy! 🎉

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.
