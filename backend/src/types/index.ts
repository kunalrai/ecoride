import { Request } from 'express';

export interface IUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  password?: string;
  profilePicture?: string;
  company?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  gender?: 'male' | 'female' | 'other';
  rating: number;
  totalRides: number;
  totalRidesAsDriver: number;
  totalRidesAsPassenger: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVehicle {
  userId: string;
  vehicleType: 'car' | 'bike';
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seats: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
}

export interface IWaypoint {
  location: ILocation;
  order: number;
  estimatedTime?: Date;
}

export enum RideStatus {
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKDAYS = 'WEEKDAYS',
  WEEKENDS = 'WEEKENDS',
  CUSTOM = 'CUSTOM'
}

export interface IRide {
  driverId: string;
  vehicleId: string;
  startLocation: ILocation;
  endLocation: ILocation;
  waypoints: IWaypoint[];
  polyline: string;
  geohashes: string[];
  departureTime: Date;
  availableSeats: number;
  pricePerSeat: number;
  status: RideStatus;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  recurrenceDays?: number[]; // 0-6 (Sunday-Saturday)
  recurrenceEndDate?: Date;
  preferences?: {
    sameCompanyOnly?: boolean;
    genderPreference?: 'male' | 'female' | 'any';
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    musicAllowed?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface IBooking {
  rideId: string;
  passengerId: string;
  seatsBooked: number;
  pickupLocation: ILocation;
  dropLocation: ILocation;
  estimatedPickupTime?: Date;
  estimatedDropTime?: Date;
  actualPickupTime?: Date;
  actualDropTime?: Date;
  status: BookingStatus;
  totalAmount: number;
  pointsUsed: number;
  distanceTravelled?: number;
  passengerRating?: number;
  driverRating?: number;
  passengerReview?: string;
  driverReview?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionCategory {
  RIDE_PAYMENT = 'RIDE_PAYMENT',
  RIDE_EARNING = 'RIDE_EARNING',
  WALLET_LOAD = 'WALLET_LOAD',
  POINTS_REDEMPTION = 'POINTS_REDEMPTION',
  REFUND = 'REFUND'
}

export interface IWallet {
  userId: string;
  balance: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  userId: string;
  walletId: string;
  bookingId?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  pointsChanged?: number;
  balanceBefore: number;
  balanceAfter: number;
  pointsBefore: number;
  pointsAfter: number;
  description: string;
  paymentGatewayId?: string;
  createdAt: Date;
}

export interface IOTP {
  identifier: string; // phone or email
  otp: string;
  type: 'phone' | 'email';
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface INotification {
  userId: string;
  title: string;
  body: string;
  type: 'ride_matched' | 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'ride_reminder' | 'payment' | 'other';
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface IRating {
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  review?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phone: string;
    email?: string;
  };
}
