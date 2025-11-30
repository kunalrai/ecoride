# EcoRide Backend API

Comprehensive backend API for the EcoRide carpooling application with PostgreSQL and Prisma ORM.

## Features

### 1. Auth & User Service
- User signup/login via phone (OTP) or email
- Profile management (name, company, verification flags)
- Vehicle management (car/bike details, seats)
- User ratings and ride statistics

### 2. Carpool Ride Service
- Create/update/cancel rides (driver)
- Search rides (passenger)
- Recurring rides (daily office commute)
- Ride status: SCHEDULED, ONGOING, COMPLETED, CANCELLED

### 3. Matching & Recommendations Service
- Match drivers and passengers by:
  - Route overlap (polyline/geohash)
  - Time window
  - Max deviation
  - Rating, same company, gender filters

### 4. Booking & Trip Service
- Passenger send join requests
- Driver accept/reject
- Check-in/check-out
- Trip distance & cost calculation
- Ratings after trip

### 5. Wallet & Points Service
- User wallet (currency + points)
- Load money via Razorpay
- Deduct points from passenger, credit to driver
- Redeem points
- Transaction logs

### 6. Notification Service
- Push notifications (ride matched, request, reminders)
- Email/SMS for OTP, alerts
- In-app notification history

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Payment**: Razorpay
- **Notifications**: Firebase Cloud Messaging
- **SMS**: Twilio
- **Email**: Nodemailer

## Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
- Database connection string
- JWT secret
- Twilio credentials
- SMTP credentials
- Firebase credentials
- Stripe keys

3. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE ecoride;
```

2. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

3. (Optional) Open Prisma Studio to view/edit data:
```bash
npm run prisma:studio
```

## API Endpoints

### Auth & User

- `POST /api/auth/signup` - Send OTP for signup
- `POST /api/auth/verify-signup` - Verify OTP and create user
- `POST /api/auth/login` - Send OTP for login
- `POST /api/auth/verify-login` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/vehicles` - Add vehicle
- `GET /api/auth/vehicles` - Get user vehicles
- `PUT /api/auth/vehicles/:vehicleId` - Update vehicle
- `DELETE /api/auth/vehicles/:vehicleId` - Delete vehicle

### Rides

- `POST /api/rides` - Create ride
- `GET /api/rides` - Get my rides
- `GET /api/rides/:rideId` - Get ride details
- `PUT /api/rides/:rideId` - Update ride
- `POST /api/rides/:rideId/cancel` - Cancel ride
- `POST /api/rides/:rideId/start` - Start ride
- `POST /api/rides/:rideId/complete` - Complete ride

### Bookings

- `POST /api/bookings/search` - Search available rides
- `GET /api/bookings/recommended` - Get recommended rides
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get passenger bookings
- `GET /api/bookings/driver-bookings` - Get driver bookings
- `POST /api/bookings/:bookingId/accept` - Accept booking
- `POST /api/bookings/:bookingId/reject` - Reject booking
- `POST /api/bookings/:bookingId/cancel` - Cancel booking
- `POST /api/bookings/:bookingId/check-in` - Check-in passenger
- `POST /api/bookings/:bookingId/check-out` - Check-out passenger
- `POST /api/bookings/:bookingId/rate` - Rate booking

### Wallet

- `GET /api/wallet` - Get wallet details
- `POST /api/wallet/load` - Load wallet
- `POST /api/wallet/redeem` - Redeem points
- `GET /api/wallet/transactions` - Get transaction history

### Notifications

- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment to production:
```bash
export NODE_ENV=production
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Start the server:
```bash
npm start
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.ts        # Database connection
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Key Features Implementation

### Geohashing for Route Matching
The system uses geohashes to efficiently match rides. Routes are encoded into geohashes, and nearby rides are found by querying overlapping geohash cells.

### OTP Authentication
Phone and email verification using time-limited OTPs stored in the database with automatic expiration.

### Points System
Users earn points for every rupee spent. Points can be redeemed for rewards or used to get discounts on rides.

### Real-time Notifications
Push notifications via Firebase for ride updates, booking requests, and payment confirmations.

### Recurring Rides
Support for daily, weekday, weekend, and custom recurring ride schedules for regular commutes.

## License

MIT
