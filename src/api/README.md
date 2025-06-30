# ChainLink NFT DeFi API Controllers

This API provides comprehensive functionality for NFT-based DeFi operations including asset tokenization, fractionalization, and lending.

## Architecture

The API is organized into the following controllers:

### 1. Asset Controller (`/api/assets`)
Handles NFT asset operations:
- **POST /metadata** - Create asset metadata
- **POST /mint** - Mint new asset NFT
- **GET /user/:userAddress** - Get user's assets
- **GET /:tokenId/info** - Get asset information
- **GET /:tokenId/owner** - Get asset owner
- **GET /balance/:userAddress** - Get user's asset balance
- **GET /:tokenId/appraisal-history** - Get asset appraisal history

### 2. Fractionalization Controller (`/api/fractionalization`)
Handles asset fractionalization:
- **POST /approve** - Approve asset for fractionalization
- **POST /fractionalize** - Fractionalize an asset
- **POST /redeem** - Redeem fractionalized asset
- **GET /approval-status/:tokenId** - Check approval status
- **GET /asset/:assetId** - Get fractionalized asset info
- **GET /reserve/:assetId** - Get reserve data
- **GET /token-info/:tokenContract** - Get token contract info
- **GET /balance/:assetId/:userAddress** - Get user's token balance
- **POST /verify-token** - Verify fractionalized token
- **POST /token-value** - Get token value
- **POST /request-verification** - Request reserve verification (Chainlink Functions)
- **GET /verification-status/:assetId** - Get verification status

### 3. Lending Controller (`/api/lending`)
Handles NFT-backed lending:
- **POST /provide-liquidity** - Provide liquidity to lending pool
- **POST /withdraw-liquidity** - Withdraw liquidity
- **POST /approve-asset** - Approve asset for lending
- **GET /approval-status/:tokenId** - Check lending approval
- **GET /recommended-amount/:tokenId/:loanTokenAddress** - Get recommended loan amount
- **POST /create-loan** - Create NFT-backed loan
- **POST /repay-loan** - Repay loan
- **POST /liquidate-loan** - Liquidate loan
- **GET /loan/:loanId** - Get loan information
- **GET /total-owed/:loanId** - Calculate total owed
- **GET /liquidatable/:loanId** - Check if loan is liquidatable
- **GET /health-ratio/:loanId** - Get loan health ratio
- **GET /user-loans/:userAddress** - Get user's loans
- **GET /active-loans** - Get all active loans
- **GET /liquidatable-loans** - Get liquidatable loans

### 4. Token Controller (`/api/tokens`)
Handles ERC-20 token operations:
- **POST /approve** - Approve ERC-20 tokens

## Usage

### Setup

```typescript
import { initializeApi } from './api';
import { Wallet } from 'ethers';

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
    usageType: 'Backend',
    signer: new Wallet('YOUR_PRIVATE_KEY')
};

const { features, apiRoutes } = initializeApi(config);

// Mount routes in Express app
app.use('/api', apiRoutes);
```

### Example API Calls

#### Mint an Asset NFT
```bash
curl -X POST http://localhost:3000/api/assets/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b8D82C57B3e7B3aaB5",
    "assetType": "real-estate",
    "physicalLocation": "123 Main St, New York, NY",
    "appraisalValueUSD": 1000000,
    "custodian": "ABC Custodial Services",
    "authenticityCertHash": "0x123...",
    "metadataURI": "ipfs://QmYwAP..."
  }'
```

#### Fractionalize an Asset
```bash
curl -X POST http://localhost:3000/api/fractionalization/fractionalize \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "1",
    "fractionalSupply": "1000000",
    "reservePrice": "100"
  }'
```

#### Create a Loan
```bash
curl -X POST http://localhost:3000/api/lending/create-loan \
  -H "Content-Type: application/json" \
  -d '{
    "assetNftContract": "0x...",
    "tokenId": "1",
    "loanTokenAddress": "0x...",
    "amount": 50000,
    "intrestRate": 5,
    "duration": 365
  }'
```

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}
```

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Operation failed",
  "error": "Detailed error message"
}
```

## Frontend vs Backend Usage

The system supports both frontend and backend usage:

- **Backend**: All operations are executed on the server with the configured signer
- **Frontend**: Returns contract call objects for frontend execution (e.g., with wagmi/ethers)

Set `usageType: 'Frontend'` in the config for frontend usage.

## Error Handling

All endpoints include comprehensive error handling with:
- Input validation
- Meaningful error messages
- Proper HTTP status codes
- Consistent error response format

## Health Check

Check API status:
```bash
curl http://localhost:3000/api/health
```

Returns:
```json
{
  "success": true,
  "message": "Chainlink NFT DeFi API is running",
  "timestamp": "2025-01-11T10:00:00.000Z",
  "version": "1.0.0"
} 