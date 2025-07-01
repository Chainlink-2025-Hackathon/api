import { ethers } from 'ethers';
import winston from 'winston';
import { Features } from '../services/features';
import { AssetController } from '../controllers/assetController';
import { LendingController } from '../controllers/lendingController';
import { FractionalizationController } from '../controllers/fractionalizationController';
import { TokenController } from '../controllers/tokenController';

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
    launchpadContract: string;
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

    // Features configuration
    const featuresConfig = {
      networkConfig: config.networkConfig,
      contractAddresses: config.contractAddresses,
      usageType: 'Backend' as const,
      signer
    };

    // Initialize Features service
    const features = new Features(featuresConfig);

    // Initialize controllers
    const controllers = {
      assetController: new AssetController(features),
      lendingController: new LendingController(features),
      fractionalizationController: new FractionalizationController(features),
      tokenController: new TokenController(features)
    };

    logger.info('API services initialized successfully');

    return {
      features,
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
  const config: ApiServiceConfig = {
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
      launchpadContract: process.env.LAUNCHPAD_CONTRACT || '0x0000000000000000000000000000000000000000',
      ...(process.env.GOVERNANCE_CONTRACT && { governanceContract: process.env.GOVERNANCE_CONTRACT }),
      ...(process.env.GOVERNANCE_TOKEN && { governanceToken: process.env.GOVERNANCE_TOKEN })
    },
    privateKey: process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000'
  };
  
  return config;
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

  if (config.contractAddresses.launchpadContract === '0x0000000000000000000000000000000000000000') {
    errors.push('LAUNCHPAD_CONTRACT environment variable is required');
  }

  if (errors.length > 0) {
    logger.error('Configuration validation failed:', { errors });
    return false;
  }

  return true;
} 