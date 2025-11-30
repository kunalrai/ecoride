import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { sendPhoneOTP, verifyOTP } from './otpService';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signupWithPhone = async (phone: string, _name: string): Promise<void> => {
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

// ============================================
// PASSWORD-BASED AUTHENTICATION
// ============================================

export const signupWithPassword = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: any; token: string }> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      authProvider: 'EMAIL',
      isEmailVerified: false,
    },
  });

  // Create wallet
  await prisma.wallet.create({
    data: {
      userId: user.id,
    },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    phone: user.phone || undefined,
    email: user.email || undefined,
  });

  return { user, token };
};

export const loginWithPassword = async (
  email: string,
  password: string
): Promise<{ user: any; token: string }> => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.password) {
    throw new Error('This account uses a different login method');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    phone: user.phone || undefined,
    email: user.email || undefined,
  });

  return { user, token };
};

// ============================================
// GOOGLE OAUTH AUTHENTICATION
// ============================================

export const loginWithGoogle = async (
  idToken: string
): Promise<{ user: any; token: string }> => {
  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token');
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw new Error('Email not provided by Google');
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: 'GOOGLE',
            profilePicture: picture || user.profilePicture,
            isEmailVerified: true,
          },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name: name || 'Google User',
          authProvider: 'GOOGLE',
          profilePicture: picture,
          isEmailVerified: true,
          isVerified: true,
        },
      });

      // Create wallet
      await prisma.wallet.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      phone: user.phone || undefined,
      email: user.email || undefined,
    });

    return { user, token };
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    throw new Error('Failed to authenticate with Google');
  }
};
