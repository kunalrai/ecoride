# Backend Integration Guide

## Overview
This document explains how the EcoRide frontend has been integrated with the actual backend API, replacing the mock backend service.

## Changes Made

### 1. New Backend Service (`services/backendService.ts`)
Created a comprehensive service layer that:
- Wraps all API calls to the backend
- Handles authentication token management
- Transforms backend data structures to frontend types
- Provides error handling and fallbacks
- Maintains the same interface as the mock backend for seamless migration

### 2. Updated Components
All components have been updated to use the real backend:
- ✅ **FindRide.tsx** - Search and display available rides
- ✅ **OfferRide.tsx** - Create new ride offerings
- ✅ **RideDetails.tsx** - View and book rides
- ✅ **Dashboard.tsx** - View bookings and offered rides
- ✅ **Auth.tsx** - Login/signup with OTP
- ✅ **App.tsx** - Main application logic

### 3. Environment Configuration
- **.env** file configured to point to `http://localhost:5000`
- **.env.example** available as template
- Supports switching between development and production environments

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - Request OTP
- `POST /api/auth/verify-login` - Verify OTP and login
- `GET /api/auth/profile` - Get current user profile
- `GET /api/auth/vehicles` - Get user's vehicles
- `POST /api/auth/vehicles` - Add new vehicle

### Rides
- `POST /api/rides` - Create a new ride
- `GET /api/rides` - Get rides offered by current user
- `GET /api/rides/:id` - Get ride details

### Bookings
- `POST /api/bookings/search` - Search for available rides
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/my-bookings` - Get user's bookings

## Data Transformation

The backend service handles transformation between backend and frontend data structures:

### Backend Ride → Frontend Ride
```typescript
{
  id, driverId, vehicleId,
  startLat, startLng, startAddress,
  endLat, endLng, endAddress,
  departureTime, availableSeats, pricePerSeat,
  driver: { name, profilePicture, rating, company },
  vehicle: { make, model, licensePlate }
}
→
{
  id, driverId, driverName, driverAvatar, driverRating,
  origin, destination, date, time,
  price, seatsAvailable, vehicleModel, vehicleNumber
}
```

### Backend User → Frontend User
```typescript
{
  id, name, email, phone,
  profilePicture, rating, company, isVerified,
  wallet: { balance }
}
→
{
  id, name, email, phone, role,
  avatarUrl, walletBalance, rating, company, isVerified
}
```

## Features Supported

### ✅ Implemented
1. **User Authentication**
   - OTP-based login (structure in place)
   - Token management with localStorage
   - Automatic session restoration
   - Logout functionality

2. **Ride Management**
   - Search rides with text-based filtering
   - Create new rides with vehicle association
   - View ride details
   - Automatic location detection

3. **Booking System**
   - Book available rides
   - View booking history
   - Track wallet balance

4. **Location Features**
   - Auto-detect current location on page load
   - Location-based ride search (coordinates)

### ⚠️ Limitations & Future Improvements

1. **Geocoding**
   - Currently uses default Bangalore coordinates
   - Need to integrate Google Maps Geocoding API for address → coordinates conversion

2. **Route Polylines**
   - Currently sends dummy polyline data
   - Need to integrate Google Maps Directions API for actual route data

3. **Real-time Search**
   - Search currently fetches all rides and filters client-side
   - Can optimize with server-side text search

4. **OTP Verification**
   - OTP sending is simulated
   - Need to verify actual OTP flow with backend

## Running the Application

### Prerequisites
1. Backend server running on port 5000
2. PostgreSQL database configured
3. Environment variables set in `.env`

### Start Backend
```bash
cd backend
npm install
npm run dev
```

### Start Frontend
```bash
cd ecoride
npm install
npm run dev
```

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

#### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## Testing the Integration

### 1. Test Authentication
- Open the app → Should show Auth page
- Enter phone number → Should request OTP
- Enter OTP → Should login and show home page

### 2. Test Ride Search (Find Pool)
- Navigate to "Find Pool"
- App should auto-detect your location
- Enter destination and search
- Should see available rides from backend

### 3. Test Ride Creation (Offer Pool)
- Navigate to "Offer Pool"
- App should auto-detect your location
- Fill in details and publish
- Ride should be created in backend database

### 4. Test Booking
- Search for a ride
- Click on a ride to view details
- Click "Book" button
- Booking should be created and wallet deducted

## Error Handling

The backend service includes comprehensive error handling:

1. **Network Errors** - Returns empty arrays or null instead of crashing
2. **Authentication Errors** - Clears token and redirects to login
3. **API Errors** - Logs to console and shows user-friendly messages
4. **Timeout** - Requests timeout after 30 seconds

## Token Management

- Tokens stored in localStorage as 'authToken'
- Automatically attached to all authenticated requests
- Removed on logout or 401 errors
- Persists across page refreshes

## Next Steps

1. **Implement Geocoding**
   - Add Google Maps API integration
   - Convert addresses to coordinates for searches
   - Get actual route polylines

2. **Enhance Search**
   - Add date/time filtering
   - Add route-based matching (not just text)
   - Implement geohash-based nearby search

3. **Add Real-time Features**
   - WebSocket for live ride updates
   - Real-time location tracking
   - Push notifications

4. **Improve Error UX**
   - Better error messages
   - Retry mechanisms
   - Offline support

5. **Testing**
   - Add unit tests for backend service
   - Add integration tests
   - Test error scenarios

## Troubleshooting

### "Network Error" or "Failed to fetch"
- Check if backend server is running on port 5000
- Verify CORS is enabled in backend
- Check browser console for detailed errors

### "Unauthorized" or Login Issues
- Clear localStorage and try again
- Check if JWT_SECRET matches between requests
- Verify token is being sent in headers

### "Ride not found" or Empty Results
- Check if database has rides
- Verify search coordinates are reasonable
- Check backend logs for errors

### Location Detection Not Working
- Grant browser location permissions
- Check HTTPS (required for geolocation in production)
- Verify locationService is working

## Support

For issues or questions:
1. Check backend logs: `npm run dev` in backend folder
2. Check browser console for frontend errors
3. Review API documentation: http://localhost:5000/api-docs
4. Check database directly using Prisma Studio: `npx prisma studio`
