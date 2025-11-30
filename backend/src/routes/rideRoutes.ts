import { Router } from 'express';
import { body, query } from 'express-validator';
import * as rideController from '../controllers/rideController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/',
  authenticate,
  validate([
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('startLat').isFloat().withMessage('Start latitude is required'),
    body('startLng').isFloat().withMessage('Start longitude is required'),
    body('endLat').isFloat().withMessage('End latitude is required'),
    body('endLng').isFloat().withMessage('End longitude is required'),
    body('polyline').notEmpty().withMessage('Polyline is required'),
    body('departureTime').isISO8601().withMessage('Valid departure time is required'),
    body('availableSeats').isInt({ min: 1 }).withMessage('Available seats must be at least 1'),
    body('pricePerSeat').isFloat({ min: 0 }).withMessage('Price per seat must be non-negative'),
  ]),
  rideController.createRide
);

router.get('/', authenticate, rideController.getMyRides);

router.get('/:rideId', authenticate, rideController.getRideDetails);

router.put('/:rideId', authenticate, rideController.updateRide);

router.post('/:rideId/cancel', authenticate, rideController.cancelRide);

router.post('/:rideId/start', authenticate, rideController.startRide);

router.post('/:rideId/complete', authenticate, rideController.completeRide);

export default router;
