import { prisma } from '../config/database';
import { getGeohashesInRadius } from '../utils/geohash';
import { getDistance } from 'geolib';

export const searchRides = async (
  passengerId: string,
  searchParams: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    departureTime: Date;
    seats?: number;
    maxDeviationKm?: number;
    timeWindowMinutes?: number;
    sameCompanyOnly?: boolean;
    genderPreference?: 'MALE' | 'FEMALE' | 'ANY';
  }
): Promise<any[]> => {
  const {
    startLat,
    startLng,
    endLat,
    endLng,
    departureTime,
    seats = 1,
    maxDeviationKm = 5,
    timeWindowMinutes = 30,
    sameCompanyOnly = false,
    genderPreference,
  } = searchParams;

  const passenger = await prisma.user.findUnique({
    where: { id: passengerId },
  });

  if (!passenger) {
    throw new Error('Passenger not found');
  }

  const startGeohashes = getGeohashesInRadius(startLat, startLng, maxDeviationKm);
  const endGeohashes = getGeohashesInRadius(endLat, endLng, maxDeviationKm);

  const timeStart = new Date(departureTime.getTime() - timeWindowMinutes * 60 * 1000);
  const timeEnd = new Date(departureTime.getTime() + timeWindowMinutes * 60 * 1000);

  let whereClause: any = {
    status: 'SCHEDULED',
    departureTime: {
      gte: timeStart,
      lte: timeEnd,
    },
    availableSeats: {
      gte: seats,
    },
    geohashes: {
      hasSome: [...startGeohashes, ...endGeohashes],
    },
  };

  if (sameCompanyOnly && passenger.company) {
    whereClause.driver = {
      company: passenger.company,
    };
  }

  if (genderPreference && genderPreference !== 'ANY') {
    whereClause.driver = {
      ...whereClause.driver,
      gender: genderPreference,
    };
  }

  const rides = await prisma.ride.findMany({
    where: whereClause,
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          rating: true,
          totalRidesAsDriver: true,
          company: true,
          gender: true,
        },
      },
      vehicle: true,
      bookings: {
        where: { status: 'ACCEPTED' },
        select: { seatsBooked: true },
      },
    },
  });

  const matchedRides = rides
    .map(ride => {
      const startDistance = getDistance(
        { latitude: startLat, longitude: startLng },
        { latitude: ride.startLat, longitude: ride.startLng }
      ) / 1000;

      const endDistance = getDistance(
        { latitude: endLat, longitude: endLng },
        { latitude: ride.endLat, longitude: ride.endLng }
      ) / 1000;

      const totalDeviation = startDistance + endDistance;

      if (totalDeviation > maxDeviationKm * 2) {
        return null;
      }

      const bookedSeats = ride.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
      const actualAvailableSeats = ride.availableSeats - bookedSeats;

      if (actualAvailableSeats < seats) {
        return null;
      }

      const matchScore = calculateMatchScore(
        ride,
        passenger,
        startDistance,
        endDistance,
        Math.abs(ride.departureTime.getTime() - departureTime.getTime()) / 60000
      );

      return {
        ...ride,
        startDistance,
        endDistance,
        totalDeviation,
        actualAvailableSeats,
        matchScore,
      };
    })
    .filter(ride => ride !== null)
    .sort((a, b) => b!.matchScore - a!.matchScore);

  return matchedRides as any[];
};

const calculateMatchScore = (
  ride: any,
  passenger: any,
  startDistance: number,
  endDistance: number,
  timeDiffMinutes: number
): number => {
  let score = 100;

  score -= startDistance * 5;
  score -= endDistance * 5;
  score -= timeDiffMinutes * 0.5;

  score += ride.driver.rating * 10;

  if (ride.driver.company === passenger.company) {
    score += 15;
  }

  if (ride.driver.totalRidesAsDriver > 50) {
    score += 10;
  } else if (ride.driver.totalRidesAsDriver > 20) {
    score += 5;
  }

  return Math.max(0, score);
};

export const getRecommendedRides = async (
  passengerId: string,
  limit: number = 10
): Promise<any[]> => {
  const passenger = await prisma.user.findUnique({
    where: { id: passengerId },
    include: {
      bookingsAsPassenger: {
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          ride: true,
        },
      },
    },
  });

  if (!passenger || passenger.bookingsAsPassenger.length === 0) {
    return await prisma.ride.findMany({
      where: {
        status: 'SCHEDULED',
        departureTime: { gte: new Date() },
      },
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
      },
      orderBy: [{ driver: { rating: 'desc' } }, { departureTime: 'asc' }],
      take: limit,
    });
  }

  const pastBookings = passenger.bookingsAsPassenger;
  const avgStartLat = pastBookings.reduce((sum, b) => sum + b.pickupLat, 0) / pastBookings.length;
  const avgStartLng = pastBookings.reduce((sum, b) => sum + b.pickupLng, 0) / pastBookings.length;

  const geohashes = getGeohashesInRadius(avgStartLat, avgStartLng, 10);

  return await prisma.ride.findMany({
    where: {
      status: 'SCHEDULED',
      departureTime: { gte: new Date() },
      geohashes: { hasSome: geohashes },
    },
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
    },
    orderBy: [{ driver: { rating: 'desc' } }, { departureTime: 'asc' }],
    take: limit,
  });
};
