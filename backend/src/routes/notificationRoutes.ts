import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);

router.get('/unread-count', authenticate, notificationController.getUnreadCount);

router.put('/:notificationId/read', authenticate, notificationController.markAsRead);

router.put('/mark-all-read', authenticate, notificationController.markAllAsRead);

export default router;
