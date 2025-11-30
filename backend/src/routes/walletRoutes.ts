import { Router } from 'express';
import { body } from 'express-validator';
import * as walletController from '../controllers/walletController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.get('/', authenticate, walletController.getWallet);

router.post(
  '/create-order',
  authenticate,
  validate([
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  ]),
  walletController.createOrder
);

router.post(
  '/verify-payment',
  authenticate,
  validate([
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
    body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required'),
  ]),
  walletController.verifyAndLoadWallet
);

router.post(
  '/redeem',
  authenticate,
  validate([
    body('points').isInt({ min: 1 }).withMessage('Points must be at least 1'),
    body('rewardType').notEmpty().withMessage('Reward type is required'),
  ]),
  walletController.redeemPoints
);

router.get('/transactions', authenticate, walletController.getTransactionHistory);

export default router;
