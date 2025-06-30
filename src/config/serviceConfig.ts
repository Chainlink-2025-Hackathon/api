import { ethers } from 'ethers';
import winston from 'winston';
import { createServices, ServiceConfig } from '../services';
import { AssetController } from '../controllers/assetController';
import { LendingController } from '../controllers/lendingController';
import { AuctionController } from '../controllers/auctionController';
import { FractionalizationController } from '../controllers/fractionalizationController';

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'chainlink-nft-defi' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Service configuration interface
export interface ApiServiceConfig {
  networkConfig: {
    chainId: number;
    name: string;
    rpcUrl: string;
  };
  contractAddresses: {
    assetNFT: string;
    fractionalizationVault: string;
    lendingContract: string;
    auctionContract: string;
    indexVault: string;
    governanceContract?: string;
    governanceToken?: string;
  };
  privateKey: string;
}

// Initialize services and controllers
export function initializeApiServices(config: ApiServiceConfig) {
  try {
    logger.info('Initializing API services...', {
      network: config.networkConfig.name,
      chainId: config.networkConfig.chainId
    });

    // Create ethers wallet
    const signer = new ethers.Wallet(config.privateKey);

    // Service configuration
    const serviceConfig: ServiceConfig = {
      networkConfig: config.networkConfig,
      contractAddresses: config.contractAddresses,
      signer,
      logger
    };

    // Initialize services
    const services = createServices(serviceConfig);

    // Initialize controllers
    const controllers = {
      assetController: new AssetController(services.assetService, logger),
      lendingController: new LendingController(services.lendingService, logger),
      auctionController: new AuctionController(services.auctionService, logger),
      fractionalizationController: new FractionalizationController(services.fractionalizationService, logger)
    };

    logger.info('API services initialized successfully');

    return {
      services,
      controllers,
      logger
    };
  } catch (error) {
    logger.error('Failed to initialize API services:', error);
    throw error;
  }
}

// Default configuration (can be overridden by environment variables)
export const getDefaultConfig = (): ApiServiceConfig => {
  return {
    networkConfig: {
      chainId: parseInt(process.env.CHAIN_ID || '11155111'), // Sepolia testnet
      name: process.env.NETWORK_NAME || 'sepolia',
      rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
    },
    contractAddresses: {
      assetNFT: process.env.ASSET_NFT_CONTRACT || '0x0000000000000000000000000000000000000000',
      fractionalizationVault: process.env.FRACTIONALIZATION_VAULT_CONTRACT || '0x0000000000000000000000000000000000000000',
      lendingContract: process.env.LENDING_CONTRACT || '0x0000000000000000000000000000000000000000',
      auctionContract: process.env.AUCTION_CONTRACT || '0x0000000000000000000000000000000000000000',
      indexVault: process.env.INDEX_VAULT_CONTRACT || '0x0000000000000000000000000000000000000000',
      governanceContract: process.env.GOVERNANCE_CONTRACT,
      governanceToken: process.env.GOVERNANCE_TOKEN
    },
    privateKey: process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000'
  };
};

// Validation function
export function validateConfig(config: ApiServiceConfig): boolean {
  const errors: string[] = [];

  if (!config.networkConfig.rpcUrl || config.networkConfig.rpcUrl === 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY') {
    errors.push('RPC_URL environment variable is required');
  }

  if (!config.privateKey || config.privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    errors.push('PRIVATE_KEY environment variable is required');
  }

  if (config.contractAddresses.assetNFT === '0x0000000000000000000000000000000000000000') {
    errors.push('ASSET_NFT_CONTRACT environment variable is required');
  }

  if (config.contractAddresses.fractionalizationVault === '0x0000000000000000000000000000000000000000') {
    errors.push('FRACTIONALIZATION_VAULT_CONTRACT environment variable is required');
  }

  if (config.contractAddresses.lendingContract === '0x0000000000000000000000000000000000000000') {
    errors.push('LENDING_CONTRACT environment variable is required');
  }

  if (config.contractAddresses.auctionContract === '0x0000000000000000000000000000000000000000') {
    errors.push('AUCTION_CONTRACT environment variable is required');
  }

  if (config.contractAddresses.indexVault === '0x0000000000000000000000000000000000000000') {
    errors.push('INDEX_VAULT_CONTRACT environment variable is required');
  }

  if (errors.length > 0) {
    logger.error('Configuration validation failed:', { errors });
    return false;
  }

  return true;
} 