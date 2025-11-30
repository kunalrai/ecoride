import { Response } from 'express';
import { AuthRequest } from '../types';
import * as bookingService from '../services/bookingService';
import * as matchingService from '../services/matchingService';

export const searchRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rides = await matchingService.searchRides(req.user!.userId, req.body);
    res.status(200).json(rides);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRecommendedRides = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const rides = await matchingService.getRecommendedRides(req.user!.userId, limit);
    res.status(200).json(rides);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await bookingService.createBooking(req.user!.userId, req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.acceptBooking(bookingId, req.user!.userId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.rejectBooking(bookingId, req.user!.userId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.cancelBooking(bookingId, req.user!.userId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.checkInPassenger(bookingId, req.user!.userId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.checkOutPassenger(bookingId, req.user!.userId);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const bookings = await bookingService.getPassengerBookings(
      req.user!.userId,
      status as any
    );
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getDriverBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const bookings = await bookingService.getDriverBookings(
      req.user!.userId,
      status as any
    );
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { rating, review } = req.body;
    const result = await bookingService.rateBooking(
      bookingId,
      req.user!.userId,
      rating,
      review
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
