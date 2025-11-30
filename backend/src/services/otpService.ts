import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendPhoneOTP = async (phone: string): Promise<void> => {
  try {
    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.oTP.deleteMany({
      where: { identifier: phone, type: 'PHONE' },
    });

    await prisma.oTP.create({
      data: {
        identifier: phone,
        otp,
        type: 'PHONE',
        expiresAt,
      },
    });

    await twilioClient.messages.create({
      body: `Your EcoRide OTP is: ${otp}. Valid for ${expiryMinutes} minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    logger.info(`OTP sent to phone: ${phone}`);
  } catch (error) {
    logger.error('Error sending phone OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

export const sendEmailOTP = async (email: string): Promise<void> => {
  try {
    const otp = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await prisma.oTP.deleteMany({
      where: { identifier: email, type: 'EMAIL' },
    });

    await prisma.oTP.create({
      data: {
        identifier: email,
        otp,
        type: 'EMAIL',
        expiresAt,
      },
    });

    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'EcoRide - Email Verification OTP',
      html: `
        <h2>Email Verification</h2>
        <p>Your EcoRide OTP is: <strong>${otp}</strong></p>
        <p>Valid for ${expiryMinutes} minutes.</p>
      `,
    });

    logger.info(`OTP sent to email: ${email}`);
  } catch (error) {
    logger.error('Error sending email OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

export const verifyOTP = async (
  identifier: string,
  otp: string,
  type: 'PHONE' | 'EMAIL'
): Promise<boolean> => {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      identifier,
      type,
      otp,
      verified: false,
      expiresAt: { gte: new Date() },
    },
  });

  if (!otpRecord) {
    return false;
  }

  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return true;
};
