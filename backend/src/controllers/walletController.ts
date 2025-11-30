import { Response } from 'express';
import { AuthRequest } from '../types';
import * as walletService from '../services/walletService';

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wallet = await walletService.getWallet(req.user!.userId);
    res.status(200).json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const order = await walletService.createRazorpayOrder(req.user!.userId, amount);
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyAndLoadWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const result = await walletService.loadWallet(
      req.user!.userId,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const redeemPoints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { points, rewardType } = req.body;
    const result = await walletService.redeemPoints(
      req.user!.userId,
      points,
      rewardType
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const transactions = await walletService.getTransactionHistory(
      req.user!.userId,
      limit,
      offset
    );
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
