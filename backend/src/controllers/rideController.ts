import { Response } from 'express';
import { AuthRequest } from '../types';
import * as rideService from '../services/rideService';

export const createRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ride = await rideService.createRide(req.user!.userId, req.body);
    res.status(201).json(ride);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.updateRide(rideId, req.user!.userId, req.body);
    res.status(200).json(ride);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.params;
    const result = await rideService.cancelRide(rideId, req.user!.userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const rides = await rideService.getDriverRides(
      req.user!.userId,
      status as any
    );
    res.status(200).json(rides);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRideDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.getRideDetails(rideId);
    res.status(200).json(ride);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const startRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.startRide(rideId, req.user!.userId);
    res.status(200).json(ride);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const completeRide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rideId } = req.params;
    const ride = await rideService.completeRide(rideId, req.user!.userId);
    res.status(200).json(ride);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
