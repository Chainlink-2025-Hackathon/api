# Chainlink NFT DeFi Mock Server (TypeScript)

A comprehensive mock server for simulating off-chain data sources for the Chainlink NFT DeFi platform. Built with TypeScript, Express.js, and MongoDB for robust type safety and scalable development experience.

## Features

- 🔐 **JWT Authentication** - Secure API access with token-based authentication
- 🏛️ **Custodian APIs** - Multiple custodian endpoints for Proof of Reserve verification
- 📊 **Market Data** - Real-time asset pricing and market information
- 🎨 **NFT Metadata** - Dynamic metadata generation for tokenized assets
- 💰 **Yield Tracking** - Asset income and yield distribution simulation
- 🔗 **Cross-Chain Support** - Asset status tracking across multiple blockchains
- 🤖 **Chainlink Functions** - Mock Chainlink Functions simulation
- 📝 **Comprehensive Logging** - Winston-based logging with multiple transport options
- 🛡️ **Security Features** - Rate limiting, CORS, and Helmet security headers
- 💾 **MongoDB Database** - Scalable NoSQL database for development and production

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB 6.0+ (local installation or MongoDB Atlas)

### Setup

1. Clone the repository and navigate to the mock-server directory:
```bash
cd mock-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB:
   - **Local MongoDB**: Install MongoDB locally and start the service
   - **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)

4. Create environment configuration:
```bash
cp env.example .env
```

5. Update your `.env` file with MongoDB connection details:
```env
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=chainlink_nft_defi

# For MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

6. Build the TypeScript code:
```bash
npm run build
```

7. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=chainlink_nft_defi
```

## API Documentation

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Custodian APIs (Proof of Reserve)

#### SecureArt Storage Verification
```http
GET /api/custodian-1/verify-asset?contract_address=0x123&token_id=1
X-API-Key: sk_test_secure_art_123
```

#### VaultGuard Inc Verification
```http
GET /api/custodian-2/verify-asset?contract_address=0x123&token_id=1
X-API-Key: sk_test_vault_guard_456
```

### Asset Management

#### Create Asset
```http
POST /api/assets
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "id": "asset-123",
  "contract_address": "0x123...",
  "token_id": 1,
  "asset_type": "artwork",
  "location": "SecureArt Vault A",
  "custodian": "SecureArt Storage",
  "value": 150000,
  "last_appraisal_date": "2024-01-01T00:00:00.000Z",
  "authenticity_cert": "cert-hash-123",
  "status": "active"
}
```

#### Get All Assets
```http
GET /api/assets
Authorization: Bearer your-jwt-token
```

#### Get Asset by ID
```http
GET /api/assets/asset-123
Authorization: Bearer your-jwt-token
```

### Asset Services

#### Get NFT Metadata
```http
GET /api/metadata/123
```

#### Get Asset Appraisal
```http
GET /api/appraisal/123
X-API-Key: your-api-key
```

#### Verify Authenticity
```http
POST /api/verify-authenticity
X-API-Key: your-api-key
Content-Type: application/json

{
  "certificate_hash": "0x123...",
  "asset_details": {...}
}
```

### Market Data

#### Get Market Data
```http
GET /api/market-data/artwork
```

Response:
```json
{
  "success": true,
  "data": {
    "asset_type": "artwork",
    "current_price": 150000,
    "price_change_24h": 2.5,
    "volume_24h": 2500000,
    "last_updated": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Cross-Chain

#### Get Cross-Chain Asset Status
```http
GET /api/cross-chain/asset-status?contract_address=0x123&token_id=1&chain_id=1
```

### Analytics

#### Get Portfolio Analytics
```http
GET /api/analytics/portfolio
Authorization: Bearer your-jwt-token
```

### Chainlink Functions Simulation

#### Simulate Function Call
```http
POST /api/chainlink/functions/simulate
Content-Type: application/json

{
  "source": "// Your JavaScript function code here",
  "args": ["arg1", "arg2"]
}
```

## API Keys

The mock server includes three pre-configured custodian API keys:

- **SecureArt Storage**: `sk_test_secure_art_123`
- **VaultGuard Inc**: `sk_test_vault_guard_456` 
- **TrustKeep Ltd**: `sk_test_trust_keep_789`

## Database Schema

The server uses MongoDB with the following collections:

### Assets Collection
```javascript
{
  _id: ObjectId,
  id: "asset-123",
  contract_address: "0x123...",
  token_id: 1,
  asset_type: "artwork",
  location: "SecureArt Vault A",
  custodian: "SecureArt Storage",
  value: 150000,
  last_appraisal_date: "2024-01-01T00:00:00.000Z",
  authenticity_cert: "cert-hash-123",
  status: "active",
  created_at: ISODate,
  updated_at: ISODate
}
```

### Custodians Collection
```javascript
{
  _id: ObjectId,
  id: "custodian-1",
  name: "SecureArt Storage",
  api_key: "sk_test_secure_art_123",
  endpoint: "/api/custodian-1",
  active: true,
  created_at: ISODate,
  updated_at: ISODate
}
```

### Market Data Collection
```javascript
{
  _id: ObjectId,
  asset_type: "artwork",
  current_price: 150000,
  price_change_24h: 2.5,
  volume_24h: 2500000,
  last_updated: "2024-01-01T00:00:00.000Z",
  created_at: ISODate,
  updated_at: ISODate
}
```

### Reserve Logs Collection
```javascript
{
  _id: ObjectId,
  id: "verification-uuid",
  asset_id: "0x123-1",
  verification_time: "2024-01-01T00:00:00.000Z",
  status: "verified", // "verified" | "failed" | "pending"
  details: "JSON string of verification response",
  created_at: ISODate
}
```

## Database Indexes

The server automatically creates the following indexes for optimal performance:

- **Assets**: `{ id: 1 }` (unique), `{ contract_address: 1, token_id: 1 }`
- **Custodians**: `{ id: 1 }` (unique), `{ api_key: 1 }` (unique)
- **MarketData**: `{ asset_type: 1 }` (unique)
- **ReserveLogs**: `{ id: 1 }` (unique), `{ asset_id: 1 }`

## Type Safety

The server is built with comprehensive TypeScript types:

- **Request/Response Types**: All API endpoints have properly typed inputs and outputs
- **Database Models**: Interfaces for all MongoDB documents with ObjectId support
- **Middleware Types**: Type-safe authentication and validation middleware
- **Configuration Types**: Strongly typed server configuration

## Error Handling

The server includes comprehensive error handling:

- **Validation Errors**: 400 status codes for invalid input
- **Authentication Errors**: 401/403 status codes for auth failures
- **Not Found Errors**: 404 status codes for missing resources
- **Database Errors**: Proper MongoDB error handling and logging
- **Server Errors**: 500 status codes with proper logging

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for common vulnerabilities
- **JWT Authentication**: Secure token-based authentication
- **API Key Validation**: Secure API key verification with MongoDB lookup

## Development

### Project Structure
```
src/
├── types/           # TypeScript type definitions
│   └── index.ts    # All interfaces and types
├── server.ts       # Main server application
└── ...

dist/               # Compiled JavaScript output
```

### MongoDB Setup

#### Local Development
1. Install MongoDB Community Edition
2. Start MongoDB service: `brew services start mongodb/brew/mongodb-community`
3. Verify connection: `mongosh`

#### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string and update `MONGO_URL` in `.env`

### Adding New Endpoints

1. Define types in `src/types/index.ts`
2. Add route handlers in `src/server.ts`
3. Update this README with documentation
4. Add tests if applicable

### Testing

```bash
npm test
```

Tests are written with Jest and Supertest for comprehensive API testing.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or properly configured MongoDB replica set
3. Configure proper CORS origins
4. Set up SSL/TLS termination
5. Use PM2 or similar for process management
6. Set up monitoring and logging
7. Configure MongoDB connection pooling and timeouts

## Health Check

The server provides a health check endpoint:

```http
GET /health
```

Returns server status, uptime, memory usage, and database connection status.

## Logging

Logs are written to:
- `error.log` - Error level logs only
- `combined.log` - All logs
- Console output in development

## Contributing

1. Follow TypeScript best practices
2. Add types for all new features
3. Update documentation
4. Add tests for new functionality
5. Run linting before committing
6. Ensure MongoDB indexes are properly configured for new collections

## License

MIT License - see LICENSE file for details. 