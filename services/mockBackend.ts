
import { Ride, User, Booking, UserRole } from '../types';

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  role: UserRole.PASSENGER,
  email: 'rahul.s@example.com',
  phone: '9876543210',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
  walletBalance: 500, // Points
  rating: 4.8,
  company: 'Google',
  isVerified: true
};

const INITIAL_RIDES: Ride[] = [
  {
    id: 'r1',
    driverId: 'd1',
    driverName: 'Priya Verma',
    driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    driverRating: 4.9,
    driverCompany: 'Infosys',
    driverVerified: true,
    vehicleModel: 'Honda City',
    vehicleNumber: 'KA-01-MJ-1234',
    origin: 'Whitefield, Bangalore',
    destination: 'HSR Layout, Bangalore',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '18:30',
    price: 90,
    seatsAvailable: 3,
    totalSeats: 4,
    description: 'Daily office commute. Leaving from ITPL main gate.',
    status: 'OPEN',
    recurring: true
  },
  {
    id: 'r2',
    driverId: 'd2',
    driverName: 'Amit Kumar',
    driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    driverRating: 4.7,
    driverCompany: 'Wipro',
    driverVerified: true,
    vehicleModel: 'Swift Dzire',
    vehicleNumber: 'KA-53-Z-9999',
    origin: 'Indiranagar Metro Station',
    destination: 'Electronic City Phase 1',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    time: '08:45',
    price: 120,
    seatsAvailable: 2,
    totalSeats: 3,
    description: 'Taking the elevated flyover. AC on, light music.',
    status: 'OPEN'
  },
  {
    id: 'r3',
    driverId: 'd3',
    driverName: 'Sneha Gupta',
    driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
    driverRating: 4.9,
    driverCompany: 'Flipkart',
    driverVerified: true,
    vehicleModel: 'Hyundai Creta',
    vehicleNumber: 'KA-05-AB-5678',
    origin: 'Koramangala 4th Block',
    destination: 'Manyata Tech Park',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '17:45',
    price: 150,
    seatsAvailable: 1,
    totalSeats: 3,
    description: 'Leaving promptly. Female passengers preferred.',
    status: 'OPEN'
  }
];

// Service
class BackendService {
  private rides: Ride[] = [...INITIAL_RIDES];
  private bookings: Booking[] = [];
  private currentUser: User | null = null; // Start as null for Auth flow

  async login(phone: string): Promise<User> {
     // Simulate login
     await new Promise(resolve => setTimeout(resolve, 1000));
     this.currentUser = { ...MOCK_USER, phone };
     return this.currentUser;
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise(resolve => setTimeout(() => resolve(this.currentUser), 300));
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async switchRole(role: UserRole): Promise<User> {
    if (!this.currentUser) throw new Error("No user");
    this.currentUser = { ...this.currentUser, role };
    return this.currentUser;
  }

  async searchRides(origin?: string, destination?: string): Promise<Ride[]> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Network delay
    return this.rides.filter(r => {
      // Simple inclusive search
      const matchOrigin = origin ? r.origin.toLowerCase().includes(origin.toLowerCase()) : true;
      const matchDest = destination ? r.destination.toLowerCase().includes(destination.toLowerCase()) : true;
      return matchOrigin && matchDest && r.status === 'OPEN';
    });
  }

  async getRideById(id: string): Promise<Ride | undefined> {
    return this.rides.find(r => r.id === id);
  }

  async createRide(ride: Omit<Ride, 'id' | 'driverId' | 'driverName' | 'driverAvatar' | 'driverRating' | 'status' | 'driverCompany' | 'driverVerified'>): Promise<Ride> {
    if (!this.currentUser) throw new Error("Not logged in");
    const newRide: Ride = {
      ...ride,
      id: Math.random().toString(36).substr(2, 9),
      driverId: this.currentUser.id,
      driverName: this.currentUser.name,
      driverAvatar: this.currentUser.avatarUrl,
      driverRating: this.currentUser.rating,
      driverCompany: this.currentUser.company,
      driverVerified: this.currentUser.isVerified,
      status: 'OPEN'
    };
    this.rides.push(newRide);
    return newRide;
  }

  async bookRide(rideId: string, seats: number): Promise<Booking> {
    if (!this.currentUser) throw new Error("Not logged in");
    const rideIndex = this.rides.findIndex(r => r.id === rideId);
    if (rideIndex === -1) throw new Error('Ride not found');
    
    const ride = this.rides[rideIndex];
    if (ride.seatsAvailable < seats) throw new Error('Not enough seats');
    
    // Update ride
    this.rides[rideIndex] = {
      ...ride,
      seatsAvailable: ride.seatsAvailable - seats,
      status: (ride.seatsAvailable - seats) === 0 ? 'FULL' : 'OPEN'
    };

    // Create booking
    const booking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      rideId,
      passengerId: this.currentUser.id,
      seatsBooked: seats,
      totalPrice: ride.price * seats,
      status: 'CONFIRMED',
      bookedAt: new Date().toISOString()
    };
    
    this.bookings.push(booking);
    // Deduct wallet
    this.currentUser.walletBalance -= booking.totalPrice;
    
    return booking;
  }

  async getUserBookings(): Promise<(Booking & { ride: Ride })[]> {
    if (!this.currentUser) return [];
    const userBookings = this.bookings.filter(b => b.passengerId === this.currentUser?.id);
    return userBookings.map(b => {
      const ride = this.rides.find(r => r.id === b.rideId);
      if (!ride) throw new Error('Ride data missing');
      return { ...b, ride };
    });
  }

  async getUserOfferedRides(): Promise<Ride[]> {
    if (!this.currentUser) return [];
    return this.rides.filter(r => r.driverId === this.currentUser?.id);
  }
}

export const backend = new BackendService();
