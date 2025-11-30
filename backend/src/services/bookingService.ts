import { prisma } from '../config/database';
import { getDistance } from 'geolib';

export const createBooking = async (
  passengerId: string,
  data: {
    rideId: string;
    seatsBooked: number;
    pickupLat: number;
    pickupLng: number;
    pickupAddress?: string;
    dropLat: number;
    dropLng: number;
    dropAddress?: string;
  }
): Promise<any> => {
  const ride = await prisma.ride.findUnique({
    where: { id: data.rideId },
    include: {
      bookings: {
        where: { status: { in: ['PENDING', 'ACCEPTED'] } },
      },
    },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  if (ride.status !== 'SCHEDULED') {
    throw new Error('Ride is not available for booking');
  }

  if (ride.driverId === passengerId) {
    throw new Error('Cannot book your own ride');
  }

  const bookedSeats = ride.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
  const availableSeats = ride.availableSeats - bookedSeats;

  if (data.seatsBooked > availableSeats) {
    throw new Error('Not enough seats available');
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      rideId: data.rideId,
      passengerId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
  });

  if (existingBooking) {
    throw new Error('You already have a booking for this ride');
  }

  const totalAmount = ride.pricePerSeat * data.seatsBooked;

  const booking = await prisma.booking.create({
    data: {
      rideId: data.rideId,
      passengerId,
      seatsBooked: data.seatsBooked,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      pickupAddress: data.pickupAddress,
      dropLat: data.dropLat,
      dropLng: data.dropLng,
      dropAddress: data.dropAddress,
      totalAmount,
      status: 'PENDING',
    },
    include: {
      ride: {
        include: {
          driver: true,
          vehicle: true,
        },
      },
      passenger: true,
    },
  });

  return booking;
};

export const acceptBooking = async (
  bookingId: string,
  driverId: string
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
      passenger: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.ride.driverId !== driverId) {
    throw new Error('You are not authorized to accept this booking');
  }

  if (booking.status !== 'PENDING') {
    throw new Error('Booking is not in pending state');
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'ACCEPTED' },
    include: {
      ride: {
        include: {
          driver: true,
          vehicle: true,
        },
      },
      passenger: true,
    },
  });
};

export const rejectBooking = async (
  bookingId: string,
  driverId: string
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.ride.driverId !== driverId) {
    throw new Error('You are not authorized to reject this booking');
  }

  if (booking.status !== 'PENDING') {
    throw new Error('Booking is not in pending state');
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'REJECTED' },
  });
};

export const cancelBooking = async (
  bookingId: string,
  userId: string
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.passengerId !== userId && booking.ride.driverId !== userId) {
    throw new Error('You are not authorized to cancel this booking');
  }

  if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
    throw new Error('Cannot cancel this booking');
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  });
};

export const checkInPassenger = async (
  bookingId: string,
  driverId: string
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.ride.driverId !== driverId) {
    throw new Error('You are not authorized to check in this passenger');
  }

  if (booking.status !== 'ACCEPTED') {
    throw new Error('Booking must be accepted before check-in');
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { actualPickupTime: new Date() },
  });
};

export const checkOutPassenger = async (
  bookingId: string,
  driverId: string
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.ride.driverId !== driverId) {
    throw new Error('You are not authorized to check out this passenger');
  }

  if (!booking.actualPickupTime) {
    throw new Error('Passenger must be checked in first');
  }

  const distance = getDistance(
    { latitude: booking.pickupLat, longitude: booking.pickupLng },
    { latitude: booking.dropLat, longitude: booking.dropLng }
  ) / 1000;

  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      actualDropTime: new Date(),
      distanceTravelled: distance,
      status: 'COMPLETED',
    },
  });
};

export const getPassengerBookings = async (
  passengerId: string,
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
): Promise<any[]> => {
  return await prisma.booking.findMany({
    where: {
      passengerId,
      ...(status && { status }),
    },
    include: {
      ride: {
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              rating: true,
            },
          },
          vehicle: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getDriverBookings = async (
  driverId: string,
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
): Promise<any[]> => {
  return await prisma.booking.findMany({
    where: {
      ride: { driverId },
      ...(status && { status }),
    },
    include: {
      passenger: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          rating: true,
        },
      },
      ride: {
        include: {
          vehicle: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const rateBooking = async (
  bookingId: string,
  userId: string,
  rating: number,
  review?: string
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      ride: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status !== 'COMPLETED') {
    throw new Error('Can only rate completed bookings');
  }

  const isPassenger = booking.passengerId === userId;
  const isDriver = booking.ride.driverId === userId;

  if (!isPassenger && !isDriver) {
    throw new Error('You are not authorized to rate this booking');
  }

  if (isPassenger) {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverRating: rating,
        driverReview: review,
      },
    });

    await prisma.rating.create({
      data: {
        bookingId,
        fromUserId: userId,
        toUserId: booking.ride.driverId,
        rating,
        review,
      },
    });

    await updateUserRating(booking.ride.driverId);

    return updated;
  } else {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        passengerRating: rating,
        passengerReview: review,
      },
    });

    await prisma.rating.create({
      data: {
        bookingId,
        fromUserId: userId,
        toUserId: booking.passengerId,
        rating,
        review,
      },
    });

    await updateUserRating(booking.passengerId);

    return updated;
  }
};

const updateUserRating = async (userId: string): Promise<void> => {
  const ratings = await prisma.rating.findMany({
    where: { toUserId: userId },
    select: { rating: true },
  });

  if (ratings.length === 0) return;

  const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  await prisma.user.update({
    where: { id: userId },
    data: { rating: avgRating },
  });
};
