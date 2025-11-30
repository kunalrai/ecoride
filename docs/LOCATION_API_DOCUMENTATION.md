# Location Services API Documentation

## Overview

EcoRide's Location API provides Google Maps integration for geocoding, place search, distance calculation, and directions. The Google Maps API key is securely stored on the backend to prevent exposure.

## Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Geocoding API
   - Places API
   - Distance Matrix API
   - Directions API
4. Create credentials → API Key
5. Restrict the API key (optional but recommended):
   - Application restrictions: IP addresses (your server IP)
   - API restrictions: Select enabled APIs only

### 2. Configure Environment

Add to your `.env` file:

```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

**Note:** If API key is not set, all endpoints return mock data for development.

## API Endpoints

All endpoints require authentication via JWT token.

### 1. Reverse Geocode

Convert coordinates to human-readable address.

**Endpoint:** `POST /api/location/reverse-geocode`

**Request:**
```json
{
  "lat": 12.9716,
  "lng": 77.5946
}
```

**Response:**
```json
{
  "address": "Koramangala, Bangalore, Karnataka 560034, India"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/location/reverse-geocode \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 12.9716,
    "lng": 77.5946
  }'
```

### 2. Search Places

Search for places using autocomplete.

**Endpoint:** `POST /api/location/search`

**Request:**
```json
{
  "query": "koramangala",
  "lat": 12.9716,
  "lng": 77.5946
}
```

**Parameters:**
- `query` (required) - Search query string
- `lat` (optional) - Latitude to bias results
- `lng` (optional) - Longitude to bias results

**Response:**
```json
{
  "places": [
    {
      "description": "Koramangala, Bangalore, Karnataka, India",
      "placeId": "ChIJbU60yXAWrjsR4E9-UejD3_g"
    },
    {
      "description": "Koramangala 4th Block, Bangalore, Karnataka, India",
      "placeId": "ChIJN9YQ0nAWrjsRkHYBCc5Zxjk"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/location/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "koramangala",
    "lat": 12.9716,
    "lng": 77.5946
  }'
```

### 3. Get Place Details

Get coordinates and address for a place ID.

**Endpoint:** `GET /api/location/place/:placeId`

**Response:**
```json
{
  "lat": 12.9352,
  "lng": 77.6245,
  "address": "Koramangala, Bangalore, Karnataka 560034, India"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/location/place/ChIJbU60yXAWrjsR4E9-UejD3_g \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Calculate Distance

Calculate distance and duration between two points.

**Endpoint:** `POST /api/location/distance`

**Request:**
```json
{
  "originLat": 12.9716,
  "originLng": 77.5946,
  "destLat": 12.8456,
  "destLng": 77.6603
}
```

**Response:**
```json
{
  "distance": 18500,
  "duration": 2100,
  "distanceText": "18.5 km",
  "durationText": "35 mins"
}
```

**Fields:**
- `distance` - Distance in meters
- `duration` - Duration in seconds
- `distanceText` - Human-readable distance
- `durationText` - Human-readable duration

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/location/distance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 12.9716,
    "originLng": 77.5946,
    "destLat": 12.8456,
    "destLng": 77.6603
  }'
```

### 5. Get Directions

Get route directions with polyline, distance, and steps.

**Endpoint:** `POST /api/location/directions`

**Request:**
```json
{
  "originLat": 12.9716,
  "originLng": 77.5946,
  "destLat": 12.8456,
  "destLng": 77.6603,
  "waypoints": [
    { "lat": 12.9141, "lng": 77.6411 }
  ]
}
```

**Parameters:**
- `originLat`, `originLng` (required) - Starting point
- `destLat`, `destLng` (required) - Destination
- `waypoints` (optional) - Array of intermediate points

**Response:**
```json
{
  "polyline": "encoded_polyline_string",
  "distance": 18500,
  "duration": 2100,
  "steps": [
    {
      "distance": { "text": "0.3 km", "value": 300 },
      "duration": { "text": "1 min", "value": 60 },
      "html_instructions": "Head south on 80 Feet Rd",
      "polyline": { "points": "step_polyline" }
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/location/directions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 12.9716,
    "originLng": 77.5946,
    "destLat": 12.8456,
    "destLng": 77.6603
  }'
```

## Frontend Integration

### React Example

```tsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('authToken');

// 1. Reverse Geocode
const getAddress = async (lat: number, lng: number) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/location/reverse-geocode`,
      { lat, lng },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.address;
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
};

// 2. Search Places
const searchPlaces = async (query: string, userLocation?: { lat: number; lng: number }) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/location/search`,
      { query, ...userLocation },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.places;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// 3. Get Place Details
const getPlaceDetails = async (placeId: string) => {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/location/place/${placeId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// 4. Calculate Distance
const calculateDistance = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/location/distance`,
      {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// 5. Get Directions
const getDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: Array<{ lat: number; lng: number }>
) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/location/directions`,
      {
        originLat: origin.lat,
        originLng: origin.lng,
        destLat: destination.lat,
        destLng: destination.lng,
        waypoints,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
```

### Location Search Component

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function LocationSearch({ onSelect }: { onSelect: (place: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(
          '/api/location/search',
          { query },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResults(data.places);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = async (place: any) => {
    try {
      const { data } = await axios.get(
        `/api/location/place/${place.placeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSelect({ ...place, ...data });
      setQuery(place.description);
      setResults([]);
    } catch (error) {
      console.error('Place details error:', error);
    }
  };

  return (
    <div className="location-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location..."
      />
      {loading && <div>Searching...</div>}
      {results.length > 0 && (
        <ul className="results">
          {results.map((place) => (
            <li key={place.placeId} onClick={() => handleSelect(place)}>
              {place.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Use Cases

### 1. Create Ride
- Search and select start location
- Search and select destination
- Get directions and polyline for the route
- Calculate estimated distance and duration
- Display route on map

### 2. Search Rides
- Get user's current location (from device)
- Reverse geocode to show current address
- Search nearby pickup points
- Calculate distance to each ride

### 3. Live Tracking
- Get driver's current location
- Reverse geocode to show readable address
- Calculate ETA based on current position
- Update route in real-time

## Security

### Why Backend-Only?

The Google Maps API key is stored **only on the backend** for security:

1. **Prevent Exposure**: API keys in frontend can be extracted from browser
2. **Usage Limits**: Backend can implement caching and rate limiting
3. **Cost Control**: Prevent abuse by malicious users
4. **IP Restrictions**: Can restrict API key to server IP only
5. **Monitoring**: Track all API usage centrally

### Best Practices

1. Never expose `GOOGLE_MAPS_API_KEY` in frontend code
2. Always authenticate requests with JWT
3. Implement caching for common searches
4. Set API key restrictions in Google Cloud Console
5. Monitor usage in Google Cloud Console
6. Set up billing alerts

## Rate Limiting

Location endpoints use the same rate limiting as other API endpoints:
- 100 requests per 15 minutes per IP address

## Caching Strategy

Implement caching for frequently accessed data:

```typescript
// In locationService.ts
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

export const searchPlaces = async (query: string, location?: any) => {
  const cacheKey = `search_${query}_${location?.lat}_${location?.lng}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached as any[];
  }

  const results = await fetchFromGoogleMaps(...);
  cache.set(cacheKey, results);
  return results;
};
```

## Error Handling

All endpoints return fallback data if Google Maps API is unavailable:

| Endpoint | Fallback Behavior |
|----------|------------------|
| reverse-geocode | Returns mock Bangalore addresses |
| search | Returns mock place list |
| place/:id | Returns null |
| distance | Returns null |
| directions | Returns null |

## Cost Optimization

### Google Maps API Pricing (as of 2024)

**Geocoding API:**
- $5 per 1000 requests
- First $200 free monthly credit

**Places API:**
- Autocomplete: $2.83 per 1000 requests
- Place Details: $17 per 1000 requests

**Distance Matrix API:**
- $5 per 1000 elements

**Directions API:**
- $5 per 1000 requests

### Optimization Tips

1. **Cache Results**: Store popular locations and routes
2. **Debounce Searches**: Wait 300ms before searching
3. **Limit Autocomplete**: Only search when query length > 2
4. **Session Tokens**: Use for autocomplete to reduce costs
5. **Batch Requests**: Combine multiple distance calculations

### Estimated Monthly Cost (1000 users)

- 500 location searches/day: ~$45/month
- 200 reverse geocodes/day: ~$30/month
- 100 distance calculations/day: ~$15/month
- 50 direction requests/day: ~$7.50/month
- **Total**: ~$100/month

With caching: **~$30-40/month**

## Development Mode

Without setting `GOOGLE_MAPS_API_KEY`, all endpoints return mock data:

**Mock Addresses:**
- Sony World Signal, Koramangala
- Indiranagar Metro Station
- Silk Board Junction
- Manyata Tech Park
- HSR Layout
- And more...

This allows development and testing without API costs.

## Testing

```bash
# Get auth token
TOKEN="your-jwt-token"

# Test reverse geocode
curl -X POST http://localhost:5000/api/location/reverse-geocode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 12.9716, "lng": 77.5946}'

# Test place search
curl -X POST http://localhost:5000/api/location/search \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "koramangala"}'

# Test distance calculation
curl -X POST http://localhost:5000/api/location/distance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originLat": 12.9716,
    "originLng": 77.5946,
    "destLat": 12.8456,
    "destLng": 77.6603
  }'
```

## Monitoring

All location requests are logged via Winston:

```
INFO: Reverse geocoded: (12.9716, 77.5946) -> Koramangala, Bangalore
INFO: Places search for 'koramangala' returned 5 results
```

Check logs:
```bash
tail -f logs/combined.log | grep "location"
```

## Support

- **Google Maps Docs**: https://developers.google.com/maps
- **API Console**: https://console.cloud.google.com
- **Pricing**: https://mapsplatform.google.com/pricing/
- **Support**: https://developers.google.com/maps/support

---

**Status**: ✅ Production Ready
**Security**: ✅ API Key Protected
**Version**: 1.0.0
