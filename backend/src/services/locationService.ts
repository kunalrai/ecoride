import axios from 'axios';
import { logger } from '../utils/logger';
import * as nominatimService from './nominatimService';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const USE_FREE_GEOCODING = !GOOGLE_MAPS_API_KEY || process.env.USE_FREE_GEOCODING === 'true';

/**
 * Reverse geocode coordinates to address
 * Uses Nominatim (free) by default, falls back to Google Maps if API key is set
 */
export const getAddressFromCoords = async (
  lat: number,
  lng: number
): Promise<string> => {
  // Use free Nominatim service if enabled
  if (USE_FREE_GEOCODING) {
    logger.info('Using Nominatim for reverse geocoding (free service)');
    const address = await nominatimService.reverseGeocode(lat, lng);
    return address || getMockAddress();
  }

  // Use Google Maps API
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${lat},${lng}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      logger.info(`Reverse geocoded: (${lat}, ${lng}) -> ${address}`);
      return address;
    }

    logger.warn(`Geocoding failed: ${response.data.status}`);

    // Fallback to Nominatim if Google fails
    logger.info('Falling back to Nominatim');
    const address = await nominatimService.reverseGeocode(lat, lng);
    return address || 'Address not found';
  } catch (error) {
    logger.error('Error in getAddressFromCoords:', error);

    // Try Nominatim as fallback
    const address = await nominatimService.reverseGeocode(lat, lng);
    return address || getMockAddress();
  }
};

/**
 * Search for places
 * Uses Nominatim (free) by default, falls back to Google Maps if API key is set
 */
export const searchPlaces = async (
  query: string,
  location?: { lat: number; lng: number }
): Promise<Array<{ description: string; placeId: string }>> => {
  if (!query || query.length < 2) return [];

  // Use free Nominatim service if enabled
  if (USE_FREE_GEOCODING) {
    logger.info('Using Nominatim for place search (free service)');
    const places = await nominatimService.searchPlaces(query, location);
    return places.map(p => ({
      description: p.description,
      placeId: p.placeId,
    }));
  }

  // Use Google Maps API
  try {
    const params: any = {
      input: query,
      key: GOOGLE_MAPS_API_KEY,
      components: 'country:in', // Restrict to India
    };

    // Bias results based on user's location
    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = 50000; // 50km radius
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      { params }
    );

    if (response.data.status === 'OK') {
      return response.data.predictions.map((prediction: any) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }));
    }

    logger.warn(`Places search failed: ${response.data.status}`);

    // Fallback to Nominatim
    const places = await nominatimService.searchPlaces(query, location);
    return places.map(p => ({
      description: p.description,
      placeId: p.placeId,
    }));
  } catch (error) {
    logger.error('Error in searchPlaces:', error);

    // Try Nominatim as fallback
    const places = await nominatimService.searchPlaces(query, location);
    return places.map(p => ({
      description: p.description,
      placeId: p.placeId,
    }));
  }
};

/**
 * Get place details from place ID
 */
export const getPlaceDetails = async (
  placeId: string
): Promise<{ lat: number; lng: number; address: string } | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    logger.warn('GOOGLE_MAPS_API_KEY is not set. Cannot get place details.');
    return null;
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'geometry,formatted_address',
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === 'OK') {
      const result = response.data.result;
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
      };
    }

    logger.warn(`Place details failed: ${response.data.status}`);
    return null;
  } catch (error) {
    logger.error('Error in getPlaceDetails:', error);
    return null;
  }
};

/**
 * Calculate distance between two points using Google Distance Matrix API
 */
export const calculateDistance = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ distance: number; duration: number; distanceText: string; durationText: string } | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    logger.warn('GOOGLE_MAPS_API_KEY is not set. Cannot calculate distance.');
    return null;
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: 'driving',
        },
      }
    );

    if (
      response.data.status === 'OK' &&
      response.data.rows[0].elements[0].status === 'OK'
    ) {
      const element = response.data.rows[0].elements[0];
      return {
        distance: element.distance.value, // meters
        duration: element.duration.value, // seconds
        distanceText: element.distance.text,
        durationText: element.duration.text,
      };
    }

    logger.warn(`Distance calculation failed: ${response.data.status}`);
    return null;
  } catch (error) {
    logger.error('Error in calculateDistance:', error);
    return null;
  }
};

/**
 * Get route directions and polyline
 */
export const getDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: Array<{ lat: number; lng: number }>
): Promise<{
  polyline: string;
  distance: number;
  duration: number;
  steps: any[];
} | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    logger.warn('GOOGLE_MAPS_API_KEY is not set. Cannot get directions.');
    return null;
  }

  try {
    const params: any = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      key: GOOGLE_MAPS_API_KEY,
      mode: 'driving',
    };

    if (waypoints && waypoints.length > 0) {
      params.waypoints = waypoints
        .map((wp) => `${wp.lat},${wp.lng}`)
        .join('|');
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      { params }
    );

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.value,
        duration: leg.duration.value,
        steps: leg.steps,
      };
    }

    logger.warn(`Directions failed: ${response.data.status}`);
    return null;
  } catch (error) {
    logger.error('Error in getDirections:', error);
    return null;
  }
};

// ============================================================================
// Mock Data for Development (when API key is not set)
// ============================================================================

const getMockAddress = (): string => {
  const locations = [
    'Sony World Signal, Koramangala, Bangalore',
    'Indiranagar Metro Station, Bangalore',
    'Silk Board Junction, Bangalore',
    'Manyata Tech Park, Gate 5, Bangalore',
    'HSR Layout, Sector 4, Bangalore',
    'Bagmane Tech Park, CV Raman Nagar, Bangalore',
    'Wipro Gate, Sarjapur Road, Bangalore',
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

const getMockPlaces = (
  query: string
): Array<{ description: string; placeId: string }> => {
  const allPlaces = [
    { description: 'Koramangala 4th Block, Bangalore', placeId: 'mock_1' },
    { description: 'Indiranagar Metro Station, Bangalore', placeId: 'mock_2' },
    { description: 'Manyata Tech Park, Nagavara', placeId: 'mock_3' },
    { description: 'HSR Layout Sector 1, Bangalore', placeId: 'mock_4' },
    { description: 'Whitefield ITPL Main Gate', placeId: 'mock_5' },
    { description: 'Electronic City Phase 1', placeId: 'mock_6' },
    { description: 'Silk Board Junction, Hosur Road', placeId: 'mock_7' },
    { description: 'Marathahalli Bridge', placeId: 'mock_8' },
    { description: 'Bagmane Tech Park, CV Raman Nagar', placeId: 'mock_9' },
    { description: 'Phoenix Marketcity, Mahadevapura', placeId: 'mock_10' },
    { description: 'EcoSpace Business Park, Bellandur', placeId: 'mock_11' },
    { description: 'Forum Mall, Koramangala', placeId: 'mock_12' },
    { description: 'Wipro Gate, Sarjapur Road', placeId: 'mock_13' },
    { description: 'Majestic Bus Stand, Bangalore', placeId: 'mock_14' },
    { description: 'Bangalore International Airport (KIAL)', placeId: 'mock_15' },
    { description: 'MG Road, Bangalore', placeId: 'mock_16' },
    { description: 'RMZ Infinity, Old Madras Road', placeId: 'mock_17' },
    { description: 'Embassy Golf Links, Domlur', placeId: 'mock_18' },
  ];

  return allPlaces.filter((p) =>
    p.description.toLowerCase().includes(query.toLowerCase())
  );
};
