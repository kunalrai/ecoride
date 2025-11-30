# Frontend-Backend Connection Guide

This guide explains how the EcoRide frontend connects to the backend API.

## 📋 Overview

The frontend uses **environment variables** to configure the backend API URL, which changes based on the environment (development vs production).

## 🔧 Configuration Files

### 1. Environment Variables

**`.env.development`** (Local development)
```env
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

**`.env.production`** (Production build)
```env
VITE_API_URL=https://ecoride-backend.onrender.com
VITE_ENV=production
```

**`.env.example`** (Template - not used by app)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your-api-key
VITE_ENV=development
```

### 2. API Configuration (`services/apiConfig.ts`)

Centralizes all API endpoints and configuration:

```typescript
import { API_ENDPOINTS } from './services/apiConfig';

// Get backend URL
const backendUrl = API_ENDPOINTS.HEALTH;

// Use specific endpoints
const signupEndpoint = API_ENDPOINTS.AUTH.SIGNUP;
```

### 3. API Service (`services/apiService.ts`)

Provides HTTP request methods with:
- ✅ Automatic JWT token handling
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Timeout management
- ✅ TypeScript support

## 🚀 How It Works

### Development Environment

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   # Backend runs on http://localhost:5000
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173 (or similar)
   # Automatically uses VITE_API_URL from .env.development
   ```

3. **Frontend connects to:** `http://localhost:5000`

### Production Environment

1. **Build Frontend:**
   ```bash
   npm run build
   # Uses VITE_API_URL from .env.production
   ```

2. **Frontend connects to:** `https://ecoride-backend.onrender.com`

## 💻 Usage Examples

### Example 1: Login Request

```typescript
import apiService from './services/apiService';
import { API_ENDPOINTS } from './services/apiConfig';

// Login user
const login = async (phone: string) => {
  try {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, {
      phone: phone
    });

    console.log('OTP sent:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Example 2: Authenticated Request

```typescript
import apiService, { tokenManager } from './services/apiService';
import { API_ENDPOINTS } from './services/apiConfig';

// After login, save token
const verifyLogin = async (phone: string, otp: string) => {
  const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_LOGIN, {
    phone,
    otp
  });

  // Save token for future requests
  tokenManager.set(response.token);

  return response;
};

// Make authenticated request
const getProfile = async () => {
  // Token is automatically included in request headers
  const profile = await apiService.get(API_ENDPOINTS.AUTH.PROFILE);
  return profile;
};
```

### Example 3: Create a Ride

```typescript
import apiService from './services/apiService';
import { API_ENDPOINTS } from './services/apiConfig';

const createRide = async (rideData: any) => {
  try {
    const ride = await apiService.post(API_ENDPOINTS.RIDES.BASE, rideData);
    console.log('Ride created:', ride);
    return ride;
  } catch (error) {
    console.error('Failed to create ride:', error);
    throw error;
  }
};
```

### Example 4: Search Rides

```typescript
import apiService from './services/apiService';
import { API_ENDPOINTS } from './services/apiConfig';

const searchRides = async (searchParams: {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  departureTime: string;
}) => {
  const rides = await apiService.post(
    API_ENDPOINTS.RIDES.SEARCH,
    searchParams
  );

  return rides;
};
```

### Example 5: Upload Profile Picture

```typescript
import apiService from './services/apiService';
import { API_ENDPOINTS } from './services/apiConfig';

const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await apiService.upload(
    API_ENDPOINTS.AUTH.UPDATE_PROFILE,
    formData
  );

  return response;
};
```

## 🔐 Authentication Flow

### 1. Login/Signup

```typescript
// Step 1: Request OTP
const { message } = await apiService.post(API_ENDPOINTS.AUTH.SIGNUP, {
  phone: '+1234567890',
  name: 'John Doe'
});

// Step 2: Verify OTP and get token
const { token, user } = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_SIGNUP, {
  phone: '+1234567890',
  name: 'John Doe',
  otp: '123456'
});

// Step 3: Save token
tokenManager.set(token);
```

### 2. Making Authenticated Requests

```typescript
// Token is automatically included in all requests
const profile = await apiService.get(API_ENDPOINTS.AUTH.PROFILE);
```

### 3. Logout

```typescript
// Remove token
tokenManager.remove();

// Redirect to login page
window.location.href = '/login';
```

### 4. Handle 401 Unauthorized

```typescript
// Listen for unauthorized events
window.addEventListener('unauthorized', () => {
  console.log('Session expired. Please login again.');
  tokenManager.remove();
  window.location.href = '/login';
});
```

## 📱 CORS Configuration

The backend is configured to allow requests from your frontend:

**Backend (`src/app.ts`):**
```typescript
app.use(cors()); // Allows all origins in development
```

**For Production**, update backend to allow only your frontend domain:

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://your-frontend-domain.com',
    'http://localhost:5173' // For local testing
  ],
  credentials: true
}));
```

## 🔄 Environment Setup

### Step 1: Create `.env` file

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key
VITE_ENV=development
```

### Step 2: Update `.gitignore`

Ensure `.env` is ignored:
```
.env
.env.local
.env.*.local
```

### Step 3: Update for Production

After deploying backend to Render:

1. Update `.env.production`:
   ```env
   VITE_API_URL=https://ecoride-backend.onrender.com
   ```

2. Rebuild frontend:
   ```bash
   npm run build
   ```

## 🎯 All Available Endpoints

See [services/apiConfig.ts](services/apiConfig.ts) for complete list:

- **Health**: `/health`
- **Auth**: `/api/auth/*`
- **Rides**: `/api/rides/*`
- **Bookings**: `/api/bookings/*`
- **Wallet**: `/api/wallet/*`
- **Notifications**: `/api/notifications/*`
- **AI**: `/api/ai/*`
- **Location**: `/api/location/*`
- **Chat**: `/api/chat/*`

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Ensure backend is running
2. Check backend URL in `.env` file
3. Verify backend CORS configuration allows frontend origin
4. Check browser console for specific error

### Issue: "401 Unauthorized" on authenticated routes

**Solution:**
1. Check if token is saved: `tokenManager.get()`
2. Verify token is valid (not expired)
3. Check backend JWT_SECRET matches

### Issue: Wrong API URL in production

**Solution:**
1. Ensure `.env.production` has correct Render URL
2. Rebuild app: `npm run build`
3. Clear browser cache

### Issue: Environment variables not working

**Solution:**
1. Restart dev server after changing `.env` files
2. Ensure variables start with `VITE_`
3. Access variables using `import.meta.env.VITE_*`

## 📚 Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use environment-specific files** - `.env.development`, `.env.production`
3. **Centralize API configuration** - Use `apiConfig.ts` for all endpoints
4. **Handle errors gracefully** - Use try-catch blocks
5. **Store tokens securely** - Use `tokenManager` utility
6. **Test with real backend** - Don't rely only on mock data

## 🔗 Quick Reference

```typescript
// Import services
import apiService, { tokenManager } from './services/apiService';
import { API_ENDPOINTS } from './services/apiConfig';

// GET request
const data = await apiService.get(endpoint);

// POST request
const result = await apiService.post(endpoint, { data });

// With authentication
tokenManager.set(token);
const profile = await apiService.get(API_ENDPOINTS.AUTH.PROFILE);

// Check backend URL
console.log(import.meta.env.VITE_API_URL);
```

## 📖 Related Documentation

- [Backend Deployment Guide](backend/DEPLOYMENT.md)
- [API Documentation](http://localhost:5000/api-docs) (when backend is running)
- [Render Deployment Summary](RENDER_DEPLOYMENT_SUMMARY.md)

---

**Need help?** Check the Swagger API documentation at `/api-docs` when your backend is running.
