import { Router } from 'express';
import { body } from 'express-validator';
import * as aiController from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/generate-ride-description',
  authenticate,
  validate([
    body('origin').notEmpty().withMessage('Origin is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
    body('date').notEmpty().withMessage('Date is required'),
  ]),
  aiController.generateRideDescription
);

router.post(
  '/route-insights',
  authenticate,
  validate([
    body('origin').notEmpty().withMessage('Origin is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
  ]),
  aiController.getRouteInsights
);

router.post(
  '/assistant',
  authenticate,
  validate([
    body('message').notEmpty().withMessage('Message is required'),
  ]),
  aiController.askAssistant
);

router.post(
  '/suggest-meeting-points',
  authenticate,
  validate([
    body('origin').notEmpty().withMessage('Origin is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
  ]),
  aiController.suggestMeetingPoints
);

export default router;
