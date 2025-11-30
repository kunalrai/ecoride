# Chat API Documentation

## Overview

EcoRide's Chat API enables real-time communication between drivers and passengers for coordinating carpooling rides. Each conversation is associated with a specific ride and includes support for text messages, images, location sharing, and system notifications.

## Features

- One-to-one chat between driver and passenger per ride
- Support for text, image, location, and system messages
- Real-time notifications on new messages
- Message read receipts
- Conversation history with pagination
- Unread message count
- Automatic conversation creation

## API Endpoints

All endpoints require authentication via JWT token.

### 1. Create or Get Conversation

Create a new conversation or retrieve an existing one for a ride.

**Endpoint:** `POST /api/chat/conversations`

**Request:**
```json
{
  "rideId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "id": "conv-123",
  "rideId": "550e8400-e29b-41d4-a716-446655440000",
  "driverId": "user-456",
  "passengerId": "user-789",
  "lastMessageAt": "2025-11-29T10:30:00.000Z",
  "createdAt": "2025-11-28T08:00:00.000Z",
  "updatedAt": "2025-11-29T10:30:00.000Z",
  "driver": {
    "id": "user-456",
    "name": "Rajesh Kumar",
    "profilePicture": "https://example.com/avatar1.jpg"
  },
  "passenger": {
    "id": "user-789",
    "name": "Priya Sharma",
    "profilePicture": "https://example.com/avatar2.jpg"
  },
  "ride": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "startAddress": "Koramangala, Bangalore",
    "endAddress": "Electronic City, Bangalore",
    "departureTime": "2025-11-30T09:00:00.000Z",
    "status": "SCHEDULED"
  }
}
```

**Notes:**
- Automatically creates conversation if it doesn't exist
- Returns existing conversation if already created
- One conversation per ride-passenger pair
- Cannot create conversation with yourself (driver)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rideId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### 2. Send Message

Send a message in a conversation.

**Endpoint:** `POST /api/chat/:conversationId/messages`

**Request:**
```json
{
  "content": "I'll be at the pickup point at 9 AM sharp!",
  "messageType": "TEXT",
  "mediaUrl": null
}
```

**Parameters:**
- `content` (required) - Message content (text or description for media)
- `messageType` (optional) - Type of message: `TEXT`, `IMAGE`, `LOCATION`, `SYSTEM`
- `mediaUrl` (optional) - URL for image or location data

**Response:**
```json
{
  "id": "msg-abc123",
  "conversationId": "conv-123",
  "senderId": "user-789",
  "content": "I'll be at the pickup point at 9 AM sharp!",
  "messageType": "TEXT",
  "mediaUrl": null,
  "isRead": false,
  "createdAt": "2025-11-29T10:30:00.000Z",
  "sender": {
    "id": "user-789",
    "name": "Priya Sharma",
    "profilePicture": "https://example.com/avatar2.jpg"
  }
}
```

**Message Types:**

1. **TEXT** - Regular text message
```json
{
  "content": "Running 5 minutes late",
  "messageType": "TEXT"
}
```

2. **IMAGE** - Image with optional caption
```json
{
  "content": "Photo of my car",
  "messageType": "IMAGE",
  "mediaUrl": "https://storage.example.com/images/car.jpg"
}
```

3. **LOCATION** - Shared location
```json
{
  "content": "My current location",
  "messageType": "LOCATION",
  "mediaUrl": "geo:12.9716,77.5946"
}
```

4. **SYSTEM** - Automated system message (use service method directly)

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/chat/conv-123/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I will be at the pickup point at 9 AM sharp!",
    "messageType": "TEXT"
  }'
```

### 3. Get Messages

Retrieve conversation messages with pagination.

**Endpoint:** `GET /api/chat/:conversationId/messages`

**Query Parameters:**
- `limit` (optional) - Number of messages to retrieve (1-100, default: 50)
- `before` (optional) - ISO date to fetch messages before this timestamp

**Request:**
```
GET /api/chat/conv-123/messages?limit=20&before=2025-11-29T10:00:00.000Z
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-001",
      "conversationId": "conv-123",
      "senderId": "user-456",
      "content": "Hi! I'll pick you up at 9 AM",
      "messageType": "TEXT",
      "mediaUrl": null,
      "isRead": true,
      "createdAt": "2025-11-29T08:00:00.000Z",
      "sender": {
        "id": "user-456",
        "name": "Rajesh Kumar",
        "profilePicture": "https://example.com/avatar1.jpg"
      }
    },
    {
      "id": "msg-002",
      "conversationId": "conv-123",
      "senderId": "user-789",
      "content": "Great! I'll be ready",
      "messageType": "TEXT",
      "mediaUrl": null,
      "isRead": true,
      "createdAt": "2025-11-29T08:05:00.000Z",
      "sender": {
        "id": "user-789",
        "name": "Priya Sharma",
        "profilePicture": "https://example.com/avatar2.jpg"
      }
    }
  ]
}
```

**Notes:**
- Messages are returned in chronological order (oldest first)
- Use `before` parameter for pagination (fetch older messages)
- Default limit is 50 messages

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/chat/conv-123/messages?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Mark Messages as Read

Mark all unread messages in a conversation as read.

**Endpoint:** `PUT /api/chat/:conversationId/read`

**Response:**
```json
{
  "markedAsRead": 5
}
```

**Notes:**
- Marks all messages sent by the other user as read
- Returns count of messages marked
- Automatically called when user opens conversation

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/chat/conv-123/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get User Conversations

Get all conversations for the authenticated user.

**Endpoint:** `GET /api/chat/conversations`

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv-123",
      "rideId": "550e8400-e29b-41d4-a716-446655440000",
      "driverId": "user-456",
      "passengerId": "user-789",
      "lastMessageAt": "2025-11-29T10:30:00.000Z",
      "createdAt": "2025-11-28T08:00:00.000Z",
      "updatedAt": "2025-11-29T10:30:00.000Z",
      "driver": {
        "id": "user-456",
        "name": "Rajesh Kumar",
        "profilePicture": "https://example.com/avatar1.jpg"
      },
      "passenger": {
        "id": "user-789",
        "name": "Priya Sharma",
        "profilePicture": "https://example.com/avatar2.jpg"
      },
      "ride": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "startAddress": "Koramangala, Bangalore",
        "endAddress": "Electronic City, Bangalore",
        "departureTime": "2025-11-30T09:00:00.000Z",
        "status": "SCHEDULED"
      },
      "lastMessage": {
        "id": "msg-abc123",
        "content": "I'll be at the pickup point at 9 AM sharp!",
        "messageType": "TEXT",
        "senderId": "user-789",
        "isRead": false,
        "createdAt": "2025-11-29T10:30:00.000Z"
      },
      "unreadCount": 3,
      "otherUser": {
        "id": "user-456",
        "name": "Rajesh Kumar",
        "profilePicture": "https://example.com/avatar1.jpg"
      }
    }
  ]
}
```

**Notes:**
- Returns conversations sorted by most recent activity
- Includes last message preview
- Shows unread message count per conversation
- `otherUser` is the person you're chatting with (driver or passenger)

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get Unread Message Count

Get total unread message count across all conversations.

**Endpoint:** `GET /api/chat/unread-count`

**Response:**
```json
{
  "unreadCount": 12
}
```

**Notes:**
- Count of all unread messages from all conversations
- Useful for showing notification badge

**cURL Example:**
```bash
curl -X GET http://localhost:5000/api/chat/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Delete Conversation

Delete a conversation (only if you're part of it).

**Endpoint:** `DELETE /api/chat/:conversationId`

**Response:**
```json
{
  "message": "Conversation deleted successfully"
}
```

**Notes:**
- Only driver or passenger can delete the conversation
- Deletes all messages in the conversation
- Cannot be undone

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/chat/conv-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration

### React Example

```tsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('authToken');

// 1. Create or get conversation
const getConversation = async (rideId: string) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/chat/conversations`,
      { rideId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// 2. Send message
const sendMessage = async (
  conversationId: string,
  content: string,
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION' = 'TEXT',
  mediaUrl?: string
) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/chat/${conversationId}/messages`,
      { content, messageType, mediaUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// 3. Get messages
const getMessages = async (
  conversationId: string,
  limit: number = 50,
  before?: string
) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);

    const { data } = await axios.get(
      `${API_BASE_URL}/chat/${conversationId}/messages?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.messages;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// 4. Mark as read
const markAsRead = async (conversationId: string) => {
  try {
    const { data } = await axios.put(
      `${API_BASE_URL}/chat/${conversationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.markedAsRead;
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
};

// 5. Get all conversations
const getConversations = async () => {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/chat/conversations`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.conversations;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// 6. Get unread count
const getUnreadCount = async () => {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/chat/unread-count`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.unreadCount;
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
};
```

### Chat Component Example

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM';
  senderId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

function ChatWindow({ conversationId, currentUserId }: {
  conversationId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const { data } = await axios.get(
        `/api/chat/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put(
        `/api/chat/${conversationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/chat/${conversationId}/messages`,
        { content: newMessage, messageType: 'TEXT' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
          >
            <div className="message-avatar">
              <img src={msg.sender.profilePicture || '/default-avatar.png'} alt={msg.sender.name} />
            </div>
            <div className="message-content">
              <div className="message-sender">{msg.sender.name}</div>
              <div className="message-text">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

## Use Cases

### 1. Ride Coordination
- Driver and passenger can confirm pickup details
- Share exact location in real-time
- Communicate about delays or changes

### 2. Before Ride
- Discuss specific pickup points
- Share vehicle details and identification
- Coordinate timing adjustments

### 3. During Ride
- Share current location
- Notify about arrival
- Handle any issues

### 4. After Ride
- Thank each other
- Discuss any feedback
- System messages about ratings

## Security

### Authorization
- Only conversation participants (driver and passenger) can access messages
- Cannot create conversation with yourself
- JWT authentication required for all endpoints
- Each request validates user is part of the conversation

### Privacy
- Messages are private between driver and passenger
- No third-party access
- Conversations tied to specific rides
- Can delete entire conversation history

## Notifications

When a message is sent, the recipient automatically receives a push notification:

```json
{
  "title": "New message from Rajesh Kumar",
  "body": "I'll pick you up at 9 AM",
  "type": "OTHER",
  "data": {
    "type": "chat_message",
    "conversationId": "conv-123",
    "messageId": "msg-abc123",
    "senderId": "user-456"
  }
}
```

## Error Handling

### Common Errors

**Conversation not found:**
```json
{
  "error": "Conversation not found"
}
```

**Not part of conversation:**
```json
{
  "error": "You are not part of this conversation"
}
```

**Cannot message yourself:**
```json
{
  "error": "Cannot create conversation with yourself"
}
```

**Ride not found:**
```json
{
  "error": "Ride not found"
}
```

## Rate Limiting

Chat endpoints use the same rate limiting as other API endpoints:
- 100 requests per 15 minutes per IP address

## Best Practices

### 1. Message Polling
Instead of continuous polling, implement smart polling:
- Poll every 3-5 seconds when chat is active
- Stop polling when user leaves chat
- Use WebSocket for real-time updates (future enhancement)

### 2. Pagination
Load messages in batches:
- Initial load: 50 most recent messages
- Scroll up to load older messages using `before` parameter
- Keep total loaded messages reasonable

### 3. Read Receipts
Mark messages as read when:
- User opens the conversation
- User scrolls to view messages
- App is in foreground with conversation open

### 4. Caching
Cache conversations list:
- Update when new message arrives
- Refresh periodically
- Update unread count in real-time

### 5. Image Messages
For image messages:
1. Upload image to cloud storage first
2. Get public URL
3. Send message with `messageType: 'IMAGE'` and `mediaUrl`

### 6. Location Sharing
For location messages:
1. Get user's current location
2. Format as geo URI: `geo:latitude,longitude`
3. Send with `messageType: 'LOCATION'`

## Future Enhancements

- WebSocket support for real-time messaging
- Typing indicators
- Message delivery status (sent, delivered, read)
- Voice messages
- File attachments
- Group chats for shared rides
- Message reactions
- Reply to specific messages
- Message search

## Testing

```bash
# Get auth token
TOKEN="your-jwt-token"
RIDE_ID="550e8400-e29b-41d4-a716-446655440000"

# Create conversation
CONV_RESPONSE=$(curl -X POST http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rideId\": \"$RIDE_ID\"}")

CONV_ID=$(echo $CONV_RESPONSE | jq -r '.id')

# Send message
curl -X POST http://localhost:5000/api/chat/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! Looking forward to the ride.",
    "messageType": "TEXT"
  }'

# Get messages
curl -X GET http://localhost:5000/api/chat/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN"

# Mark as read
curl -X PUT http://localhost:5000/api/chat/$CONV_ID/read \
  -H "Authorization: Bearer $TOKEN"

# Get all conversations
curl -X GET http://localhost:5000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN"

# Get unread count
curl -X GET http://localhost:5000/api/chat/unread-count \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

All chat operations are logged via Winston:

```
INFO: Conversation created: conv-123 for ride 550e8400-e29b-41d4-a716-446655440000
INFO: Message sent in conversation conv-123
```

Check logs:
```bash
tail -f logs/combined.log | grep "Conversation\|Message"
```

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Real-time Support**: Coming Soon (WebSocket)
