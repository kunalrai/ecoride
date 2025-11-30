/**
 * API Configuration for EcoRide Frontend
 *
 * This file centralizes all API endpoint configurations and provides
 * a consistent way to access the backend API across different environments.
 */

// Get the base API URL from environment variables
// Falls back to localhost if not set
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Environment check
export const IS_PRODUCTION = import.meta.env.VITE_ENV === 'production';
export const IS_DEVELOPMENT = import.meta.env.VITE_ENV === 'development';

// API Endpoints
export const API_ENDPOINTS = {
  // Health & Status
  HEALTH: `${API_BASE_URL}/health`,
  API_DOCS: `${API_BASE_URL}/api-docs`,

  // Authentication
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    VERIFY_SIGNUP: `${API_BASE_URL}/api/auth/verify-signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY_LOGIN: `${API_BASE_URL}/api/auth/verify-login`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/auth/profile`,
    VEHICLES: `${API_BASE_URL}/api/auth/vehicles`,
    VEHICLE_BY_ID: (id: string) => `${API_BASE_URL}/api/auth/vehicles/${id}`,
  },

  // Rides
  RIDES: {
    BASE: `${API_BASE_URL}/api/rides`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/rides/${id}`,
    SEARCH: `${API_BASE_URL}/api/rides/search`,
    MY_RIDES: `${API_BASE_URL}/api/rides/my-rides`,
  },

  // Bookings
  BOOKINGS: {
    BASE: `${API_BASE_URL}/api/bookings`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
    MY_BOOKINGS: `${API_BASE_URL}/api/bookings/my-bookings`,
    ACCEPT: (id: string) => `${API_BASE_URL}/api/bookings/${id}/accept`,
    REJECT: (id: string) => `${API_BASE_URL}/api/bookings/${id}/reject`,
    CANCEL: (id: string) => `${API_BASE_URL}/api/bookings/${id}/cancel`,
  },

  // Wallet
  WALLET: {
    BASE: `${API_BASE_URL}/api/wallet`,
    LOAD: `${API_BASE_URL}/api/wallet/load`,
    TRANSACTIONS: `${API_BASE_URL}/api/wallet/transactions`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/api/notifications`,
    MARK_READ: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/api/notifications/read-all`,
  },

  // AI Features
  AI: {
    BASE: `${API_BASE_URL}/api/ai`,
    PRICE_SUGGEST: `${API_BASE_URL}/api/ai/suggest-price`,
    ROUTE_OPTIMIZE: `${API_BASE_URL}/api/ai/optimize-route`,
    CHAT: `${API_BASE_URL}/api/ai/chat`,
  },

  // Location
  LOCATION: {
    BASE: `${API_BASE_URL}/api/location`,
    TRACK: `${API_BASE_URL}/api/location/track`,
    NEARBY: `${API_BASE_URL}/api/location/nearby`,
  },

  // Chat
  CHAT: {
    CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
    CONVERSATION_BY_ID: (id: string) => `${API_BASE_URL}/api/chat/conversations/${id}`,
    MESSAGES: (conversationId: string) => `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
    SEND_MESSAGE: (conversationId: string) => `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
  },
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Export for logging/debugging
if (IS_DEVELOPMENT) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: import.meta.env.VITE_ENV,
    isDevelopment: IS_DEVELOPMENT,
    isProduction: IS_PRODUCTION,
  });
}

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  REQUEST_TIMEOUT,
};
