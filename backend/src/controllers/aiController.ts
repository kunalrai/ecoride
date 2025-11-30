import { Response } from 'express';
import { AuthRequest } from '../types';
import * as geminiService from '../services/geminiService';

export const generateRideDescription = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { origin, destination, date } = req.body;
    const description = await geminiService.generateRideDescription(
      origin,
      destination,
      date
    );
    res.status(200).json({ description });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRouteInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { origin, destination } = req.body;
    const insights = await geminiService.getRouteInsights(origin, destination);
    res.status(200).json({ insights });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const askAssistant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { history, message } = req.body;
    const response = await geminiService.askAiAssistant(history || [], message);
    res.status(200).json({ response });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const suggestMeetingPoints = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { origin, destination } = req.body;
    const meetingPoints = await geminiService.suggestMeetingPoints(
      origin,
      destination
    );
    res.status(200).json({ meetingPoints });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
