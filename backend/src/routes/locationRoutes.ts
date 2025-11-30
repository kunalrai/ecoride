import { Router } from 'express';
import { body, param } from 'express-validator';
import * as locationController from '../controllers/locationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/reverse-geocode',
  authenticate,
  validate([
    body('lat').isFloat().withMessage('Valid latitude is required'),
    body('lng').isFloat().withMessage('Valid longitude is required'),
  ]),
  locationController.reverseGeocode
);

router.post(
  '/search',
  authenticate,
  validate([
    body('query').notEmpty().withMessage('Query is required'),
    body('lat').optional().isFloat().withMessage('Valid latitude is required'),
    body('lng').optional().isFloat().withMessage('Valid longitude is required'),
  ]),
  locationController.searchPlaces
);

router.get(
  '/place/:placeId',
  authenticate,
  param('placeId').notEmpty().withMessage('Place ID is required'),
  locationController.getPlaceDetails
);

router.post(
  '/distance',
  authenticate,
  validate([
    body('originLat').isFloat().withMessage('Valid origin latitude is required'),
    body('originLng').isFloat().withMessage('Valid origin longitude is required'),
    body('destLat').isFloat().withMessage('Valid destination latitude is required'),
    body('destLng').isFloat().withMessage('Valid destination longitude is required'),
  ]),
  locationController.calculateDistance
);

router.post(
  '/directions',
  authenticate,
  validate([
    body('originLat').isFloat().withMessage('Valid origin latitude is required'),
    body('originLng').isFloat().withMessage('Valid origin longitude is required'),
    body('destLat').isFloat().withMessage('Valid destination latitude is required'),
    body('destLng').isFloat().withMessage('Valid destination longitude is required'),
    body('waypoints').optional().isArray().withMessage('Waypoints must be an array'),
  ]),
  locationController.getDirections
);

router.post(
  '/geocode',
  authenticate,
  validate([
    body('address').notEmpty().withMessage('Address is required'),
  ]),
  locationController.geocodeAddress
);

export default router;
