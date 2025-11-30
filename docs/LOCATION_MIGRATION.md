# Location Service Migration to Backend

## Summary

The location service has been successfully migrated from the frontend to the backend to secure the Google Maps API key and provide proper server-side geocoding, place search, and directions functionality.

## Changes Made

### 1. New Backend Files Created

#### Service Layer
**File:** [src/services/locationService.ts](src/services/locationService.ts)

Migrated from: `ecoride/services/locationService.ts`

**Functions:**
- `getAddressFromCoords()` - Reverse geocoding using Google Maps API
- `searchPlaces()` - Autocomplete place search
- `getPlaceDetails()` - Get coordinates from place ID
- `calculateDistance()` - Distance Matrix API
- `getDirections()` - Directions API with polyline

**Changes from frontend:**
- Real Google Maps API integration (not mocked)
- Uses `GOOGLE_MAPS_API_KEY` from environment
- Integrated with Winston logger
- Falls back to mock data if API key not set
- Better error handling
- Supports waypoints in directions

#### Controller Layer
**File:** [src/controllers/locationController.ts](src/controllers/locationController.ts)

**Endpoints:**
- `reverseGeocode()` - Convert coords to address
- `searchPlaces()` - Search with autocomplete
- `getPlaceDetails()` - Get place info by ID
- `calculateDistance()` - Distance between two points
- `getDirections()` - Route with polyline

#### Routes
**File:** [src/routes/locationRoutes.ts](src/routes/locationRoutes.ts)

**Routes:**
- `POST /api/location/reverse-geocode`
- `POST /api/location/search`
- `GET /api/location/place/:placeId`
- `POST /api/location/distance`
- `POST /api/location/directions`

All routes:
- Require JWT authentication
- Include request validation
- Have proper error handling

### 2. Updated Files

#### App Configuration
**File:** [src/app.ts](src/app.ts:42)

```typescript
import locationRoutes from './routes/locationRoutes';

app.use('/api/location', locationRoutes);
```

#### Environment Variables
**File:** [.env.example](.env.example:32-33)

```env
# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Migration Guide for Frontend

### Before (Direct Browser API - LIMITED)

```typescript
// ❌ LIMITED - Can't access Google Maps API from browser without exposing key
// ❌ getCurrentLocation() only - no geocoding, search, or directions
export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      (error) => reject(error)
    );
  });
};

// Mock data only
export const searchPlaces = async (query: string): Promise<string[]> => {
  // Returns hardcoded list
  return mockPlaces.filter(...);
};
```

### After (Backend API - FULL FEATURED)

```typescript
// ✅ FULL FEATURED - Real Google Maps integration
// ✅ Secure API key on backend
// ✅ All Google Maps services available

import axios from 'axios';

// Get current location (still frontend)
const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      (error) => reject(error)
    );
  });
};

// Get address from coords (now backend)
const getAddress = async (lat: number, lng: number): Promise<string> => {
  const { data } = await axios.post(
    '/api/location/reverse-geocode',
    { lat, lng },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.address;
};

// Search places (now backend with real API)
const searchPlaces = async (query: string): Promise<any[]> => {
  const { data } = await axios.post(
    '/api/location/search',
    { query },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data.places;
};
```

## API Endpoint Mapping

| Frontend Function | Backend Endpoint | Method |
|------------------|------------------|--------|
| `getCurrentLocation()` | **Keep in Frontend** | Browser API |
| `getAddressFromCoords()` | `/api/location/reverse-geocode` | POST |
| `searchPlaces()` | `/api/location/search` | POST |
| - | `/api/location/place/:placeId` | GET (NEW) |
| - | `/api/location/distance` | POST (NEW) |
| - | `/api/location/directions` | POST (NEW) |

## Security Benefits

### 1. API Key Protection
- **Before**: Could only use mock data or expose key
- **After**: Real Google Maps API, key stays secure
- **Result**: Full features without security risk

### 2. Cost Control
- **Before**: No API access means no costs
- **After**: Backend can cache, throttle, monitor
- **Result**: Optimized API usage

### 3. Rate Limiting
- **Before**: N/A (no real API)
- **After**: Server-side rate limiting
- **Result**: Prevent abuse

## New Capabilities

### 1. Real Geocoding
```typescript
// Convert coordinates to address
const address = await getAddress(12.9716, 77.5946);
// Result: "Koramangala, Bangalore, Karnataka 560034, India"
```

### 2. Autocomplete Search
```typescript
// Search with Google Places Autocomplete
const places = await searchPlaces('koramangala');
// Result: Array of places with place IDs
```

### 3. Distance Calculation
```typescript
// Calculate distance and duration
const result = await calculateDistance(origin, destination);
// Result: { distance: 18500, duration: 2100, distanceText: "18.5 km", ... }
```

### 4. Turn-by-Turn Directions
```typescript
// Get route with polyline
const route = await getDirections(origin, destination, waypoints);
// Result: { polyline: "encoded_string", distance: 18500, steps: [...] }
```

## Frontend Integration Steps

### Step 1: Keep Browser Geolocation

```typescript
// Keep this in frontend - uses browser API
export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      (error) => reject(error)
    );
  });
};
```

### Step 2: Create Location API Service

```typescript
// services/locationService.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('authToken') || '';

export const locationAPI = {
  // Reverse geocode
  getAddress: async (lat: number, lng: number): Promise<string> => {
    const { data } = await axios.post(
      `${API_BASE}/location/reverse-geocode`,
      { lat, lng },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data.address;
  },

  // Search places
  searchPlaces: async (query: string, location?: {lat: number, lng: number}): Promise<any[]> => {
    const { data } = await axios.post(
      `${API_BASE}/location/search`,
      { query, ...location },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data.places;
  },

  // Get place details
  getPlaceDetails: async (placeId: string): Promise<any> => {
    const { data } = await axios.get(
      `${API_BASE}/location/place/${placeId}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data;
  },

  // Calculate distance
  calculateDistance: async (origin: any, destination: any): Promise<any> => {
    const { data } = await axios.post(
      `${API_BASE}/location/distance`,
      {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
      },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data;
  },

  // Get directions
  getDirections: async (origin: any, destination: any, waypoints?: any[]): Promise<any> => {
    const { data } = await axios.post(
      `${API_BASE}/location/directions`,
      {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        waypoints,
      },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data;
  },
};
```

### Step 3: Update Components

```typescript
// Before
import { getAddressFromCoords, searchPlaces } from '../services/locationService';

// After
import { getCurrentLocation } from '../utils/geolocation'; // Browser API
import { locationAPI } from '../services/locationService'; // Backend API

// Usage
const location = await getCurrentLocation(); // Browser
const address = await locationAPI.getAddress(location.lat, location.lng); // Backend
const places = await locationAPI.searchPlaces('koramangala'); // Backend
```

## Testing

### Backend Setup
```bash
cd backend
echo "GOOGLE_MAPS_API_KEY=your-api-key" >> .env
npm run dev
```

### Test Endpoints
```bash
TOKEN="your-jwt-token"

# Reverse geocode
curl -X POST http://localhost:5000/api/location/reverse-geocode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 12.9716, "lng": 77.5946}'

# Search places
curl -X POST http://localhost:5000/api/location/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "koramangala"}'

# Get directions
curl -X POST http://localhost:5000/api/location/directions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 12.9716,
    "originLng": 77.5946,
    "destLat": 12.8456,
    "destLng": 77.6603
  }'
```

## Cost Optimization

### Caching Strategy

```typescript
// Cache popular locations
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

export const searchPlaces = async (query: string) => {
  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);

  if (cached) return cached as any[];

  const results = await googleMapsAPI.search(query);
  cache.set(cacheKey, results);
  return results;
};
```

### Estimated Costs

**With 1000 active users:**
- Reverse geocoding: ~$30/month
- Place search: ~$45/month
- Distance calculation: ~$15/month
- Directions: ~$7.50/month
- **Total**: ~$100/month

**With caching (50% reduction):**
- **Total**: ~$50/month

## Mock Mode

Without `GOOGLE_MAPS_API_KEY`, the service runs in mock mode:

- Returns sample Bangalore locations
- No Google API calls
- Zero cost for development
- Perfect for testing UI

## Documentation

- **Full API Docs**: [LOCATION_API_DOCUMENTATION.md](LOCATION_API_DOCUMENTATION.md)
- **Google Maps Setup**: https://developers.google.com/maps/get-started
- **Pricing**: https://mapsplatform.google.com/pricing/

## Support

- **Google Cloud Console**: https://console.cloud.google.com
- **Maps Platform**: https://mapsplatform.google.com
- **Support**: https://developers.google.com/maps/support

---

**Migration Status**: ✅ Complete
**Security**: ✅ API Key Protected
**Features**: ✅ Full Google Maps Integration
**Testing**: ✅ Mock mode available
