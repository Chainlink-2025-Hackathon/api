import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import winston from 'winston';
import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

import {
  Asset,
  Custodian,
  MarketData,
  ReserveLog,
  AuthUser,
  AssetVerificationResponse,
  VaultGuardVerificationResponse,
  NFTMetadata,
  AppraisalData,
  AuthenticityVerification,
  CrossChainAssetStatus,
  YieldData,
  PortfolioAnalytics,
  ChainlinkFunctionsRequest,
  ChainlinkFunctionsResponse,
  ApiResponse,
  AuthRequest,
  AuthResponse,
  ServerConfig
} from './types';

dotenv.config();

const app: Application = express();

// Server configuration
const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: (process.env.NODE_ENV as ServerConfig['nodeEnv']) || 'development',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['*'],
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  databaseName: process.env.DATABASE_NAME || 'chainlink_nft_defi'
};

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

// Database setup
let client: MongoClient;
let db: Db;
let collections: {
  assets: Collection<Asset>;
  custodians: Collection<Custodian>;
  marketData: Collection<MarketData>;
  reserveLogs: Collection<ReserveLog>;
};

// Database initialization
const initializeDatabase = async (): Promise<void> => {
  try {
    client = new MongoClient(config.mongoUrl);
    await client.connect();
    db = client.db(config.databaseName);
    
    // Initialize collections
    collections = {
      assets: db.collection<Asset>('assets'),
      custodians: db.collection<Custodian>('custodians'),
      marketData: db.collection<MarketData>('marketData'),
      reserveLogs: db.collection<ReserveLog>('reserveLogs')
    };

    // Create indexes for better performance
    await collections.assets.createIndex({ id: 1 }, { unique: true });
    await collections.assets.createIndex({ contract_address: 1, token_id: 1 });
    await collections.custodians.createIndex({ id: 1 }, { unique: true });
    await collections.custodians.createIndex({ api_key: 1 }, { unique: true });
    await collections.marketData.createIndex({ asset_type: 1 }, { unique: true });
    await collections.reserveLogs.createIndex({ id: 1 }, { unique: true });
    await collections.reserveLogs.createIndex({ asset_id: 1 });

    // Insert sample custodians
    const existingCustodians = await collections.custodians.countDocuments();
    if (existingCustodians === 0) {
      const sampleCustodians: Custodian[] = [
        {
          id: 'custodian-1',
          name: 'SecureArt Storage',
          api_key: 'sk_test_secure_art_123',
          endpoint: '/api/custodian-1',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'custodian-2',
          name: 'VaultGuard Inc',
          api_key: 'sk_test_vault_guard_456',
          endpoint: '/api/custodian-2',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'custodian-3',
          name: 'TrustKeep Ltd',
          api_key: 'sk_test_trust_keep_789',
          endpoint: '/api/custodian-3',
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await collections.custodians.insertMany(sampleCustodians);
    }

    // Insert sample market data
    const existingMarketData = await collections.marketData.countDocuments();
    if (existingMarketData === 0) {
      const sampleMarketData: MarketData[] = [
        {
          asset_type: 'artwork',
          current_price: 150000,
          price_change_24h: 2.5,
          volume_24h: 2500000,
          last_updated: new Date().toISOString(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          asset_type: 'collectible',
          current_price: 75000,
          price_change_24h: -1.2,
          volume_24h: 1200000,
          last_updated: new Date().toISOString(),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          asset_type: 'real_estate',
          current_price: 500000,
          price_change_24h: 0.8,
          volume_24h: 8500000,
          last_updated: new Date().toISOString(),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await collections.marketData.insertMany(sampleMarketData);
    }

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Authentication middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = decoded as AuthUser;
    next();
  });
};

// API Key authentication middleware
const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;
  
  if (!apiKey) {
    res.status(401).json({ error: 'API key required' });
    return;
  }

  try {
    const custodian = await collections.custodians.findOne({ api_key: apiKey, active: true });
    
    if (!custodian) {
      res.status(403).json({ error: 'Invalid API key' });
      return;
    }
    req.custodian = custodian;
    next();
  } catch (error) {
    logger.error('Database error in API key authentication:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Utility functions
const createApiResponse = <T>(data: T | null, success: boolean = true, error?: string): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    data: success ? data : null,
    timestamp: new Date().toISOString()
  };
  
  if (!success && error) {
    response.error = error;
  }
  
  return response;
};

const generateRandomHash = (): string => crypto.randomBytes(32).toString('hex');

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    if (client && db) {
      await db.admin().ping();
      dbStatus = 'connected';
    }
  } catch (error) {
    dbStatus = 'disconnected';
  }

  res.json(createApiResponse({ 
    status: 'healthy', 
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: dbStatus
  }));
});

// Authentication endpoints
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password }: AuthRequest = req.body;
    
    if (!username || !password) {
      res.status(400).json(createApiResponse(null, false, 'Username and password required'));
      return;
    }
    
    // Mock authentication - in production, verify against database
    if (username === 'admin' && password === 'admin123') {
      const user: AuthUser = { username, role: 'admin' };
      const token = jwt.sign(user, config.jwtSecret, { expiresIn: '24h' });
      
      const response: AuthResponse = { token, user };
      res.json(createApiResponse(response));
    } else {
      res.status(401).json(createApiResponse(null, false, 'Invalid credentials'));
    }
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(createApiResponse(null, false, 'Internal server error'));
  }
});

// Custodian API endpoints (Proof of Reserve)
app.get('/api/custodian-1/verify-asset', /*authenticateApiKey,*/ async (req: Request, res: Response) => {
  const { contract_address, token_id } = req.query as { contract_address: string; token_id: string };
  
  if (!contract_address || !token_id) {
    res.status(400).json(createApiResponse(null, false, 'Contract address and token ID required'));
    return;
  }
  
  // Simulate asset verification with random success/failure
  const isPresent = Math.random() > 0.1; // 90% success rate
  const verificationId = uuidv4();
  
  const response: AssetVerificationResponse = {
    verification_id: verificationId,
    contract_address,
    token_id,
    is_present: isPresent,
    location: 'Vault A-123, Temperature: 20°C, Humidity: 45%',
    last_inspection: new Date().toISOString(),
    custodian: 'SecureArt Storage',
    certificate_hash: generateRandomHash()
  };

  // Log verification attempt
  const logEntry: ReserveLog = {
    id: verificationId,
    asset_id: `${contract_address}-${token_id}`,
    verification_time: new Date().toISOString(),
    status: isPresent ? 'verified' : 'failed',
    details: JSON.stringify(response),
    created_at: new Date()
  };

  try {
    await collections.reserveLogs.insertOne(logEntry);
    logger.info('Asset verification request:', response);
    res.json(createApiResponse(response));
  } catch (error) {
    logger.error('Failed to log verification:', error);
    res.json(createApiResponse(response)); // Still return response even if logging fails
  }
});

app.get('/api/custodian-2/verify-asset', /*authenticateApiKey,*/ async (req: Request, res: Response) => {
  const { contract_address, token_id } = req.query as { contract_address: string; token_id: string };
  
  if (!contract_address || !token_id) {
    res.status(400).json(createApiResponse(null, false, 'Contract address and token ID required'));
    return;
  }
  
  const isPresent = Math.random() > 0.05; // 95% success rate
  const verificationId = uuidv4();
  
  const response: VaultGuardVerificationResponse = {
    verification_id: verificationId,
    asset_details: {
      contract: contract_address,
      tokenId: token_id,
      verified: isPresent,
      storage_facility: 'VaultGuard Facility B',
      security_level: 'Level 5',
      insurance_coverage: '$10,000,000'
    },
    timestamp: new Date().toISOString(),
    signature: crypto.randomBytes(64).toString('hex')
  };

  // Log verification attempt
  const logEntry: ReserveLog = {
    id: verificationId,
    asset_id: `${contract_address}-${token_id}`,
    verification_time: new Date().toISOString(),
    status: isPresent ? 'verified' : 'failed',
    details: JSON.stringify(response),
    created_at: new Date()
  };

  try {
    await collections.reserveLogs.insertOne(logEntry);
    res.json(createApiResponse(response));
  } catch (error) {
    logger.error('Failed to log verification:', error);
    res.json(createApiResponse(response)); // Still return response even if logging fails
  }
});

// Metadata and appraisal services
app.get('/api/metadata/:tokenId', (req: Request, res: Response) => {
  const { tokenId } = req.params;
  
  if (!tokenId || isNaN(Number(tokenId))) {
    res.status(400).json(createApiResponse(null, false, 'Valid token ID required'));
    return;
  }
  
  const metadata: NFTMetadata = {
    tokenId,
    name: `Asset #${tokenId}`,
    description: `Tokenized physical asset #${tokenId}`,
    image: `https://api.mock-server.com/images/${tokenId}.jpg`,
    external_url: `https://platform.example.com/asset/${tokenId}`,
    attributes: [
      { trait_type: 'Type', value: 'Artwork' },
      { trait_type: 'Period', value: '21st Century' },
      { trait_type: 'Condition', value: 'Excellent' },
      { trait_type: 'Provenance', value: 'Verified' }
    ],
    background_color: 'ffffff'
  };

  res.json(createApiResponse(metadata));
});

app.get('/api/appraisal/:tokenId', authenticateApiKey, (req: Request, res: Response) => {
  const { tokenId } = req.params;
  
  if (!tokenId) {
    res.status(400).json(createApiResponse(null, false, 'Token ID required'));
    return;
  }
  
  // Simulate appraisal with some randomness
  const baseValue = 100000;
  const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
  const currentValue = Math.floor(baseValue * (1 + variation));
  
  const appraisal: AppraisalData = {
    asset_id: tokenId,
    appraised_value: currentValue,
    currency: 'USD',
    appraisal_date: new Date().toISOString(),
    appraiser: {
      name: 'Certified Appraisals Inc.',
      license: 'CAI-12345',
      accreditation: 'ASA, AAA'
    },
    methodology: 'Comparable Sales Approach',
    confidence_level: 'High',
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    certificate_hash: generateRandomHash()
  };

  res.json(createApiResponse(appraisal));
});

// Authenticity verification
app.post('/api/verify-authenticity', authenticateApiKey, (req: Request, res: Response) => {
  const { certificate_hash } = req.body;
  
  if (!certificate_hash) {
    res.status(400).json(createApiResponse(null, false, 'Certificate hash required'));
    return;
  }
  
  // Simulate authenticity verification
  const isAuthentic = Math.random() > 0.02; // 98% success rate
  
  const verification: AuthenticityVerification = {
    verification_id: uuidv4(),
    certificate_hash,
    is_authentic: isAuthentic,
    verification_method: 'Digital Certificate + Physical Inspection',
    verified_by: 'Authentication Services Ltd.',
    verification_date: new Date().toISOString(),
    confidence_score: isAuthentic ? Math.random() * 0.1 + 0.9 : Math.random() * 0.5,
    details: {
      chain_of_custody: 'Verified',
      physical_condition: 'As described',
      documentation: 'Complete',
      expert_opinion: isAuthentic ? 'Confirmed authentic' : 'Requires further investigation'
    }
  };

  res.json(createApiResponse(verification));
});

// Market data endpoints
app.get('/api/market-data/:assetType', async (req: Request, res: Response) => {
  const { assetType } = req.params;
  
  if (!assetType) {
    res.status(400).json(createApiResponse(null, false, 'Asset type required'));
    return;
  }
  
  try {
    const marketData = await collections.marketData.findOne({ asset_type: assetType });
    
    if (!marketData) {
      res.status(404).json(createApiResponse(null, false, 'Asset type not found'));
      return;
    }

    // Add some real-time variation
    const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const updatedData: MarketData = {
      ...marketData,
      current_price: Math.floor(marketData.current_price * (1 + priceVariation)),
      last_updated: new Date().toISOString()
    };
    
    // Update the document with new price
    await collections.marketData.updateOne(
      { asset_type: assetType },
      { 
        $set: { 
          current_price: updatedData.current_price,
          last_updated: updatedData.last_updated,
          updated_at: new Date()
        }
      }
    );
    
    res.json(createApiResponse(updatedData));
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json(createApiResponse(null, false, 'Database error'));
  }
});

// Cross-chain data endpoints
app.get('/api/cross-chain/asset-status', (req: Request, res: Response) => {
  const { contract_address, token_id, chain_id } = req.query as { 
    contract_address: string; 
    token_id: string; 
    chain_id: string; 
  };
  
  if (!contract_address || !token_id || !chain_id) {
    res.status(400).json(createApiResponse(null, false, 'Contract address, token ID, and chain ID required'));
    return;
  }
  
  const status: CrossChainAssetStatus = {
    asset_id: `${contract_address}-${token_id}`,
    chain_id,
    status: 'active',
    location: {
      current_chain: chain_id,
      original_chain: '1', // Ethereum mainnet
      transfer_history: [
        {
          from_chain: '1',
          to_chain: chain_id,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          transaction_hash: generateRandomHash()
        }
      ]
    },
    verification_status: {
      last_verified: new Date().toISOString(),
      verification_count: 42,
      next_verification: new Date(Date.now() + 86400000).toISOString()
    }
  };

  res.json(createApiResponse(status));
});

// Yield and income tracking
app.get('/api/yield/:assetId', authenticateApiKey, (req: Request, res: Response) => {
  const { assetId } = req.params;
  
  if (!assetId) {
    res.status(400).json(createApiResponse(null, false, 'Asset ID required'));
    return;
  }
  
  // Simulate yield data
  const monthlyYield = Math.random() * 1000; // 0-1000 USD monthly yield
  
  const yieldData: YieldData = {
    asset_id: assetId,
    period: 'monthly',
    yield_amount: monthlyYield,
    currency: 'USD',
    yield_type: 'rental_income',
    payment_date: new Date().toISOString(),
    next_payment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    yield_history: [
      { date: '2024-01-01', amount: 950 },
      { date: '2024-02-01', amount: 1020 },
      { date: '2024-03-01', amount: monthlyYield }
    ]
  };

  res.json(createApiResponse(yieldData));
});

// Analytics and reporting
app.get('/api/analytics/portfolio', authenticateToken, (req: Request, res: Response) => {
  const portfolio: PortfolioAnalytics = {
    total_value: Math.floor(Math.random() * 5000000) + 1000000,
    asset_count: Math.floor(Math.random() * 50) + 10,
    monthly_yield: Math.floor(Math.random() * 50000) + 10000,
    performance: {
      '1d': (Math.random() - 0.5) * 4,
      '7d': (Math.random() - 0.5) * 10,
      '30d': (Math.random() - 0.5) * 20,
      '1y': (Math.random() - 0.5) * 40
    },
    top_assets: [
      { id: 'asset-1', type: 'artwork', value: 500000, yield: '2.5%' },
      { id: 'asset-2', type: 'real_estate', value: 750000, yield: '4.2%' },
      { id: 'asset-3', type: 'collectible', value: 250000, yield: '1.8%' }
    ]
  };

  res.json(createApiResponse(portfolio));
});

// Mock Chainlink Functions simulation endpoints
app.post('/api/chainlink/functions/simulate', (req: Request, res: Response) => {
  const { source, args = [] }: ChainlinkFunctionsRequest = req.body;
  
  if (!source) {
    res.status(400).json(createApiResponse(null, false, 'Source code required'));
    return;
  }
  
  logger.info('Chainlink Functions simulation:', { source, args });
  
  // Simulate different function types based on source code patterns
  let result: string | number | boolean;
  
  if (source.includes('verify') || source.includes('authenticity')) {
    // Authenticity verification
    result = Math.random() > 0.05; // 95% authentic
  } else if (source.includes('appraisal') || source.includes('value')) {
    // Appraisal value
    result = Math.floor(Math.random() * 500000) + 50000; // 50K-550K
  } else if (source.includes('metadata')) {
    // Metadata update
    result = `https://api.mock-server.com/metadata/${args[0] || 'default'}`;
  } else if (source.includes('reserve') || source.includes('custodian')) {
    // Proof of reserve
    result = Math.random() > 0.1; // 90% verified
  } else {
    // Default response
    result = 'Mock response';
  }

  const response: ChainlinkFunctionsResponse = {
    request_id: uuidv4(),
    result,
    execution_time: Math.floor(Math.random() * 5000) + 1000,
    gas_used: Math.floor(Math.random() * 200000) + 50000,
    timestamp: new Date().toISOString()
  };

  res.json(createApiResponse(response));
});

// Asset management endpoints
app.post('/api/assets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const assetData: Omit<Asset, '_id' | 'created_at' | 'updated_at'> = req.body;
    
    const asset: Asset = {
      ...assetData,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collections.assets.insertOne(asset);
    res.status(201).json(createApiResponse({ ...asset, _id: result.insertedId }));
  } catch (error) {
    logger.error('Failed to create asset:', error);
    res.status(500).json(createApiResponse(null, false, 'Failed to create asset'));
  }
});

app.get('/api/assets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const assets = await collections.assets.find({}).toArray();
    res.json(createApiResponse(assets));
  } catch (error) {
    logger.error('Failed to fetch assets:', error);
    res.status(500).json(createApiResponse(null, false, 'Failed to fetch assets'));
  }
});

app.get('/api/assets/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json(createApiResponse(null, false, 'Asset ID required'));
      return;
    }
    
    const asset = await collections.assets.findOne({ id });
    
    if (!asset) {
      res.status(404).json(createApiResponse(null, false, 'Asset not found'));
      return;
    }
    
    res.json(createApiResponse(asset));
  } catch (error) {
    logger.error('Failed to fetch asset:', error);
    res.status(500).json(createApiResponse(null, false, 'Failed to fetch asset'));
  }
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json(createApiResponse(null, false, 'Internal server error'));
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json(createApiResponse(null, false, 'Endpoint not found'));
});

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    app.listen(config.port, () => {
      logger.info(`Mock server running on port ${config.port}`);
      // console.log(`🚀 Mock server is running on http://localhost:${config.port}`);
      // console.log(`📚 Health check: http://localhost:${config.port}/health`);
      // console.log(`🔐 Login: POST http://localhost:${config.port}/auth/login`);
      // console.log(`📊 Market data: GET http://localhost:${config.port}/api/market-data/artwork`);
      // console.log(`🔍 Asset verification: GET http://localhost:${config.port}/api/custodian-1/verify-asset`);
      //console.log(`💾 Database: ${config.mongoUrl}/${config.databaseName}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  logger.info('Shutting down gracefully...');
  
  if (client) {
    await client.close();
    logger.info('Database connection closed.');
  }
  
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start the server
if (require.main === module) {
  startServer().catch(console.error);
}

export default app; 