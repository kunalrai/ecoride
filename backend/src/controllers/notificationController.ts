import { Response } from 'express';
import { AuthRequest } from '../types';
import * as notificationService from '../services/notificationService';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const notifications = await notificationService.getUserNotifications(
      req.user!.userId,
      limit,
      offset
    );
    res.status(200).json(notifications);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markNotificationAsRead(
      notificationId,
      req.user!.userId
    );
    res.status(200).json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await notificationService.markAllNotificationsAsRead(req.user!.userId);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await notificationService.getUnreadNotificationCount(req.user!.userId);
    res.status(200).json({ count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
