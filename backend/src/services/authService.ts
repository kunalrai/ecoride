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

  let user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update phone verification status on login
  user = await prisma.user.update({
    where: { id: user.id },
    data: { isPhoneVerified: true },
  });

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

export const updateProfileWithVerification = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    company?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    profilePicture?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
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

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

export const deleteAccount = async (userId: string): Promise<void> => {
  try {
    // Delete user's data in the following order to handle foreign key constraints

    // 1. Delete bookings (as passenger)
    await prisma.booking.deleteMany({
      where: { passengerId: userId },
    });

    // 2. Delete bookings for user's rides (as driver)
    const userRides = await prisma.ride.findMany({
      where: { driverId: userId },
      select: { id: true },
    });

    if (userRides.length > 0) {
      await prisma.booking.deleteMany({
        where: { rideId: { in: userRides.map(r => r.id) } },
      });
    }

    // 3. Delete rides
    await prisma.ride.deleteMany({
      where: { driverId: userId },
    });

    // 4. Delete notifications
    await prisma.notification.deleteMany({
      where: { userId },
    });

    // 5. Delete wallet transactions
    const userWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (userWallet) {
      await prisma.transaction.deleteMany({
        where: { walletId: userWallet.id },
      });
    }

    // 6. Delete wallet
    await prisma.wallet.deleteMany({
      where: { userId },
    });

    // 7. Delete vehicles
    await prisma.vehicle.deleteMany({
      where: { userId },
    });

    // 8. Delete OTP records (using identifier which stores phone/email)
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, email: true }
    });

    if (userToDelete) {
      const identifiers = [userToDelete.phone, userToDelete.email].filter(Boolean) as string[];
      if (identifiers.length > 0) {
        await prisma.oTP.deleteMany({
          where: { identifier: { in: identifiers } },
        });
      }
    }

    // 9. Finally, delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User account ${userId} deleted successfully`);
  } catch (error: any) {
    console.error('Delete account error:', error);
    throw new Error('Failed to delete account');
  }
};
