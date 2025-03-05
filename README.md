# Flash Sale System API

A high-performance API for managing flash sales with real-time inventory updates built using MongoDB, Mongoose, Express, and TypeScript.

## Features

- **Real-time Inventory Management**: Track and update product inventory during flash sales with atomicity guarantees.
- **Concurrency Control**: Handles race conditions and prevents over-purchasing through MongoDB transactions.
- **Time-based Sales**: Configure sales with specific start times and automatic deactivation when inventory is depleted.
- **User Authentication**: Secure JWT-based authentication system.
- **Rate Limiting**: Prevents abuse with configurable rate limiting on critical endpoints.
- **Leaderboard API**: Shows chronological purchases during sales.
- **Dockerized Deployment**: Easy setup with Docker and docker-compose.
- **Production-Grade Security**: Secure environment variable handling, helmet protection, and more.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Authentication**: JWT
- **Deployment**: Docker & Docker Compose
- **Logging**: Winston

## Architecture

The application follows a scalable, maintainable architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Implement business logic
- **Models**: Define data schemas
- **Middleware**: Process requests before they reach controllers
- **Utils**: Shared utility functions
- **Routes**: Define API endpoints
- **Config**: Application configuration

## Requirements

- Node.js (v18 or higher)
- Docker & Docker Compose
- MongoDB via run-rs for replica sets (<https://www.npmjs.com/package/run-rs>) (or use the dockerized version)

## Getting Started

### Project Setup

1. Clone the repository

   ```bash
   git clone https://github.com/GeekyGeeky/flash-sales-system-api.git
   cd flash-sales-system-api
   ```

2. Copy the example env file and modify as needed

   ```bash
   cp .env.example .env
   ```

3. Install dependencies

   ```bash
   npm install
   ```

4. Start MongoDB

   ```bash
   # You'll need to have run-rs installed locally
   run-rs --keep --host=127.0.0.1 --portStart 27000
   ```

5. Build and start the application

   ```bash
   npm run build
   npm start
   ```

For development mode with auto-reload:

```bash
npm run dev
```

## API Documentation

<https://documenter.getpostman.com/view/29942543/2sAYdkJ9qa>

The API provides the following endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

### Flash Sales

- `GET /api/sales` - Get all sales
- `GET /api/sales/active` - Get currently active sale
- `GET /api/sales/:id` - Get a specific sale
- `POST /api/sales` - Create a new sale (admin only)
- `PUT /api/sales/:id` - Update a sale (admin only)
- `POST /api/sales/:id/activate` - Activate a sale (admin only)
- `POST /api/sales/:id/deactivate` - Deactivate a sale (admin only)
- `POST /api/sales/:id/reset` - Reset sale inventory (admin only)

### Purchases

- `POST /api/purchases` - Make a purchase (authenticated)
- `GET /api/purchases/history` - Get user's purchase history (authenticated)
- `GET /api/purchases/sale/:saleId` - Get all purchases for a sale
- `GET /api/purchases/leaderboard/:saleId` - Get chronological leaderboard for a sale

## Database Design

The system uses four main collections:

1. **Users**: Store user information and authentication data
2. **Products**: Store product details
3. **Sales**: Store information about flash sales including inventory
4. **Purchases**: Record of all user purchases

## Security Considerations

This application implements several security best practices:

- **Environment Variables**: Sensitive data is stored in environment variables, not in code
- **Helmet.js**: Sets HTTP headers for security
- **Rate Limiting**: Prevents brute force and DOS attacks
- **Input Validation**: All user input is validated using Joi
- **Password Hashing**: User passwords are securely hashed with bcrypt
- **JWT Authentication**: Secures API endpoints
- **MongoDB Security**: User authentication for database access

## Performance Optimization

The API is optimized for high performance:

- **Database Indexes**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Compression**: Response compression for faster network transfer
- **Atomicity with Transactions**: Ensures data consistency during high traffic
