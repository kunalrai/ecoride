import admin from 'firebase-admin';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized && process.env.FIREBASE_PROJECT_ID) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      firebaseInitialized = true;
      logger.info('Firebase initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase:', error);
    }
  }
};

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  initializeFirebase();

  if (!firebaseInitialized) {
    logger.warn('Firebase not initialized, skipping push notification');
    return;
  }

  try {
    await admin.messaging().send({
      token: userId,
      notification: {
        title,
        body,
      },
      data: data || {},
    });

    logger.info(`Push notification sent to user ${userId}`);
  } catch (error) {
    logger.error('Error sending push notification:', error);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  type: 'RIDE_MATCHED' | 'BOOKING_REQUEST' | 'BOOKING_ACCEPTED' | 'BOOKING_REJECTED' | 'RIDE_REMINDER' | 'PAYMENT' | 'OTHER',
  data?: any
): Promise<any> => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      type,
      data: data || {},
    },
  });

  await sendPushNotification(userId, title, body, data);

  return notification;
};

export const sendEmailNotification = async (
  email: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      html: htmlContent,
    });

    logger.info(`Email notification sent to ${email}`);
  } catch (error) {
    logger.error('Error sending email notification:', error);
  }
};

export const notifyRideMatched = async (
  passengerId: string,
  rideId: string,
  driverName: string
): Promise<void> => {
  await createNotification(
    passengerId,
    'Ride Matched!',
    `We found a ride for you with ${driverName}`,
    'RIDE_MATCHED',
    { rideId }
  );
};

export const notifyBookingRequest = async (
  driverId: string,
  bookingId: string,
  passengerName: string
): Promise<void> => {
  await createNotification(
    driverId,
    'New Booking Request',
    `${passengerName} wants to join your ride`,
    'BOOKING_REQUEST',
    { bookingId }
  );
};

export const notifyBookingAccepted = async (
  passengerId: string,
  bookingId: string,
  driverName: string
): Promise<void> => {
  await createNotification(
    passengerId,
    'Booking Accepted',
    `${driverName} has accepted your booking request`,
    'BOOKING_ACCEPTED',
    { bookingId }
  );
};

export const notifyBookingRejected = async (
  passengerId: string,
  bookingId: string,
  driverName: string
): Promise<void> => {
  await createNotification(
    passengerId,
    'Booking Rejected',
    `${driverName} has rejected your booking request`,
    'BOOKING_REJECTED',
    { bookingId }
  );
};

export const notifyRideReminder = async (
  userId: string,
  rideId: string,
  departureTime: Date
): Promise<void> => {
  await createNotification(
    userId,
    'Ride Reminder',
    `Your ride is scheduled for ${departureTime.toLocaleString()}`,
    'RIDE_REMINDER',
    { rideId }
  );
};

export const notifyPaymentProcessed = async (
  userId: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT'
): Promise<void> => {
  await createNotification(
    userId,
    'Payment Processed',
    `₹${amount} has been ${type === 'CREDIT' ? 'credited to' : 'debited from'} your wallet`,
    'PAYMENT',
    { amount, type }
  );
};

export const getUserNotifications = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
): Promise<any> => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<number> => {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return result.count;
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  return await prisma.notification.count({
    where: { userId, read: false },
  });
};
