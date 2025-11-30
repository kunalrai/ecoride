/**
 * Backend Service for EcoRide
 *
 * This service provides a clean API interface to communicate with the backend
 * It replaces the mockBackend with real API calls
 */

import apiService, { tokenManager } from './apiService';
import { API_ENDPOINTS } from './apiConfig';
import { Ride, User, Booking, UserRole } from '../types';

interface CreateRideData {
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  totalSeats: number;
  seatsAvailable: number;
  description?: string;
  recurring?: boolean;
  vehicleModel?: string;
  vehicleNumber?: string;
}

interface BackendRide {
  id: string;
  driverId: string;
  vehicleId: string;
  startLat: number;
  startLng: number;
  startAddress?: string;
  endLat: number;
  endLng: number;
  endAddress?: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  status: string;
  isRecurring: boolean;
  driver?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
    rating: number;
    company?: string;
    isVerified: boolean;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  rating: number;
  company?: string;
  isVerified: boolean;
  wallet?: {
    balance: number;
  };
}

interface BackendBooking {
  id: string;
  rideId: string;
  passengerId: string;
  seatsBooked: number;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  status: string;
  createdAt: string;
  ride?: BackendRide;
}

// Helper to transform backend ride to frontend ride
const transformRide = (backendRide: BackendRide): Ride => {
  const departureDate = new Date(backendRide.departureTime);

  return {
    id: backendRide.id,
    driverId: backendRide.driverId,
    driverName: backendRide.driver?.name || 'Unknown Driver',
    driverAvatar: backendRide.driver?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendRide.driverId}`,
    driverRating: backendRide.driver?.rating || 0,
    driverCompany: backendRide.driver?.company,
    driverVerified: backendRide.driver?.isVerified || false,
    vehicleModel: backendRide.vehicle ? `${backendRide.vehicle.make} ${backendRide.vehicle.model}` : undefined,
    vehicleNumber: backendRide.vehicle?.licensePlate,
    origin: backendRide.startAddress || `${backendRide.startLat}, ${backendRide.startLng}`,
    destination: backendRide.endAddress || `${backendRide.endLat}, ${backendRide.endLng}`,
    date: departureDate.toISOString().split('T')[0],
    time: departureDate.toTimeString().slice(0, 5),
    price: backendRide.pricePerSeat,
    seatsAvailable: backendRide.availableSeats,
    totalSeats: backendRide.availableSeats, // Backend doesn't track total separately
    status: backendRide.status === 'SCHEDULED' ? 'OPEN' :
            backendRide.status === 'COMPLETED' ? 'COMPLETED' :
            backendRide.status === 'CANCELLED' ? 'CANCELLED' : 'OPEN',
    recurring: backendRide.isRecurring,
  };
};

// Helper to transform backend user to frontend user
const transformUser = (backendUser: BackendUser, role: UserRole = UserRole.PASSENGER): User => {
  return {
    id: backendUser.id,
    name: backendUser.name,
    role,
    email: backendUser.email,
    phone: backendUser.phone,
    avatarUrl: backendUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.name}`,
    walletBalance: backendUser.wallet?.balance || 0,
    rating: backendUser.rating,
    company: backendUser.company,
    isVerified: backendUser.isVerified,
  };
};

// Helper to transform backend booking to frontend booking
const transformBooking = (backendBooking: BackendBooking): Booking & { ride?: Ride } => {
  return {
    id: backendBooking.id,
    rideId: backendBooking.rideId,
    passengerId: backendBooking.passengerId,
    seatsBooked: backendBooking.seatsBooked,
    totalPrice: 0, // Calculate from ride if available
    status: backendBooking.status === 'CONFIRMED' || backendBooking.status === 'ACCEPTED' ? 'CONFIRMED' : 'CANCELLED',
    bookedAt: backendBooking.createdAt,
    ride: backendBooking.ride ? transformRide(backendBooking.ride) : undefined,
  };
};

class BackendService {
  private currentUser: User | null = null;

  // ============================================
  // LOCATION SERVICES
  // ============================================

  /**
   * Get current location from browser
   */
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        (error) => reject(error)
      );
    });
  }

  /**
   * Reverse geocode coordinates to address
   */
  async getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
      const response = await apiService.post<{ address: string }>(
        API_ENDPOINTS.LOCATION.BASE + '/reverse-geocode',
        { lat, lng }
      );
      return response.address;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      // Fallback to simple coordinate display
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  /**
   * Search for places
   */
  async searchPlaces(query: string): Promise<string[]> {
    try {
      const response = await apiService.post<{ places: string[] }>(
        API_ENDPOINTS.LOCATION.BASE + '/search',
        { query }
      );
      return response.places;
    } catch (error) {
      console.error('Search places error:', error);
      return [];
    }
  }

  // ============================================
  // AI SERVICES
  // ============================================

  /**
   * Generate ride description using AI
   */
  async generateRideDescription(
    origin: string,
    destination: string,
    date: string
  ): Promise<string> {
    try {
      const response = await apiService.post<{ description: string }>(
        API_ENDPOINTS.AI.BASE + '/generate-ride-description',
        { origin, destination, date }
      );
      return response.description;
    } catch (error) {
      console.error('Generate description error:', error);
      return 'Comfortable and safe ride.';
    }
  }

  /**
   * Get route insights using AI
   */
  async getRouteInsights(origin: string, destination: string): Promise<string> {
    try {
      const response = await apiService.post<{ insights: string }>(
        API_ENDPOINTS.AI.BASE + '/route-insights',
        { origin, destination }
      );
      return response.insights;
    } catch (error) {
      console.error('Route insights error:', error);
      return 'No insights available at the moment.';
    }
  }

  /**
   * Ask AI assistant
   */
  async askAiAssistant(
    history: { role: string; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    try {
      const response = await apiService.post<{ response: string }>(
        API_ENDPOINTS.AI.BASE + '/assistant',
        { history, message }
      );
      return response.response;
    } catch (error) {
      console.error('AI assistant error:', error);
      return "I'm having trouble connecting right now. Please try again.";
    }
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Login with phone and OTP
   */
  async login(phone: string, otp?: string): Promise<User> {
    try {
      // Step 1: Request OTP (if not provided)
      if (!otp) {
        await apiService.post(API_ENDPOINTS.AUTH.LOGIN, { phone });
        throw new Error('OTP_REQUIRED'); // Signal that OTP was sent
      }

      // Step 2: Verify OTP and login
      const response = await apiService.post<{ token: string; user: BackendUser }>(
        API_ENDPOINTS.AUTH.VERIFY_LOGIN,
        { phone, otp }
      );

      // Store token
      tokenManager.set(response.token);

      // Transform and cache user
      this.currentUser = transformUser(response.user);
      return this.currentUser;
    } catch (error: any) {
      if (error.message === 'OTP_REQUIRED') {
        throw error;
      }
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Get current logged-in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Return cached user if available
      if (this.currentUser) {
        return this.currentUser;
      }

      // Try to fetch from backend if we have a token
      if (tokenManager.get()) {
        const backendUser = await apiService.get<BackendUser>(API_ENDPOINTS.AUTH.PROFILE);
        this.currentUser = transformUser(backendUser);
        return this.currentUser;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    tokenManager.remove();
    this.currentUser = null;
  }

  /**
   * Switch user role (for demo purposes)
   */
  async switchRole(role: UserRole): Promise<User> {
    if (!this.currentUser) throw new Error('No user logged in');
    this.currentUser = { ...this.currentUser, role };
    return this.currentUser;
  }

  /**
   * Search for rides
   */
  async searchRides(origin?: string, destination?: string): Promise<Ride[]> {
    try {
      // For now, we'll use a simple approach - get all rides and filter client-side
      // In production, you'd want to implement proper search with coordinates
      const response = await apiService.post<BackendRide[]>(
        API_ENDPOINTS.BOOKINGS.BASE + '/search',
        {
          startLat: 12.9716, // Default Bangalore coordinates
          startLng: 77.5946,
          endLat: 12.9716,
          endLng: 77.5946,
          departureTime: new Date().toISOString(),
        }
      );

      const rides = response.map(transformRide);

      // Client-side filtering by text
      if (origin || destination) {
        return rides.filter(ride => {
          const matchOrigin = origin ? ride.origin.toLowerCase().includes(origin.toLowerCase()) : true;
          const matchDest = destination ? ride.destination.toLowerCase().includes(destination.toLowerCase()) : true;
          return matchOrigin && matchDest;
        });
      }

      return rides;
    } catch (error: any) {
      console.error('Search rides error:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  /**
   * Get ride by ID
   */
  async getRideById(id: string): Promise<Ride | undefined> {
    try {
      const backendRide = await apiService.get<BackendRide>(API_ENDPOINTS.RIDES.BY_ID(id));
      return transformRide(backendRide);
    } catch (error) {
      console.error('Get ride error:', error);
      return undefined;
    }
  }

  /**
   * Create a new ride
   */
  async createRide(ride: CreateRideData): Promise<Ride> {
    try {
      // First, ensure we have a vehicle - create a default one if needed
      let vehicles: any[];
      try {
        vehicles = await apiService.get<any[]>(API_ENDPOINTS.AUTH.VEHICLES);
      } catch {
        vehicles = [];
      }

      let vehicleId: string;
      if (vehicles.length === 0) {
        // Create a default vehicle
        const newVehicle = await apiService.post<any>(API_ENDPOINTS.AUTH.VEHICLES, {
          make: ride.vehicleModel?.split(' ')[0] || 'Honda',
          model: ride.vehicleModel?.split(' ')[1] || 'City',
          year: 2020,
          color: 'White',
          licensePlate: ride.vehicleNumber || 'KA-01-AB-1234',
          seats: ride.totalSeats || 4,
        });
        vehicleId = newVehicle.id;
      } else {
        vehicleId = vehicles[0].id;
      }

      // Create the ride with backend format
      const departureTime = new Date(`${ride.date}T${ride.time}:00`);

      const backendRide = await apiService.post<BackendRide>(API_ENDPOINTS.RIDES.BASE, {
        vehicleId,
        startLat: 12.9716, // Default coordinates - in production, geocode the origin
        startLng: 77.5946,
        startAddress: ride.origin,
        endLat: 12.9716, // Default coordinates - in production, geocode the destination
        endLng: 77.5946,
        endAddress: ride.destination,
        polyline: 'dummy_polyline', // In production, get actual route polyline
        departureTime: departureTime.toISOString(),
        availableSeats: ride.seatsAvailable,
        pricePerSeat: ride.price,
        isRecurring: ride.recurring || false,
        recurrenceType: ride.recurring ? 'WEEKDAYS' : 'NONE',
      });

      return transformRide(backendRide);
    } catch (error: any) {
      console.error('Create ride error:', error);
      throw new Error(error.message || 'Failed to create ride');
    }
  }

  /**
   * Book a ride
   */
  async bookRide(rideId: string, seats: number): Promise<Booking> {
    try {
      const ride = await this.getRideById(rideId);
      if (!ride) throw new Error('Ride not found');

      const backendBooking = await apiService.post<BackendBooking>(API_ENDPOINTS.BOOKINGS.BASE, {
        rideId,
        seatsBooked: seats,
        pickupLat: 12.9716, // Use actual coordinates in production
        pickupLng: 77.5946,
        dropLat: 12.9716,
        dropLng: 77.5946,
      });

      const booking = transformBooking(backendBooking);
      booking.totalPrice = ride.price * seats;

      // Update current user's wallet balance
      if (this.currentUser) {
        this.currentUser.walletBalance -= booking.totalPrice;
      }

      return booking;
    } catch (error: any) {
      console.error('Book ride error:', error);
      throw new Error(error.message || 'Failed to book ride');
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(): Promise<(Booking & { ride: Ride })[]> {
    try {
      const backendBookings = await apiService.get<BackendBooking[]>(
        API_ENDPOINTS.BOOKINGS.MY_BOOKINGS
      );

      return backendBookings
        .map(transformBooking)
        .filter(b => b.ride !== undefined) as (Booking & { ride: Ride })[];
    } catch (error) {
      console.error('Get user bookings error:', error);
      return [];
    }
  }

  /**
   * Get rides offered by current user
   */
  async getUserOfferedRides(): Promise<Ride[]> {
    try {
      const backendRides = await apiService.get<BackendRide[]>(API_ENDPOINTS.RIDES.BASE);
      return backendRides.map(transformRide);
    } catch (error) {
      console.error('Get user offered rides error:', error);
      return [];
    }
  }
}

export const backend = new BackendService();
