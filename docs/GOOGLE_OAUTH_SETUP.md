# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for EcoRide.

## Prerequisites

- A Google Cloud Platform account
- Access to the EcoRide backend and frontend codebases

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Name your project (e.g., "EcoRide")
4. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (or "Internal" if you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - App name: `EcoRide`
   - User support email: Your email
   - Developer contact email: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
8. Click "Save and Continue"
9. Add test users (your email) if in testing mode
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name it "EcoRide Web Client"
5. Add authorized JavaScript origins:
   - Development: `http://localhost:5173` (or your dev port)
   - Production: `https://your-production-domain.com`
6. Add authorized redirect URIs:
   - Development: `http://localhost:5173`
   - Production: `https://your-production-domain.com`
7. Click "Create"
8. Copy the **Client ID** (you'll need this for both frontend and backend)
9. Copy the **Client Secret** (you'll need this for the backend only)

## Step 5: Configure Frontend Environment Variables

1. Open or create `.env` file in the frontend root directory
2. Add the following variable:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

3. Replace `your-google-client-id-here` with the Client ID from Step 4

## Step 6: Configure Backend Environment Variables

1. Open or create `.env` file in the `backend` directory
2. Add the following variables:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

3. Replace the values with the Client ID and Client Secret from Step 4

## Step 7: Test the Integration

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Navigate to the login page
4. You should see a "Continue with Google" button
5. Click it and sign in with your Google account
6. You should be redirected back to the app and logged in

## How It Works

### Frontend Flow

1. User clicks "Continue with Google" button
2. Google Sign-In popup opens
3. User authenticates with Google
4. Google returns an ID token to the frontend
5. Frontend sends the ID token to the backend at `/api/auth/google`
6. Backend validates the token and creates/logs in the user
7. Backend returns a JWT token
8. Frontend stores the JWT and user is logged in

### Backend Flow

1. Receives Google ID token from frontend
2. Verifies the token using `google-auth-library`
3. Extracts user information (email, name, profile picture)
4. Checks if user exists in database by Google ID or email
5. If user exists, updates their info and returns JWT
6. If new user, creates account and returns JWT

## Security Notes

- Never commit `.env` files to version control
- Keep your Client Secret confidential
- Use HTTPS in production
- Validate tokens on the backend (already implemented)
- The backend verifies each ID token to ensure authenticity

## Troubleshooting

### "Google login failed" error

- Check that `VITE_GOOGLE_CLIENT_ID` is set correctly in frontend `.env`
- Check that `GOOGLE_CLIENT_ID` is set correctly in backend `.env`
- Verify authorized origins in Google Cloud Console match your domain
- Check browser console for detailed error messages

### "Invalid Google token" error

- Ensure the Client ID in frontend and backend match
- Verify the token hasn't expired (tokens are short-lived)
- Check that Google+ API is enabled in Google Cloud Console

### Button doesn't appear

- Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend `.env`
- Restart the frontend development server
- Check browser console for errors

## Additional Resources

- [Google Identity Platform Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
