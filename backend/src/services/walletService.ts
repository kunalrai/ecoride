import { prisma } from '../config/database';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const POINTS_PER_RUPEE = parseInt(process.env.POINTS_PER_RUPEE || '10');

export const getWallet = async (userId: string): Promise<any> => {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId },
    });
  }

  return wallet;
};

export const createRazorpayOrder = async (
  userId: string,
  amount: number
): Promise<any> => {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: `wallet_load_${userId}_${Date.now()}`,
    notes: {
      userId,
      type: 'wallet_load',
    },
  });

  return order;
};

export const verifyRazorpayPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> => {
  const crypto = require('crypto');

  const body = razorpayOrderId + '|' + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

export const loadWallet = async (
  userId: string,
  amount: number,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<any> => {
  const isValid = await verifyRazorpayPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    throw new Error('Payment verification failed');
  }

  const wallet = await getWallet(userId);

  const pointsEarned = Math.floor(amount * POINTS_PER_RUPEE);

  const [updatedWallet, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        points: { increment: pointsEarned },
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'CREDIT',
        category: 'WALLET_LOAD',
        amount,
        pointsChanged: pointsEarned,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        pointsBefore: wallet.points,
        pointsAfter: wallet.points + pointsEarned,
        description: `Wallet loaded with ₹${amount}`,
        paymentGatewayId: razorpayPaymentId,
      },
    }),
  ]);

  return { wallet: updatedWallet, transaction };
};

export const deductFromWallet = async (
  userId: string,
  amount: number,
  pointsToUse: number,
  bookingId: string,
  description: string
): Promise<any> => {
  const wallet = await getWallet(userId);

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  if (wallet.points < pointsToUse) {
    throw new Error('Insufficient points');
  }

  const [updatedWallet, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        points: { decrement: pointsToUse },
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        bookingId,
        type: 'DEBIT',
        category: 'RIDE_PAYMENT',
        amount,
        pointsChanged: -pointsToUse,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        pointsBefore: wallet.points,
        pointsAfter: wallet.points - pointsToUse,
        description,
      },
    }),
  ]);

  return { wallet: updatedWallet, transaction };
};

export const creditToWallet = async (
  userId: string,
  amount: number,
  bookingId: string,
  description: string
): Promise<any> => {
  const wallet = await getWallet(userId);

  const pointsEarned = Math.floor(amount * POINTS_PER_RUPEE);

  const [updatedWallet, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        points: { increment: pointsEarned },
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        bookingId,
        type: 'CREDIT',
        category: 'RIDE_EARNING',
        amount,
        pointsChanged: pointsEarned,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        pointsBefore: wallet.points,
        pointsAfter: wallet.points + pointsEarned,
        description,
      },
    }),
  ]);

  return { wallet: updatedWallet, transaction };
};

export const refundToWallet = async (
  userId: string,
  amount: number,
  pointsToRefund: number,
  bookingId: string,
  description: string
): Promise<any> => {
  const wallet = await getWallet(userId);

  const [updatedWallet, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        points: { increment: pointsToRefund },
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        bookingId,
        type: 'CREDIT',
        category: 'REFUND',
        amount,
        pointsChanged: pointsToRefund,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        pointsBefore: wallet.points,
        pointsAfter: wallet.points + pointsToRefund,
        description,
      },
    }),
  ]);

  return { wallet: updatedWallet, transaction };
};

export const redeemPoints = async (
  userId: string,
  points: number,
  rewardType: string
): Promise<any> => {
  const wallet = await getWallet(userId);

  if (wallet.points < points) {
    throw new Error('Insufficient points');
  }

  const cashValue = points / POINTS_PER_RUPEE;

  const [updatedWallet, transaction] = await prisma.$transaction([
    prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        points: { decrement: points },
        balance: { increment: cashValue },
      },
    }),
    prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'CREDIT',
        category: 'POINTS_REDEMPTION',
        amount: cashValue,
        pointsChanged: -points,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + cashValue,
        pointsBefore: wallet.points,
        pointsAfter: wallet.points - points,
        description: `Redeemed ${points} points for ${rewardType}`,
      },
    }),
  ]);

  return { wallet: updatedWallet, transaction };
};

export const getTransactionHistory = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> => {
  return await prisma.transaction.findMany({
    where: { userId },
    include: {
      booking: {
        include: {
          ride: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
};

export const processRidePayment = async (
  bookingId: string
): Promise<void> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
      passenger: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'COMPLETED') {
    throw new Error('Booking must be completed before processing payment');
  }

  const amountToDeduct = booking.totalAmount - (booking.pointsUsed / POINTS_PER_RUPEE);

  await deductFromWallet(
    booking.passengerId,
    amountToDeduct,
    booking.pointsUsed,
    bookingId,
    `Payment for ride on ${booking.ride.departureTime.toDateString()}`
  );

  const platformFee = booking.totalAmount * 0.1;
  const driverEarning = booking.totalAmount - platformFee;

  await creditToWallet(
    booking.ride.driverId,
    driverEarning,
    bookingId,
    `Earning from ride on ${booking.ride.departureTime.toDateString()}`
  );

  await prisma.user.update({
    where: { id: booking.passengerId },
    data: { totalRidesAsPassenger: { increment: 1 }, totalRides: { increment: 1 } },
  });

  await prisma.user.update({
    where: { id: booking.ride.driverId },
    data: { totalRidesAsDriver: { increment: 1 }, totalRides: { increment: 1 } },
  });
};
