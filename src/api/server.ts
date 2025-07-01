import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createApiRoutes } from '../routes/api';
import { initializeApiServices, getDefaultConfig, validateConfig } from '../config/serviceConfig';

// Load environment variables
dotenv.config();

class ApiServer {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.API_PORT || '3000', 10);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    try {
      // Initialize configuration
      const config = getDefaultConfig();

      // Validate configuration
      if (!validateConfig(config)) {
        throw new Error('Invalid configuration. Please check your environment variables.');
      }

      // Initialize services and controllers
      const { features } = initializeApiServices(config);

      // Setup API routes
      this.app.use('/api', createApiRoutes(features));

      // Root endpoint
      this.app.get('/', (req: Request, res: Response) => {
        res.json({
          success: true,
          message: 'Chainlink NFT DeFi API Server',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          endpoints: {
            health: '/api/health',
            assets: '/api/assets',
            lending: '/api/lending',
            auctions: '/api/auctions',
            fractionalization: '/api/fractionalization'
          }
        });
      });

      // 404 handler
      this.app.use('*', (req: Request, res: Response) => {
        res.status(404).json({
          success: false,
          error: 'Endpoint not found',
          path: req.originalUrl
        });
      });

    } catch (error) {
      console.error('Failed to setup routes:', error);
      process.exit(1);
    }
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  public start(): void {
    try {
      this.app.listen(this.port, () => {
        console.log(`🚀 Chainlink NFT DeFi API Server running on port ${this.port}`);
        console.log(`📖 API Documentation available at http://localhost:${this.port}/api/health`);
        console.log(`🌐 Frontend CORS enabled for: ${process.env.CORS_ORIGINS || 'localhost:3000,localhost:3001'}`);
        console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Network: ${process.env.NETWORK_NAME || 'sepolia'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Export for use in other files
export { ApiServer };

// Start server if this file is run directly
if (require.main === module) {
  const server = new ApiServer();
  server.start();
} 