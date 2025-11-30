import { Response } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/authService';
import * as vehicleService from '../services/vehicleService';

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, name } = req.body;
    await authService.signupWithPhone(phone, name);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifySignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, name, otp } = req.body;
    const result = await authService.verifyPhoneAndCreateUser(phone, name, otp);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    await authService.loginWithPhone(phone);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyLoginOTP(phone, otp);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await authService.getUserProfile(req.user!.userId);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await authService.updateProfile(req.user!.userId, req.body);
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await vehicleService.addVehicle(req.user!.userId, req.body);
    res.status(201).json(vehicle);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getVehicles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicles = await vehicleService.getUserVehicles(req.user!.userId);
    res.status(200).json(vehicles);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await vehicleService.updateVehicle(vehicleId, req.user!.userId, req.body);
    res.status(200).json(vehicle);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vehicleId } = req.params;
    await vehicleService.deleteVehicle(vehicleId, req.user!.userId);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
