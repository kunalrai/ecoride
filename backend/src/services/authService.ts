import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { sendPhoneOTP, verifyOTP } from './otpService';

export const signupWithPhone = async (phone: string, name: string): Promise<void> => {
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingUser) {
    throw new Error('User already exists with this phone number');
  }

  await sendPhoneOTP(phone);
};

export const verifyPhoneAndCreateUser = async (
  phone: string,
  name: string,
  otp: string
): Promise<{ user: any; token: string }> => {
  const isValid = await verifyOTP(phone, otp, 'PHONE');

  if (!isValid) {
    throw new Error('Invalid or expired OTP');
  }

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        name,
        isPhoneVerified: true,
      },
    });

    await prisma.wallet.create({
      data: {
        userId: user.id,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { isPhoneVerified: true },
    });
  }

  const token = generateToken({
    userId: user.id,
    phone: user.phone,
    email: user.email || undefined,
  });

  return { user, token };
};

export const loginWithPhone = async (phone: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await sendPhoneOTP(phone);
};

export const verifyLoginOTP = async (
  phone: string,
  otp: string
): Promise<{ user: any; token: string }> => {
  const isValid = await verifyOTP(phone, otp, 'PHONE');

  if (!isValid) {
    throw new Error('Invalid or expired OTP');
  }

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const token = generateToken({
    userId: user.id,
    phone: user.phone,
    email: user.email || undefined,
  });

  return { user, token };
};

export const updateProfile = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    company?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    profilePicture?: string;
  }
): Promise<any> => {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
};

export const getUserProfile = async (userId: string): Promise<any> => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vehicles: true,
      wallet: true,
    },
  });
};
