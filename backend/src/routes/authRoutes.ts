import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Initiate user signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - name
 *             properties:
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent to your phone"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/signup',
  validate([
    body('phone').matches(/^\+\d{10,15}$/).withMessage('Invalid phone number format. Use format: +919999999999'),
    body('name').notEmpty().withMessage('Name is required'),
  ]),
  authController.signup
);

/**
 * @swagger
 * /api/auth/verify-signup:
 *   post:
 *     summary: Verify OTP and complete signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - name
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post(
  '/verify-signup',
  validate([
    body('phone').matches(/^\+\d{10,15}$/).withMessage('Invalid phone number format. Use format: +919999999999'),
    body('name').notEmpty().withMessage('Name is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ]),
  authController.verifySignup
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Initiate user login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post(
  '/login',
  validate([
    body('phone').matches(/^\+\d{10,15}$/).withMessage('Invalid phone number format. Use format: +919999999999'),
  ]),
  authController.login
);

/**
 * @swagger
 * /api/auth/verify-login:
 *   post:
 *     summary: Verify OTP and complete login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post(
  '/verify-login',
  validate([
    body('phone').matches(/^\+\d{10,15}$/).withMessage('Invalid phone number format. Use format: +919999999999'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ]),
  authController.verifyLogin
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [RIDER, DRIVER, BOTH]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @swagger
 * /api/auth/vehicles:
 *   post:
 *     summary: Add a new vehicle
 *     tags: [Authentication, Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleType
 *               - make
 *               - model
 *               - year
 *               - licensePlate
 *               - seats
 *             properties:
 *               vehicleType:
 *                 type: string
 *                 enum: [CAR, BIKE]
 *                 example: "CAR"
 *               make:
 *                 type: string
 *                 example: "Toyota"
 *               model:
 *                 type: string
 *                 example: "Camry"
 *               year:
 *                 type: integer
 *                 example: 2022
 *               licensePlate:
 *                 type: string
 *                 example: "ABC1234"
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 8
 *                 example: 4
 *     responses:
 *       201:
 *         description: Vehicle added successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/vehicles',
  authenticate,
  validate([
    body('vehicleType').isIn(['CAR', 'BIKE']).withMessage('Invalid vehicle type'),
    body('make').notEmpty().withMessage('Make is required'),
    body('model').notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
    body('licensePlate').notEmpty().withMessage('License plate is required'),
    body('seats').isInt({ min: 1, max: 8 }).withMessage('Seats must be between 1 and 8'),
  ]),
  authController.addVehicle
);

/**
 * @swagger
 * /api/auth/vehicles:
 *   get:
 *     summary: Get user's vehicles
 *     tags: [Authentication, Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/vehicles', authenticate, authController.getVehicles);

router.put('/vehicles/:vehicleId', authenticate, authController.updateVehicle);

router.delete('/vehicles/:vehicleId', authenticate, authController.deleteVehicle);

export default router;
