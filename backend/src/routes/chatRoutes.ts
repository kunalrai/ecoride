import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as chatController from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();

router.post(
  '/conversations',
  authenticate,
  validate([body('rideId').notEmpty().withMessage('Ride ID is required')]),
  chatController.createOrGetConversation
);

router.post(
  '/:conversationId/messages',
  authenticate,
  validate([
    param('conversationId').notEmpty().withMessage('Conversation ID is required'),
    body('content').notEmpty().withMessage('Message content is required'),
    body('messageType')
      .optional()
      .isIn(['TEXT', 'IMAGE', 'LOCATION', 'SYSTEM'])
      .withMessage('Invalid message type'),
    body('mediaUrl').optional().isURL().withMessage('Invalid media URL'),
  ]),
  chatController.sendMessage
);

router.get(
  '/:conversationId/messages',
  authenticate,
  validate([
    param('conversationId').notEmpty().withMessage('Conversation ID is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('before').optional().isISO8601().withMessage('Invalid before date'),
  ]),
  chatController.getMessages
);

router.put(
  '/:conversationId/read',
  authenticate,
  validate([
    param('conversationId').notEmpty().withMessage('Conversation ID is required'),
  ]),
  chatController.markAsRead
);

router.get(
  '/conversations',
  authenticate,
  chatController.getUserConversations
);

router.get(
  '/unread-count',
  authenticate,
  chatController.getUnreadCount
);

router.delete(
  '/:conversationId',
  authenticate,
  validate([
    param('conversationId').notEmpty().withMessage('Conversation ID is required'),
  ]),
  chatController.deleteConversation
);

export default router;
