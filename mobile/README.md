# EcoRide Mobile App

React Native mobile application for EcoRide - an eco-friendly ride sharing platform.

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Installation

1. Navigate to the mobile folder:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platform:
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios

# Web
npm run web
```

## API Configuration

The app is configured to connect to the backend API. Update the API URL in [src/services/api.ts](src/services/api.ts):

- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:5000/api`)

## Project Structure

```
mobile/
├── src/
│   ├── screens/           # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── VerifyOTPScreen.tsx
│   │   └── HomeScreen.tsx
│   ├── services/          # API services
│   │   ├── api.ts         # Axios configuration
│   │   └── authService.ts # Authentication API calls
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── components/        # Reusable components
├── App.tsx                # Main app component with navigation
└── package.json
```

## Features

- User authentication (Login/Signup)
- OTP verification
- Role selection (Rider/Driver)
- Resend OTP with cooldown
- Form validation
- Error handling

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (Mac only)
- `npm run web` - Run in web browser

## Environment Setup

Make sure your backend server is running before testing the mobile app:

```bash
# In the backend folder
npm run dev
```

The backend should be running on `http://localhost:5000`

## Troubleshooting

### Cannot connect to backend API

1. Check if backend server is running
2. Verify the API URL in [src/services/api.ts](src/services/api.ts)
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. For physical devices, ensure your device and computer are on the same network

### App crashes on startup

1. Clear cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors

## Next Steps

- Implement persistent authentication (AsyncStorage/SecureStore)
- Add map integration for ride booking
- Implement real-time ride tracking
- Add payment integration
- Push notifications
