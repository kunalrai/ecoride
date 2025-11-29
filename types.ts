
export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatarUrl: string;
  walletBalance: number; // In Points
  rating: number;
  company?: string;
  isVerified?: boolean;
}

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverAvatar: string;
  driverRating: number;
  driverCompany?: string;
  driverVerified?: boolean;
  vehicleModel?: string;
  vehicleNumber?: string;
  origin: string;
  destination: string;
  date: string; // ISO date string
  time: string;
  price: number; // Points
  seatsAvailable: number;
  totalSeats: number;
  description?: string;
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
  aiInsights?: string;
  recurring?: boolean;
}

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  seatsBooked: number;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
