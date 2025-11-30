import { prisma } from '../config/database';
import { generateGeohashesForRoute } from '../utils/geohash';

export const createRide = async (
  driverId: string,
  data: {
    vehicleId: string;
    startLat: number;
    startLng: number;
    startAddress?: string;
    endLat: number;
    endLng: number;
    endAddress?: string;
    waypoints?: any[];
    polyline: string;
    departureTime: Date;
    availableSeats: number;
    pricePerSeat: number;
    isRecurring?: boolean;
    recurrenceType?: 'NONE' | 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM';
    recurrenceDays?: number[];
    recurrenceEndDate?: Date;
    preferences?: {
      sameCompanyOnly?: boolean;
      genderPreference?: 'MALE' | 'FEMALE' | 'ANY';
      smokingAllowed?: boolean;
      petsAllowed?: boolean;
      musicAllowed?: boolean;
    };
  }
): Promise<any> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: data.vehicleId, userId: driverId },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (data.availableSeats > vehicle.seats) {
    throw new Error('Available seats cannot exceed vehicle capacity');
  }

  const geohashes = generateGeohashesForRoute(data.polyline);

  return await prisma.ride.create({
    data: {
      driverId,
      vehicleId: data.vehicleId,
      startLat: data.startLat,
      startLng: data.startLng,
      startAddress: data.startAddress,
      endLat: data.endLat,
      endLng: data.endLng,
      endAddress: data.endAddress,
      waypoints: data.waypoints || [],
      polyline: data.polyline,
      geohashes,
      departureTime: data.departureTime,
      availableSeats: data.availableSeats,
      pricePerSeat: data.pricePerSeat,
      isRecurring: data.isRecurring || false,
      recurrenceType: data.recurrenceType || 'NONE',
      recurrenceDays: data.recurrenceDays || [],
      recurrenceEndDate: data.recurrenceEndDate,
      sameCompanyOnly: data.preferences?.sameCompanyOnly || false,
      genderPreference: data.preferences?.genderPreference || 'ANY',
      smokingAllowed: data.preferences?.smokingAllowed || false,
      petsAllowed: data.preferences?.petsAllowed || false,
      musicAllowed: data.preferences?.musicAllowed !== false,
    },
  });
};

export const updateRide = async (
  rideId: string,
  driverId: string,
  data: {
    departureTime?: Date;
    availableSeats?: number;
    pricePerSeat?: number;
    status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  }
): Promise<any> => {
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, driverId },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  return await prisma.ride.update({
    where: { id: rideId },
    data,
  });
};

export const cancelRide = async (rideId: string, driverId: string): Promise<any> => {
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, driverId },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  const bookings = await prisma.booking.findMany({
    where: {
      rideId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
  });

  await prisma.$transaction([
    prisma.ride.update({
      where: { id: rideId },
      data: { status: 'CANCELLED' },
    }),
    prisma.booking.updateMany({
      where: {
        rideId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      data: { status: 'CANCELLED' },
    }),
  ]);

  return { ride, cancelledBookings: bookings.length };
};

export const getDriverRides = async (
  driverId: string,
  status?: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
): Promise<any[]> => {
  return await prisma.ride.findMany({
    where: {
      driverId,
      ...(status && { status }),
    },
    include: {
      vehicle: true,
      bookings: {
        include: {
          passenger: true,
        },
      },
    },
    orderBy: { departureTime: 'desc' },
  });
};

export const getRideDetails = async (rideId: string): Promise<any> => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          rating: true,
          totalRidesAsDriver: true,
        },
      },
      vehicle: true,
      bookings: {
        where: { status: 'ACCEPTED' },
        include: {
          passenger: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  return ride;
};

export const startRide = async (rideId: string, driverId: string): Promise<any> => {
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, driverId, status: 'SCHEDULED' },
  });

  if (!ride) {
    throw new Error('Ride not found or already started');
  }

  return await prisma.ride.update({
    where: { id: rideId },
    data: { status: 'ONGOING' },
  });
};

export const completeRide = async (rideId: string, driverId: string): Promise<any> => {
  const ride = await prisma.ride.findFirst({
    where: { id: rideId, driverId, status: 'ONGOING' },
  });

  if (!ride) {
    throw new Error('Ride not found or not ongoing');
  }

  return await prisma.ride.update({
    where: { id: rideId },
    data: { status: 'COMPLETED' },
  });
};
