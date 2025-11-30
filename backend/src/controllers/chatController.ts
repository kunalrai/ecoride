import { Response } from 'express';
import { AuthRequest } from '../types';
import * as chatService from '../services/chatService';

export const createOrGetConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { rideId } = req.body;
    const passengerId = req.user!.userId;

    const conversation = await chatService.getOrCreateConversation(
      rideId,
      passengerId
    );

    res.status(200).json(conversation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content, messageType, mediaUrl } = req.body;
    const senderId = req.user!.userId;

    const message = await chatService.sendMessage(
      conversationId,
      senderId,
      content,
      messageType,
      mediaUrl
    );

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;
    const { limit, before } = req.query;

    const messages = await chatService.getConversationMessages(
      conversationId,
      userId,
      limit ? parseInt(limit as string) : 50,
      before as string
    );

    res.status(200).json({ messages });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;

    const count = await chatService.markMessagesAsRead(conversationId, userId);

    res.status(200).json({ markedAsRead: count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const conversations = await chatService.getUserConversations(userId);

    res.status(200).json({ conversations });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const count = await chatService.getUnreadMessageCount(userId);

    res.status(200).json({ unreadCount: count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.userId;

    await chatService.deleteConversation(conversationId, userId);

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
