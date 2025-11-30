/**
 * Free Geocoding Service using Nominatim (OpenStreetMap)
 * No API key required - completely free with fair use policy
 * Rate limit: 1 request per second
 */

import axios from 'axios';
import { logger } from '../utils/logger';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'EcoRide-App/1.0'; // Required by Nominatim

// Rate limiting: 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second in milliseconds

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

/**
 * Geocode an address to coordinates using Nominatim
 */
export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    await waitForRateLimit();

    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'in', // Restrict to India
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      logger.info(`Geocoded: ${address} -> (${result.lat}, ${result.lon})`);
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }

    logger.warn(`Geocoding failed: No results for "${address}"`);
    return null;
  } catch (error) {
    logger.error('Error in geocodeAddress:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address using Nominatim
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    await waitForRateLimit();

    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json',
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (response.data && response.data.display_name) {
      const address = response.data.display_name;
      logger.info(`Reverse geocoded: (${lat}, ${lng}) -> ${address}`);
      return address;
    }

    logger.warn(`Reverse geocoding failed: No results for (${lat}, ${lng})`);
    return null;
  } catch (error) {
    logger.error('Error in reverseGeocode:', error);
    return null;
  }
};

/**
 * Search for places using Nominatim
 */
export const searchPlaces = async (
  query: string,
  location?: { lat: number; lng: number }
): Promise<Array<{ description: string; placeId: string; lat: number; lng: number }>> => {
  if (!query || query.length < 2) return [];

  try {
    await waitForRateLimit();

    const params: any = {
      q: query,
      format: 'json',
      limit: 10,
      countrycodes: 'in', // Restrict to India
    };

    // Bias results based on user's location
    if (location) {
      params.viewbox = `${location.lng - 0.5},${location.lat + 0.5},${location.lng + 0.5},${location.lat - 0.5}`;
      params.bounded = 0; // Don't strictly limit to viewbox
    }

    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params,
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (response.data && response.data.length > 0) {
      return response.data.map((place: any) => ({
        description: place.display_name,
        placeId: place.place_id.toString(),
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
      }));
    }

    return [];
  } catch (error) {
    logger.error('Error in searchPlaces:', error);
    return [];
  }
};

/**
 * Calculate straight-line distance between two points (Haversine formula)
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Estimate travel time based on distance (assuming average speed of 40 km/h in city)
 */
export const estimateTravelTime = (distanceMeters: number): { seconds: number; text: string } => {
  const avgSpeedKmh = 40;
  const avgSpeedMs = (avgSpeedKmh * 1000) / 3600; // Convert to m/s
  const seconds = Math.round(distanceMeters / avgSpeedMs);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let text = '';
  if (hours > 0) {
    text += `${hours} hour${hours > 1 ? 's' : ''} `;
  }
  if (minutes > 0 || hours === 0) {
    text += `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }

  return { seconds, text: text.trim() };
};
