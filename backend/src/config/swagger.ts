import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'EcoRide API',
    version: '1.0.0',
    description: 'EcoRide Carpooling Backend API Documentation',
    contact: {
      name: 'EcoRide Team',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production'
        ? (process.env.API_URL || 'https://ecoride-backend-service.onrender.com')
        : 'http://localhost:5000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
          },
          error: {
            type: 'string',
            description: 'Error details',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          phone: {
            type: 'string',
            description: 'User phone number',
          },
          role: {
            type: 'string',
            enum: ['RIDER', 'DRIVER', 'BOTH'],
            description: 'User role',
          },
          isVerified: {
            type: 'boolean',
            description: 'Email verification status',
          },
          isPhoneVerified: {
            type: 'boolean',
            description: 'Phone verification status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
        },
      },
      Ride: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Ride ID',
          },
          driverId: {
            type: 'string',
            description: 'Driver user ID',
          },
          origin: {
            type: 'string',
            description: 'Starting location',
          },
          destination: {
            type: 'string',
            description: 'Destination location',
          },
          departureTime: {
            type: 'string',
            format: 'date-time',
            description: 'Scheduled departure time',
          },
          availableSeats: {
            type: 'integer',
            description: 'Number of available seats',
          },
          pricePerSeat: {
            type: 'number',
            format: 'float',
            description: 'Price per seat in currency',
          },
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            description: 'Ride status',
          },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Booking ID',
          },
          rideId: {
            type: 'string',
            description: 'Associated ride ID',
          },
          riderId: {
            type: 'string',
            description: 'Rider user ID',
          },
          seatsBooked: {
            type: 'integer',
            description: 'Number of seats booked',
          },
          totalPrice: {
            type: 'number',
            format: 'float',
            description: 'Total booking price',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
            description: 'Booking status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Booking creation date',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
