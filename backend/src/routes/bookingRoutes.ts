import { Router } from 'express';
import { body } from 'express-validator';
import * as bookingController from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/search',
  authenticate,
  validate([
    body('startLat').isFloat().withMessage('Start latitude is required'),
    body('startLng').isFloat().withMessage('Start longitude is required'),
    body('endLat').isFloat().withMessage('End latitude is required'),
    body('endLng').isFloat().withMessage('End longitude is required'),
    body('departureTime').isISO8601().withMessage('Valid departure time is required'),
  ]),
  bookingController.searchRides
);

router.get('/recommended', authenticate, bookingController.getRecommendedRides);

router.post(
  '/',
  authenticate,
  validate([
    body('rideId').notEmpty().withMessage('Ride ID is required'),
    body('seatsBooked').isInt({ min: 1 }).withMessage('Seats booked must be at least 1'),
    body('pickupLat').isFloat().withMessage('Pickup latitude is required'),
    body('pickupLng').isFloat().withMessage('Pickup longitude is required'),
    body('dropLat').isFloat().withMessage('Drop latitude is required'),
    body('dropLng').isFloat().withMessage('Drop longitude is required'),
  ]),
  bookingController.createBooking
);

router.get('/my-bookings', authenticate, bookingController.getMyBookings);

router.get('/driver-bookings', authenticate, bookingController.getDriverBookings);

router.post('/:bookingId/accept', authenticate, bookingController.acceptBooking);

router.post('/:bookingId/reject', authenticate, bookingController.rejectBooking);

router.post('/:bookingId/cancel', authenticate, bookingController.cancelBooking);

router.post('/:bookingId/check-in', authenticate, bookingController.checkIn);

router.post('/:bookingId/check-out', authenticate, bookingController.checkOut);

router.post(
  '/:bookingId/rate',
  authenticate,
  validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ]),
  bookingController.rateBooking
);

export default router;
