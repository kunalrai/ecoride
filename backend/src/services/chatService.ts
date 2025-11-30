import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import * as notificationService from './notificationService';

export const getOrCreateConversation = async (
  rideId: string,
  passengerId: string
): Promise<any> => {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { driverId: true },
  });

  if (!ride) {
    throw new Error('Ride not found');
  }

  if (ride.driverId === passengerId) {
    throw new Error('Cannot create conversation with yourself');
  }

  let conversation = await prisma.conversation.findUnique({
    where: {
      rideId_passengerId: {
        rideId,
        passengerId,
      },
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      passenger: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      ride: {
        select: {
          id: true,
          startAddress: true,
          endAddress: true,
          departureTime: true,
          status: true,
        },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        rideId,
        driverId: ride.driverId,
        passengerId,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        passenger: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        ride: {
          select: {
            id: true,
            startAddress: true,
            endAddress: true,
            departureTime: true,
            status: true,
          },
        },
      },
    });

    logger.info(
      `Conversation created: ${conversation.id} for ride ${rideId}`
    );
  }

  return conversation;
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM' = 'TEXT',
  mediaUrl?: string
): Promise<any> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      driver: true,
      passenger: true,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (
    senderId !== conversation.driverId &&
    senderId !== conversation.passengerId
  ) {
    throw new Error('You are not part of this conversation');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      messageType,
      mediaUrl,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  const recipientId =
    senderId === conversation.driverId
      ? conversation.passengerId
      : conversation.driverId;

  const sender =
    senderId === conversation.driverId
      ? conversation.driver
      : conversation.passenger;

  await notificationService.createNotification(
    recipientId,
    `New message from ${sender.name}`,
    content.substring(0, 100),
    'OTHER',
    {
      type: 'chat_message',
      conversationId,
      messageId: message.id,
      senderId,
    }
  );

  logger.info(`Message sent in conversation ${conversationId}`);

  return message;
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  limit: number = 50,
  before?: string
): Promise<any[]> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (
    userId !== conversation.driverId &&
    userId !== conversation.passengerId
  ) {
    throw new Error('You are not part of this conversation');
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(before && {
        createdAt: {
          lt: new Date(before),
        },
      }),
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return messages.reverse();
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<number> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (
    userId !== conversation.driverId &&
    userId !== conversation.passengerId
  ) {
    throw new Error('You are not part of this conversation');
  }

  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return result.count;
};

export const getUserConversations = async (
  userId: string
): Promise<any[]> => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ driverId: userId }, { passengerId: userId }],
    },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      passenger: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      ride: {
        select: {
          id: true,
          startAddress: true,
          endAddress: true,
          departureTime: true,
          status: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          content: true,
          messageType: true,
          senderId: true,
          isRead: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: userId },
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: {
      lastMessageAt: 'desc',
    },
  });

  return conversations.map((conv) => ({
    ...conv,
    lastMessage: conv.messages[0] || null,
    unreadCount: conv._count.messages,
    otherUser:
      userId === conv.driverId ? conv.passenger : conv.driver,
  }));
};

export const getUnreadMessageCount = async (
  userId: string
): Promise<number> => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ driverId: userId }, { passengerId: userId }],
    },
    select: {
      id: true,
    },
  });

  const conversationIds = conversations.map((c) => c.id);

  const count = await prisma.message.count({
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: userId },
      isRead: false,
    },
  });

  return count;
};

export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  if (
    userId !== conversation.driverId &&
    userId !== conversation.passengerId
  ) {
    throw new Error('You are not authorized to delete this conversation');
  }

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  logger.info(`Conversation deleted: ${conversationId}`);
};

export const sendSystemMessage = async (
  conversationId: string,
  content: string
): Promise<any> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: conversation.driverId,
      content,
      messageType: 'SYSTEM',
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  return message;
};
