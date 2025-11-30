import { prisma } from '../config/database';

export const addVehicle = async (
  userId: string,
  data: {
    vehicleType: 'CAR' | 'BIKE';
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate: string;
    seats: number;
  }
): Promise<any> => {
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { licensePlate: data.licensePlate },
  });

  if (existingVehicle) {
    throw new Error('Vehicle with this license plate already exists');
  }

  return await prisma.vehicle.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getUserVehicles = async (userId: string): Promise<any[]> => {
  return await prisma.vehicle.findMany({
    where: { userId },
  });
};

export const updateVehicle = async (
  vehicleId: string,
  userId: string,
  data: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    seats?: number;
    isVerified?: boolean;
  }
): Promise<any> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  return await prisma.vehicle.update({
    where: { id: vehicleId },
    data,
  });
};

export const deleteVehicle = async (vehicleId: string, userId: string): Promise<void> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  await prisma.vehicle.delete({
    where: { id: vehicleId },
  });
};
