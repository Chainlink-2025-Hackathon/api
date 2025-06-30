import express from 'express';
import cors from 'cors';
import { initializeApi } from './api';
import { Wallet } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper functions
function createApiResponse<T>(data: T, success: boolean = true, message: string = 'Success') {
    return {
        success,
        data,
        message,
        timestamp: new Date().toISOString()
    };
}

function generateRandomHash(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Types for mock endpoints
interface AssetVerificationResponse {
    verification_id: string;
    contract_address: string;
    token_id: string;
    is_present: boolean;
    location: string;
    last_inspection: string;
    custodian: string;
    certificate_hash: string;
}

interface VaultGuardVerificationResponse {
    verification_id: string;
    asset_details: {
        contract: string;
        tokenId: string;
        verified: boolean;
        storage_facility: string;
        security_level: string;
        insurance_coverage: string;
    };
    timestamp: string;
    signature: string;
}

interface NFTMetadata {
    tokenId: string;
    name: string;
    description: string;
    image: string;
    external_url: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
    background_color: string;
}

interface AuthenticityVerification {
    verification_id: string;
    certificate_hash: string;
    is_authentic: boolean;
    verification_method: string;
    verified_by: string;
    verification_date: string;
    confidence_score: number;
    details: {
        chain_of_custody: string;
        physical_condition: string;
        documentation: string;
        expert_opinion: string;
    };
}

// API Configuration
const config = {
    networkConfig: {
        chainId: parseInt(process.env.CHAIN_ID as string || '1'),
        name: process.env.NETWORK_NAME as string || 'mainnet',
        rpcUrl: process.env.RPC_URL as string || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
    },
    contractAddresses: {
        assetNFT: process.env.ASSET_NFT_CONTRACT  as string|| '0x0000000000000000000000000000000000000000',
        fractionalizationVault: process.env.FRACTIONALIZATION_VAULT_CONTRACT as string || '0x0000000000000000000000000000000000000000',
        lendingContract: process.env.LENDING_CONTRACT  as string|| '0x0000000000000000000000000000000000000000',
        auctionContract: process.env.AUCTION_CONTRACT  as string|| '0x0000000000000000000000000000000000000000',
        indexVault: process.env.INDEX_VAULT_CONTRACT  as string|| '0x0000000000000000000000000000000000000000',
        launchpadContract: process.env.LAUNCHPAD_CONTRACT  as string|| '0x0000000000000000000000000000000000000000',
    },
    usageType: 'Frontend' as const,
    //signer: process.env.PRIVATE_KEY ? new Wallet(process.env.PRIVATE_KEY) : undefined
};

// Initialize API
const { features, apiRoutes } = initializeApi(config);

// Mount API routes
app.use('/api', apiRoutes);

// Custodian API endpoints (Proof of Reserve)
app.get('/api/custodian-1/verify-asset', async (req: express.Request, res: express.Response) => {
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

    console.log('Asset verification request:', response);
    res.json(createApiResponse(response));
});

app.get('/api/custodian-2/verify-asset', async (req: express.Request, res: express.Response) => {
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

    console.log('VaultGuard verification request:', response);
    res.json(createApiResponse(response));
});

// Metadata and appraisal services
app.get('/api/metadata/:tokenId', (req: express.Request, res: express.Response) => {
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

// Authenticity verification
app.post('/api/verify-authenticity', (req: express.Request, res: express.Response) => {
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Bagels RWA API Server',
        version: '1.0.0',
        endpoints: {
            // Main API endpoints
            health: '/api/health',
            assets: '/api/assets',
            fractionalization: '/api/fractionalization',
            lending: '/api/lending',
            tokens: '/api/tokens',
            // Mock service endpoints
            custodian1: '/api/custodian-1/verify-asset',
            custodian2: '/api/custodian-2/verify-asset',
            metadata: '/api/metadata/:tokenId',
            authenticity: '/api/verify-authenticity'
        }
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'GET /api/assets/*',
            'GET /api/fractionalization/*',
            'GET /api/lending/*',
            'POST /api/tokens/approve',
            'GET /api/custodian-1/verify-asset',
            'GET /api/custodian-2/verify-asset',
            'GET /api/metadata/:tokenId',
            'POST /api/verify-authenticity'
        ]
    });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Bagels RWA API Server running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Network: ${config.networkConfig.name} (Chain ID: ${config.networkConfig.chainId})`);
    console.log(`🔧 Mock Services Available:`);
    console.log(`   - Custodian 1: http://localhost:${PORT}/api/custodian-1/verify-asset`);
    console.log(`   - Custodian 2: http://localhost:${PORT}/api/custodian-2/verify-asset`);
    console.log(`   - Metadata: http://localhost:${PORT}/api/metadata/:tokenId`);
    console.log(`   - Authenticity: http://localhost:${PORT}/api/verify-authenticity`);
});

export default app; 