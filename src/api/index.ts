import { Features } from '../services/features';
import { createApiRoutes } from '../routes/api';
import { Wallet } from 'ethers';

// Configuration interface for API setup
interface ApiConfig {
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
        governanceContract?: string | undefined;
        governanceToken?: string | undefined;
        launchpadContract: string;
    };
    usageType: 'Backend' | 'Frontend';
    signer?: Wallet;
}

// Initialize the API with configuration
export function initializeApi(config: ApiConfig) {
    // Create Features service instance
    const features = new Features(config);
    
    // Create API routes
    const apiRoutes = createApiRoutes(features);
    
    return {
        features,
        apiRoutes
    };
}

// Example usage:
/*
const config = {
    networkConfig: {
        chainId: 1,
        name: 'mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'
    },
    contractAddresses: {
        assetNFT: '0x...',
        fractionalizationVault: '0x...',
        lendingContract: '0x...',
        auctionContract: '0x...',
        indexVault: '0x...',
        launchpadContract: '0x...'
    },
    usageType: 'Backend' as const,
    signer: new Wallet('YOUR_PRIVATE_KEY')
};

const { features, apiRoutes } = initializeApi(config);

// In your Express app:
// app.use('/api', apiRoutes);
*/

export { Features }; 