# Chat Service Implementation Guide

## Summary

The chat service has been successfully implemented to enable real-time communication between drivers and passengers. This service allows users to coordinate pickup details, share locations, and communicate throughout the carpooling experience.

## Database Schema Changes

### New Models Added

#### Conversation Model
**Purpose:** Represents a chat conversation between a driver and passenger for a specific ride.

```prisma
model Conversation {
  id            String    @id @default(uuid())
  rideId        String
  driverId      String
  passengerId   String
  lastMessageAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  ride          Ride      @relation(fields: [rideId], references: [id], onDelete: Cascade)
  driver        User      @relation("DriverConversations", fields: [driverId], references: [id], onDelete: Cascade)
  passenger     User      @relation("PassengerConversations", fields: [passengerId], references: [id], onDelete: Cascade)
  messages      Message[]

  @@unique([rideId, passengerId])
  @@index([driverId])
  @@index([passengerId])
  @@index([rideId])
}
```

**Key Features:**
- One conversation per ride-passenger pair
- Cascade delete when ride or users are deleted
- Indexed for efficient queries
- Tracks last message timestamp

#### Message Model
**Purpose:** Stores individual messages within conversations.

```prisma
model Message {
  id             String       @id @default(uuid())
  conversationId String
  senderId       String
  messageType    MessageType  @default(TEXT)
  content        String
  mediaUrl       String?
  isRead         Boolean      @default(false)
  createdAt      DateTime     @default(now())

  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User         @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}

enum MessageType {
  TEXT
  IMAGE
  LOCATION
  SYSTEM
}
```

**Message Types:**
- **TEXT** - Regular text messages
- **IMAGE** - Image messages with URL
- **LOCATION** - Shared location (geo URI)
- **SYSTEM** - Automated system messages

### Updated Models

#### User Model
Added chat-related relations:

```prisma
model User {
  // ... existing fields

  conversationsAsDriver    Conversation[] @relation("DriverConversations")
  conversationsAsPassenger Conversation[] @relation("PassengerConversations")
  sentMessages             Message[]      @relation("SentMessages")
}
```

#### Ride Model
Added conversation relation:

```prisma
model Ride {
  // ... existing fields

  conversations Conversation[]
}
```

## Backend Files Created

### 1. Service Layer

**File:** [src/services/chatService.ts](src/services/chatService.ts)

**Functions:**

#### `getOrCreateConversation()`
Creates or retrieves a conversation for a ride.

```typescript
export const getOrCreateConversation = async (
  rideId: string,
  passengerId: string
): Promise<any>
```

**Features:**
- Validates ride exists
- Prevents self-conversations
- Returns existing or creates new conversation
- Includes driver, passenger, and ride details

#### `sendMessage()`
Sends a message in a conversation.

```typescript
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM' = 'TEXT',
  mediaUrl?: string
): Promise<any>
```

**Features:**
- Validates sender is part of conversation
- Updates conversation timestamp
- Sends notification to recipient
- Supports all message types

#### `getConversationMessages()`
Retrieves message history with pagination.

```typescript
export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  limit: number = 50,
  before?: string
): Promise<any[]>
```

**Features:**
- Authorization check
- Pagination support
- Returns messages in chronological order
- Includes sender details

#### `markMessagesAsRead()`
Marks unread messages as read.

```typescript
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<number>
```

**Features:**
- Marks only messages from other user
- Returns count of marked messages
- Validates user access

#### `getUserConversations()`
Gets all conversations for a user.

```typescript
export const getUserConversations = async (
  userId: string
): Promise<any[]>
```

**Returns:**
- All conversations (as driver or passenger)
- Last message preview
- Unread message count per conversation
- Other user details
- Sorted by recent activity

#### `getUnreadMessageCount()`
Gets total unread messages across all conversations.

```typescript
export const getUnreadMessageCount = async (
  userId: string
): Promise<number>
```

#### `deleteConversation()`
Deletes a conversation and all messages.

```typescript
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<void>
```

#### `sendSystemMessage()`
Sends automated system messages.

```typescript
export const sendSystemMessage = async (
  conversationId: string,
  content: string
): Promise<any>
```

**Use Cases:**
- "Booking confirmed"
- "Ride started"
- "Ride completed - please rate"

### 2. Controller Layer

**File:** [src/controllers/chatController.ts](src/controllers/chatController.ts)

**Endpoints:**
- `createOrGetConversation()` - Create/get conversation
- `sendMessage()` - Send message
- `getMessages()` - Retrieve messages
- `markAsRead()` - Mark as read
- `getUserConversations()` - List conversations
- `getUnreadCount()` - Get unread count
- `deleteConversation()` - Delete conversation

**Features:**
- Request validation
- Error handling
- Authorization checks
- Proper HTTP status codes

### 3. Routes

**File:** [src/routes/chatRoutes.ts](src/routes/chatRoutes.ts)

**Routes:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/conversations` | Create or get conversation |
| POST | `/api/chat/:conversationId/messages` | Send message |
| GET | `/api/chat/:conversationId/messages` | Get messages |
| PUT | `/api/chat/:conversationId/read` | Mark as read |
| GET | `/api/chat/conversations` | List all conversations |
| GET | `/api/chat/unread-count` | Get unread count |
| DELETE | `/api/chat/:conversationId` | Delete conversation |

**All routes include:**
- JWT authentication
- Request validation
- Error handling

### 4. App Configuration

**File:** [src/app.ts](src/app.ts:44)

```typescript
import chatRoutes from './routes/chatRoutes';

app.use('/api/chat', chatRoutes);
```

## Migration Steps

### Step 1: Update Database Schema

```bash
cd backend

# The schema has already been updated in prisma/schema.prisma
# Run migration to create new tables

npx prisma migrate dev --name add-chat-models
```

This will create:
- `Conversation` table
- `Message` table
- Relations to `User` and `Ride` tables
- Necessary indexes

### Step 2: Install Dependencies

All required dependencies are already in package.json:
```bash
npm install
```

### Step 3: Start Backend

```bash
npm run dev
```

The chat endpoints will be available at `/api/chat/*`

## Frontend Integration

### Step 1: Create Chat Service

```typescript
// services/chatService.ts
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('authToken') || '';

export const chatAPI = {
  // Create or get conversation
  getConversation: async (rideId: string) => {
    const { data } = await axios.post(
      `${API_BASE}/chat/conversations`,
      { rideId },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data;
  },

  // Send message
  sendMessage: async (
    conversationId: string,
    content: string,
    messageType: 'TEXT' | 'IMAGE' | 'LOCATION' = 'TEXT',
    mediaUrl?: string
  ) => {
    const { data } = await axios.post(
      `${API_BASE}/chat/${conversationId}/messages`,
      { content, messageType, mediaUrl },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data;
  },

  // Get messages
  getMessages: async (conversationId: string, limit = 50, before?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);

    const { data } = await axios.get(
      `${API_BASE}/chat/${conversationId}/messages?${params}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data.messages;
  },

  // Mark as read
  markAsRead: async (conversationId: string) => {
    const { data } = await axios.put(
      `${API_BASE}/chat/${conversationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data.markedAsRead;
  },

  // Get all conversations
  getConversations: async () => {
    const { data } = await axios.get(
      `${API_BASE}/chat/conversations`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data.conversations;
  },

  // Get unread count
  getUnreadCount: async () => {
    const { data } = await axios.get(
      `${API_BASE}/chat/unread-count`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
    return data.unreadCount;
  },

  // Delete conversation
  deleteConversation: async (conversationId: string) => {
    await axios.delete(
      `${API_BASE}/chat/${conversationId}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  },
};
```

### Step 2: Create Chat Components

#### Conversations List Component

```tsx
// components/ConversationsList.tsx
import { useState, useEffect } from 'react';
import { chatAPI } from '../services/chatService';

export function ConversationsList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      loadConversations();
      loadUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    const data = await chatAPI.getConversations();
    setConversations(data);
  };

  const loadUnreadCount = async () => {
    const count = await chatAPI.getUnreadCount();
    setUnreadCount(count);
  };

  return (
    <div className="conversations-list">
      <div className="header">
        <h2>Messages</h2>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </div>

      {conversations.map((conv) => (
        <div
          key={conv.id}
          className="conversation-item"
          onClick={() => onSelectConversation(conv)}
        >
          <div className="avatar">
            <img
              src={conv.otherUser.profilePicture || '/default-avatar.png'}
              alt={conv.otherUser.name}
            />
          </div>

          <div className="details">
            <div className="name">{conv.otherUser.name}</div>
            <div className="route">
              {conv.ride.startAddress} → {conv.ride.endAddress}
            </div>
            {conv.lastMessage && (
              <div className="last-message">
                {conv.lastMessage.content}
              </div>
            )}
          </div>

          {conv.unreadCount > 0 && (
            <div className="unread-badge">{conv.unreadCount}</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### Chat Window Component

```tsx
// components/ChatWindow.tsx
import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/chatService';

export function ChatWindow({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    markAsRead();

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    const data = await chatAPI.getMessages(conversation.id);
    setMessages(data);
  };

  const markAsRead = async () => {
    await chatAPI.markAsRead(conversation.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const message = await chatAPI.sendMessage(
        conversation.id,
        newMessage,
        'TEXT'
      );
      setMessages([...messages, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={conversation.otherUser.profilePicture || '/default-avatar.png'}
          alt={conversation.otherUser.name}
        />
        <div>
          <div className="name">{conversation.otherUser.name}</div>
          <div className="route">
            {conversation.ride.startAddress} → {conversation.ride.endAddress}
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.senderId === currentUserId ? 'sent' : 'received'
            }`}
          >
            {msg.messageType === 'SYSTEM' ? (
              <div className="system-message">{msg.content}</div>
            ) : (
              <>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !newMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
```

### Step 3: Add to Ride Details Page

```tsx
// pages/RideDetails.tsx
import { useState } from 'react';
import { chatAPI } from '../services/chatService';
import { ChatWindow } from '../components/ChatWindow';

export function RideDetailsPage({ ride, currentUserId }) {
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState(null);

  const handleOpenChat = async () => {
    const conv = await chatAPI.getConversation(ride.id);
    setConversation(conv);
    setShowChat(true);
  };

  return (
    <div className="ride-details">
      {/* Ride details */}

      {/* Chat button for passengers */}
      {ride.driverId !== currentUserId && (
        <button onClick={handleOpenChat}>
          Message Driver
        </button>
      )}

      {/* Chat window */}
      {showChat && conversation && (
        <ChatWindow
          conversation={conversation}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
```

## Use Cases

### 1. Passenger Books a Ride
When a passenger books a ride, they can immediately start chatting with the driver:

```typescript
// After booking is confirmed
const conversation = await chatAPI.getConversation(rideId);
// Navigate to chat or open chat modal
```

### 2. Driver Sends Pickup Instructions
Driver can send a message about pickup location:

```typescript
await chatAPI.sendMessage(
  conversationId,
  "I'll be waiting at the north gate near the coffee shop",
  'TEXT'
);
```

### 3. Passenger Shares Live Location
Passenger can share their current location:

```typescript
const location = await getCurrentLocation();
await chatAPI.sendMessage(
  conversationId,
  "My current location",
  'LOCATION',
  `geo:${location.lat},${location.lng}`
);
```

### 4. System Notifications
System automatically sends messages at key points:

```typescript
// In booking service after ride starts
await chatService.sendSystemMessage(
  conversationId,
  "Ride has started. Enjoy your journey!"
);

// After ride completes
await chatService.sendSystemMessage(
  conversationId,
  "Ride completed. Please rate your experience."
);
```

## Security Features

### Authorization
- Only conversation participants can access messages
- JWT authentication required
- Cannot create conversation with yourself
- Each request validates user permissions

### Privacy
- Messages are private between driver and passenger
- Conversations tied to specific rides
- Can delete entire conversation
- No message editing (for transparency)

### Data Protection
- Cascade delete when ride/user is deleted
- Indexed queries for performance
- Rate limiting applies (100 req/15 min)

## Notifications

When a message is sent, the recipient receives a notification via the notification service:

```typescript
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
```

This triggers:
- Push notification (if FCM token exists)
- In-app notification
- Can trigger email/SMS based on user preferences

## Performance Considerations

### Polling vs WebSocket
Current implementation uses polling:
- Frontend polls every 3-5 seconds for new messages
- Simple to implement
- Works with existing infrastructure

Future enhancement: WebSocket for real-time updates
- Lower latency
- Reduced server load
- Better user experience

### Pagination
- Default limit: 50 messages
- Use `before` parameter for older messages
- Load more on scroll up

### Caching
Frontend should cache:
- Conversation list
- Messages per conversation
- Unread counts

### Indexing
Database indexes on:
- `conversationId` - fast message lookup
- `senderId` - user's sent messages
- `createdAt` - chronological ordering
- `driverId`, `passengerId`, `rideId` - conversation queries

## Testing

### Backend Tests

```bash
# Get JWT token first
TOKEN="your-jwt-token"
RIDE_ID="your-ride-id"

# 1. Create conversation
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rideId\": \"$RIDE_ID\"}"

# Save conversation ID from response
CONV_ID="conversation-id-from-response"

# 2. Send message
curl -X POST http://localhost:5000/api/chat/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! Looking forward to the ride.",
    "messageType": "TEXT"
  }'

# 3. Get messages
curl -X GET http://localhost:5000/api/chat/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN"

# 4. Mark as read
curl -X PUT http://localhost:5000/api/chat/$CONV_ID/read \
  -H "Authorization: Bearer $TOKEN"

# 5. Get all conversations
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN"

# 6. Get unread count
curl -X GET http://localhost:5000/api/chat/unread-count \
  -H "Authorization: Bearer $TOKEN"
```

## Documentation

- **Full API Docs**: [CHAT_API_DOCUMENTATION.md](CHAT_API_DOCUMENTATION.md)
- **Complete API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Future Enhancements

### Phase 2: Real-time Updates
- WebSocket integration
- Typing indicators
- Online/offline status
- Message delivery receipts

### Phase 3: Rich Media
- Voice messages
- File attachments
- Image compression
- Video messages

### Phase 4: Advanced Features
- Group chats for shared rides
- Message reactions
- Reply to specific messages
- Message search
- Chat export

### Phase 5: AI Integration
- Auto-translate messages
- Smart replies
- Spam detection
- Sentiment analysis

## Support

If you encounter issues:
1. Check logs: `tail -f logs/combined.log | grep "Conversation\|Message"`
2. Verify database migration: `npx prisma studio`
3. Test with cURL commands above
4. Check notification service is working

---

**Migration Status**: ✅ Complete
**Database Schema**: ✅ Updated
**Backend Service**: ✅ Implemented
**API Endpoints**: ✅ Ready
**Documentation**: ✅ Complete
**Frontend Integration**: 📋 Pending (Templates Provided)
