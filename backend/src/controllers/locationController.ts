import { Response } from 'express';
import { AuthRequest } from '../types';
import * as locationService from '../services/locationService';

export const reverseGeocode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }

    const address = await locationService.getAddressFromCoords(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.status(200).json({ address });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const searchPlaces = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query, lat, lng } = req.body;

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const location =
      lat && lng
        ? { lat: parseFloat(lat), lng: parseFloat(lng) }
        : undefined;

    const places = await locationService.searchPlaces(query, location);

    res.status(200).json({ places });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPlaceDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      res.status(400).json({ error: 'Place ID is required' });
      return;
    }

    const details = await locationService.getPlaceDetails(placeId);

    if (!details) {
      res.status(404).json({ error: 'Place not found' });
      return;
    }

    res.status(200).json(details);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const calculateDistance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { originLat, originLng, destLat, destLng } = req.body;

    if (!originLat || !originLng || !destLat || !destLng) {
      res.status(400).json({ error: 'Origin and destination coordinates are required' });
      return;
    }

    const result = await locationService.calculateDistance(
      { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      { lat: parseFloat(destLat), lng: parseFloat(destLng) }
    );

    if (!result) {
      res.status(500).json({ error: 'Failed to calculate distance' });
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getDirections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { originLat, originLng, destLat, destLng, waypoints } = req.body;

    if (!originLat || !originLng || !destLat || !destLng) {
      res.status(400).json({ error: 'Origin and destination coordinates are required' });
      return;
    }

    const result = await locationService.getDirections(
      { lat: parseFloat(originLat), lng: parseFloat(originLng) },
      { lat: parseFloat(destLat), lng: parseFloat(destLng) },
      waypoints
    );

    if (!result) {
      res.status(500).json({ error: 'Failed to get directions' });
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
