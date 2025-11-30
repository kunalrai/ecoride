# EcoRide API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ]
}
```

## API Endpoints

### 1. Authentication & User Management

#### Signup - Send OTP
```http
POST /auth/signup
Content-Type: application/json

{
  "phone": "+919876543210",
  "name": "John Doe"
}
```

Response:
```json
{
  "message": "OTP sent successfully"
}
```

#### Verify Signup
```http
POST /auth/verify-signup
Content-Type: application/json

{
  "phone": "+919876543210",
  "name": "John Doe",
  "otp": "123456"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+919876543210",
    "rating": 5.0
  },
  "token": "jwt_token_here"
}
```

#### Login - Send OTP
```http
POST /auth/login
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

#### Verify Login
```http
POST /auth/verify-login
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "+919876543210",
  "email": "john@example.com",
  "company": "TechCorp",
  "rating": 4.8,
  "totalRides": 45,
  "vehicles": [],
  "wallet": {
    "balance": 500,
    "points": 1200
  }
}
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "company": "TechCorp",
  "gender": "MALE"
}
```

#### Add Vehicle
```http
POST /auth/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleType": "CAR",
  "make": "Honda",
  "model": "City",
  "year": 2020,
  "color": "White",
  "licensePlate": "MH12AB1234",
  "seats": 4
}
```

### 2. Ride Management

#### Create Ride
```http
POST /rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle_uuid",
  "startLat": 19.0760,
  "startLng": 72.8777,
  "startAddress": "Mumbai Central",
  "endLat": 18.5204,
  "endLng": 73.8567,
  "endAddress": "Pune Station",
  "polyline": "encoded_polyline_string",
  "departureTime": "2024-12-01T09:00:00Z",
  "availableSeats": 3,
  "pricePerSeat": 250,
  "isRecurring": false,
  "preferences": {
    "sameCompanyOnly": false,
    "genderPreference": "ANY",
    "smokingAllowed": false,
    "petsAllowed": false,
    "musicAllowed": true
  }
}
```

#### Get My Rides
```http
GET /rides?status=SCHEDULED
Authorization: Bearer <token>
```

Query Parameters:
- `status` (optional): SCHEDULED, ONGOING, COMPLETED, CANCELLED

#### Start Ride
```http
POST /rides/:rideId/start
Authorization: Bearer <token>
```

#### Complete Ride
```http
POST /rides/:rideId/complete
Authorization: Bearer <token>
```

#### Cancel Ride
```http
POST /rides/:rideId/cancel
Authorization: Bearer <token>
```

### 3. Booking & Search

#### Search Rides
```http
POST /bookings/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "startLat": 19.0760,
  "startLng": 72.8777,
  "endLat": 18.5204,
  "endLng": 73.8567,
  "departureTime": "2024-12-01T09:00:00Z",
  "seats": 2,
  "maxDeviationKm": 5,
  "timeWindowMinutes": 30,
  "sameCompanyOnly": false
}
```

Response:
```json
[
  {
    "id": "ride_uuid",
    "driver": {
      "name": "Jane Doe",
      "rating": 4.9,
      "totalRidesAsDriver": 120
    },
    "vehicle": {
      "make": "Toyota",
      "model": "Innova",
      "seats": 6
    },
    "departureTime": "2024-12-01T09:15:00Z",
    "pricePerSeat": 280,
    "actualAvailableSeats": 4,
    "startDistance": 2.3,
    "endDistance": 1.8,
    "matchScore": 92.5
  }
]
```

#### Get Recommended Rides
```http
GET /bookings/recommended?limit=10
Authorization: Bearer <token>
```

#### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "rideId": "ride_uuid",
  "seatsBooked": 2,
  "pickupLat": 19.0760,
  "pickupLng": 72.8777,
  "pickupAddress": "Near Mumbai Central",
  "dropLat": 18.5204,
  "dropLng": 73.8567,
  "dropAddress": "Pune Station"
}
```

#### Get My Bookings
```http
GET /bookings/my-bookings?status=PENDING
Authorization: Bearer <token>
```

#### Accept Booking (Driver)
```http
POST /bookings/:bookingId/accept
Authorization: Bearer <token>
```

#### Reject Booking (Driver)
```http
POST /bookings/:bookingId/reject
Authorization: Bearer <token>
```

#### Cancel Booking
```http
POST /bookings/:bookingId/cancel
Authorization: Bearer <token>
```

#### Check-in Passenger (Driver)
```http
POST /bookings/:bookingId/check-in
Authorization: Bearer <token>
```

#### Check-out Passenger (Driver)
```http
POST /bookings/:bookingId/check-out
Authorization: Bearer <token>
```

#### Rate Booking
```http
POST /bookings/:bookingId/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Great ride, very punctual!"
}
```

### 4. Wallet & Payments

#### Get Wallet
```http
GET /wallet
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "wallet_uuid",
  "userId": "user_uuid",
  "balance": 500,
  "points": 1200
}
```

#### Load Wallet
```http
POST /wallet/load
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "paymentMethodId": "pm_stripe_payment_method_id"
}
```

#### Redeem Points
```http
POST /wallet/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "points": 500,
  "rewardType": "Fuel Voucher"
}
```

#### Get Transaction History
```http
GET /wallet/transactions?limit=50&offset=0
Authorization: Bearer <token>
```

### 5. Notifications

#### Get Notifications
```http
GET /notifications?limit=50&offset=0
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "notification_uuid",
    "title": "Ride Matched!",
    "body": "We found a ride for you with Jane Doe",
    "type": "RIDE_MATCHED",
    "read": false,
    "createdAt": "2024-12-01T08:00:00Z"
  }
]
```

#### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
```

### 6. AI Features

#### Generate Ride Description
```http
POST /ai/generate-ride-description
Authorization: Bearer <token>
Content-Type: application/json

{
  "origin": "Koramangala, Bangalore",
  "destination": "Electronic City, Bangalore",
  "date": "2024-12-05"
}
```

Response:
```json
{
  "description": "Daily office commute via Hosur Road. AC ride, on-time departure at 8:30 AM."
}
```

#### Get Route Insights
```http
POST /ai/route-insights
Authorization: Bearer <token>
Content-Type: application/json

{
  "origin": "Indiranagar, Bangalore",
  "destination": "Whitefield, Bangalore"
}
```

Response:
```json
{
  "insights": "🚦 Avoid Outer Ring Road during peak hours\n🛣️ Old Airport Road is faster in evenings\n⏰ Best time: Before 8 AM"
}
```

#### Ask AI Assistant
```http
POST /ai/assistant
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How should I split toll charges?",
  "history": []
}
```

Response:
```json
{
  "response": "In Indian carpools, it's common to split toll charges equally among passengers..."
}
```

#### Suggest Meeting Points
```http
POST /ai/suggest-meeting-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "origin": "HSR Layout, Bangalore",
  "destination": "Marathahalli, Bangalore"
}
```

Response:
```json
{
  "meetingPoints": [
    "Silk Board Junction",
    "BTM Layout Metro Station",
    "Forum Mall, Koramangala"
  ]
}
```

**Note:** See [AI_API_DOCUMENTATION.md](AI_API_DOCUMENTATION.md) for detailed AI features documentation.

### 8. Chat & Messaging

#### Create or Get Conversation
```http
POST /chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "rideId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response:
```json
{
  "id": "conv-123",
  "rideId": "550e8400-e29b-41d4-a716-446655440000",
  "driverId": "user-456",
  "passengerId": "user-789",
  "lastMessageAt": "2025-11-29T10:30:00.000Z",
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
    "status": "SCHEDULED"
  }
}
```

#### Send Message
```http
POST /chat/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "I'll be at the pickup point at 9 AM sharp!",
  "messageType": "TEXT"
}
```

Message types: `TEXT`, `IMAGE`, `LOCATION`, `SYSTEM`

Response:
```json
{
  "id": "msg-abc123",
  "conversationId": "conv-123",
  "senderId": "user-789",
  "content": "I'll be at the pickup point at 9 AM sharp!",
  "messageType": "TEXT",
  "isRead": false,
  "createdAt": "2025-11-29T10:30:00.000Z",
  "sender": {
    "id": "user-789",
    "name": "Priya Sharma",
    "profilePicture": "https://example.com/avatar2.jpg"
  }
}
```

#### Get Messages
```http
GET /chat/:conversationId/messages?limit=50&before=2025-11-29T10:00:00.000Z
Authorization: Bearer <token>
```

Response:
```json
{
  "messages": [
    {
      "id": "msg-001",
      "content": "Hi! I'll pick you up at 9 AM",
      "messageType": "TEXT",
      "senderId": "user-456",
      "isRead": true,
      "createdAt": "2025-11-29T08:00:00.000Z",
      "sender": {
        "id": "user-456",
        "name": "Rajesh Kumar"
      }
    }
  ]
}
```

#### Mark Messages as Read
```http
PUT /chat/:conversationId/read
Authorization: Bearer <token>
```

Response:
```json
{
  "markedAsRead": 5
}
```

#### Get All Conversations
```http
GET /chat/conversations
Authorization: Bearer <token>
```

Response:
```json
{
  "conversations": [
    {
      "id": "conv-123",
      "lastMessageAt": "2025-11-29T10:30:00.000Z",
      "lastMessage": {
        "content": "I'll be there at 9 AM",
        "isRead": false
      },
      "unreadCount": 3,
      "otherUser": {
        "id": "user-456",
        "name": "Rajesh Kumar",
        "profilePicture": "https://example.com/avatar1.jpg"
      },
      "ride": {
        "startAddress": "Koramangala",
        "endAddress": "Electronic City"
      }
    }
  ]
}
```

#### Get Unread Message Count
```http
GET /chat/unread-count
Authorization: Bearer <token>
```

Response:
```json
{
  "unreadCount": 12
}
```

#### Delete Conversation
```http
DELETE /chat/:conversationId
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Conversation deleted successfully"
}
```

**Note:** See [CHAT_API_DOCUMENTATION.md](CHAT_API_DOCUMENTATION.md) for detailed chat features documentation.

## Error Codes

- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Invalid or missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate resource)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Applies to all `/api/*` endpoints

## WebSocket Events (Future Enhancement)

Real-time updates for:
- New booking requests
- Booking status changes
- Ride status updates
- Live location tracking

## Testing with cURL

Example cURL commands:

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","name":"John Doe"}'

# Login with token
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search rides
curl -X POST http://localhost:5000/api/bookings/search \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "startLat": 19.0760,
    "startLng": 72.8777,
    "endLat": 18.5204,
    "endLng": 73.8567,
    "departureTime": "2024-12-01T09:00:00Z",
    "seats": 2
  }'
```
