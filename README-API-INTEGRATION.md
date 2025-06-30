# ChainLink NFT DeFi API Integration Guide

A comprehensive guide to integrating with the ChainLink NFT DeFi platform, including asset tokenization, fractionalization, lending, and governance features.

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Architecture](#api-architecture)
- [Configuration](#configuration)
- [Asset Management API](#asset-management-api)
- [Fractionalization API](#fractionalization-api)
- [Lending API](#lending-api)
- [Token Operations API](#token-operations-api)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Frontend Integration Guide](#frontend-integration-guide)

## 🔄 Overview

The ChainLink NFT DeFi API provides a comprehensive suite of blockchain operations for:

- **Asset Tokenization**: Mint and manage real-world asset NFTs
- **Fractionalization**: Split NFTs into fractional tokens with reserve verification
- **Lending**: NFT-backed loans with automated liquidation
- **Token Operations**: ERC-20 token approvals and transfers
- **Chainlink Integration**: Price feeds and proof-of-reserve verification

## 🚀 Quick Start

### Installation & Setup

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
    usageType: 'Backend', // or 'Frontend'
    signer: new Wallet('YOUR_PRIVATE_KEY') // Backend only
};

const { features, apiRoutes } = initializeApi(config);

// Mount in Express app
app.use('/api', apiRoutes);
```

### Basic Usage

```bash
# Health check
curl http://localhost:3000/api/health

# Mint an asset
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

## 🏗️ API Architecture

### Controller-Based Structure

```
src/
├── controllers/
│   ├── assetController.ts           # Asset NFT operations
│   ├── fractionalizationController.ts # Fractionalization operations
│   ├── lendingController.ts         # Lending operations
│   └── tokenController.ts           # Token operations
├── services/
│   ├── features.ts                  # Core business logic
│   └── types.ts                     # Type definitions
└── routes/
    └── api.ts                       # Unified API routes
```

### Usage Types

- **Backend Mode**: All operations executed server-side with signer
- **Frontend Mode**: Returns contract call objects for client execution (wagmi/ethers)

## ⚙️ Configuration

### Network Configuration

```typescript
interface NetworkConfig {
    chainId: number;        // Network chain ID
    name: string;          // Network name
    rpcUrl: string;        // RPC endpoint
    blockExplorer?: string; // Block explorer URL
}
```

### Contract Addresses

```typescript
interface ContractAddresses {
    assetNFT: string;                    // Main asset NFT contract
    fractionalizationVault: string;      // Fractionalization contract
    lendingContract: string;             // Lending protocol contract
    auctionContract: string;             // Auction contract
    indexVault: string;                  // Index vault contract
    launchpadContract: string;           // Launchpad contract
    governanceContract?: string;         // Governance contract (optional)
    governanceToken?: string;            // Governance token (optional)
}
```

## 🏠 Asset Management API

### Create Asset Metadata

**Endpoint**: `POST /api/assets/metadata`

**Request Body**:
```typescript
{
  name: string;                    // Asset name (required)
  description: string;             // Asset description (required)
  image: string;                   // IPFS image URL (required)
  attributes: Array<{              // Asset attributes (required)
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;           // External URL (optional)
  animation_url?: string;          // Animation URL (optional)
  custody_proof?: string;          // Custody proof URL (optional)
  appraisal_value?: string;        // Appraisal value (optional)
  authenticity_certificate?: string; // Certificate URL (optional)
}
```

**Response**:
```typescript
{
  success: boolean;
  data: AssetMetadata;             // Created metadata object
  message: string;
}
```

**Example Request**:
```json
{
  "name": "Luxury Downtown Condo",
  "description": "Premium real estate asset in Manhattan",
  "image": "ipfs://QmImageHash",
  "attributes": [
    {"trait_type": "Property Type", "value": "Condominium"},
    {"trait_type": "Square Feet", "value": 2500},
    {"trait_type": "Bedrooms", "value": 3},
    {"trait_type": "Location", "value": "Manhattan, NY"}
  ],
  "external_url": "https://property-details.com/123",
  "custody_proof": "ipfs://QmCustodyHash",
  "appraisal_value": "1000000"
}
```

### Mint Asset NFT

**Endpoint**: `POST /api/assets/mint`

**Request Body**:
```typescript
{
  to: string;                      // Recipient address (required)
  assetType: string;               // Asset type e.g., "real-estate" (required)
  physicalLocation: string;        // Physical custody location (required)
  appraisalValueUSD: number;       // Appraised value in USD (required)
  custodian: string;              // Custodian organization (required)
  authenticityCertHash: string;    // IPFS hash of certificate (required)
  metadataURI: string;            // IPFS metadata URI (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  tokenId: string;                 // Minted token ID
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: {                  // Contract call object for wagmi
    address: string;               // Contract address
    abi: any[];                   // Contract ABI
    functionName: string;         // Function name
    args: any[];                  // Function arguments
    value?: bigint;               // ETH value to send
  };
  message: string;
}
```

### Get User Assets

**Endpoint**: `GET /api/assets/user/:userAddress`

**Path Parameters**:
- `userAddress` (string, required): Ethereum address of the user

**Response**:
```typescript
{
  success: boolean;
  data: string[];                  // Array of token IDs owned by user
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": ["1", "5", "12", "23"],
  "message": "User assets retrieved successfully"
}
```

### Get Asset Information

**Endpoint**: `GET /api/assets/:tokenId/info`

**Path Parameters**:
- `tokenId` (string, required): NFT token ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    tokenId: string;               // Token ID (converted from bigint)
    owner: string;                 // Current owner address
    assetType: string;             // Type of asset
    physicalLocation: string;      // Physical custody location
    appraisalValue: string;        // Appraisal value in wei (converted from bigint)
    lastAppraisalDate: string;     // Last appraisal timestamp (converted from bigint)
    isAuthenticated: boolean;      // Whether asset is authenticated
    custodian: string;            // Custodian organization
    authenticityCertHash: string;  // Certificate hash
    isCrossChain: boolean;        // Cross-chain token flag
    originChain: string;          // Origin chain ID (converted from bigint)
    metadata: AssetMetadata;      // Full metadata object
  };
  message: string;
}
```

### Get Asset Owner

**Endpoint**: `GET /api/assets/:tokenId/owner`

**Path Parameters**:
- `tokenId` (string, required): NFT token ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    owner: string;                 // Owner's Ethereum address
  };
  message: string;
}
```

### Get Asset Balance

**Endpoint**: `GET /api/assets/balance/:userAddress`

**Path Parameters**:
- `userAddress` (string, required): Ethereum address of the user

**Response**:
```typescript
{
  success: boolean;
  data: {
    balance: string;               // Number of NFTs owned (converted from bigint)
  };
  message: string;
}
```

### Get Appraisal History

**Endpoint**: `GET /api/assets/:tokenId/appraisal-history`

**Path Parameters**:
- `tokenId` (string, required): NFT token ID

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    value: string;                 // Appraisal value in wei (converted from bigint)
    date: string;                 // Timestamp (converted from bigint)
    blockNumber: number;          // Block number
    transactionHash: string;      // Transaction hash
  }>;
  message: string;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "value": "1000000000000000000000000",
      "date": "1704067200",
      "blockNumber": 18900000,
      "transactionHash": "0xabc123..."
    }
  ],
  "message": "Appraisal history retrieved successfully"
}
```

## 🔄 Fractionalization API

### Approve Asset for Fractionalization

**Endpoint**: `POST /api/fractionalization/approve`

**Request Body**:
```typescript
{
  tokenId: string;                 // NFT token ID (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Fractionalize Asset

**Endpoint**: `POST /api/fractionalization/fractionalize`

**Request Body**:
```typescript
{
  tokenId: string;                 // NFT token ID (required)
  fractionalSupply: string;        // Total fractional token supply (required)
  reservePrice: string;            // Minimum redemption price in ETH (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  assetId: string;                 // Unique asset ID generated
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Redeem Asset

**Endpoint**: `POST /api/fractionalization/redeem`

**Request Body**:
```typescript
{
  fractionalizedTokenContract: string; // Fractional token contract address (required)
  amount: number;                      // Amount of tokens to redeem (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Check Approval Status

**Endpoint**: `GET /api/fractionalization/approval-status/:tokenId`

**Path Parameters**:
- `tokenId` (string, required): NFT token ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    isApproved: boolean;           // Whether NFT is approved for fractionalization
  };
  message: string;
}
```

### Get Fractionalized Asset

**Endpoint**: `GET /api/fractionalization/asset/:assetId`

**Path Parameters**:
- `assetId` (string, required): Unique asset ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    assetId: string;               // Asset ID
    nftContract: string;           // NFT contract address
    tokenId: string;               // Token ID (converted from bigint)
    originalOwner: string;         // Original owner address
    fractionalSupply: string;      // Total fractional supply (converted from bigint)
    reservePrice: string;          // Reserve price in wei (converted from bigint)
    isActive: boolean;             // Whether fractionalization is active
    creationTime: string;          // Creation timestamp (converted from bigint)
    lastYieldDistribution: string; // Last yield distribution (converted from bigint)
    lastReserveCheck: string;      // Last reserve check (converted from bigint)
    status: AssetStatus;           // Current asset status
    custodianEndpoint: string;     // Custodian API endpoint
    fractionalTokenContract: string; // Fractional token contract address
  };
  message: string;
}
```

### Get Reserve Data

**Endpoint**: `GET /api/fractionalization/reserve/:assetId`

**Path Parameters**:
- `assetId` (string, required): Unique asset ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    isVerified: boolean;           // Whether reserves are verified
    lastVerification: string;      // Last verification timestamp (converted from bigint)
    consecutiveFailures: string;   // Number of consecutive failures (converted from bigint)
    lastRequestId: string;         // Last Chainlink request ID
  };
  message: string;
}
```

### Get Fractionalized Asset Info

**Endpoint**: `GET /api/fractionalization/token-info/:tokenContract`

**Path Parameters**:
- `tokenContract` (string, required): Fractional token contract address

**Response**:
```typescript
{
  success: boolean;
  data: {
    assetId: string;               // Associated asset ID
  };
  message: string;
}
```

### Get Asset Token Balance

**Endpoint**: `GET /api/fractionalization/balance/:assetId/:userAddress`

**Path Parameters**:
- `assetId` (string, required): Unique asset ID
- `userAddress` (string, required): User's Ethereum address

**Response**:
```typescript
{
  success: boolean;
  data: {
    balance: string;               // Token balance (converted from bigint)
  };
  message: string;
}
```

### Verify Fractionalized Token

**Endpoint**: `POST /api/fractionalization/verify-token`

**Request Body**:
```typescript
{
  fractionalizedTokenContract: string; // Fractional token contract address (required)
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    assetId: string;               // Associated asset ID
    reservePrice: string;          // Reserve price (converted from bigint)
    fractionalSupply: string;      // Fractional supply (converted from bigint)
    isActive: boolean;             // Whether token is active
  };
  message: string;
}
```

### Get Token Value

**Endpoint**: `POST /api/fractionalization/token-value`

**Request Body**:
```typescript
{
  fractionalizedTokenContract: string; // Fractional token contract address (required)
  amount: number;                      // Amount of tokens (required)
}
```

**Response**:
```typescript
{
  success: boolean;
  data: {
    value: string;                 // Token value in wei (converted from bigint)
  };
  message: string;
}
```

### Request Reserve Verification (Chainlink Functions)

**Endpoint**: `POST /api/fractionalization/request-verification`

**Request Body**:
```typescript
{
  assetId: string;                 // Asset ID to verify (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Get Reserve Verification Status

**Endpoint**: `GET /api/fractionalization/verification-status/:assetId`

**Path Parameters**:
- `assetId` (string, required): Asset ID

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    requestId: string;             // Chainlink request ID
    tokenId: string;               // Token ID (converted from bigint)
    requestType: 'METADATA_UPDATE' | 'AUTHENTICITY_CHECK' | 'RESERVE_VERIFICATION';
    timestamp: string;             // Request timestamp (converted from bigint)
    status: 'PENDING' | 'FULFILLED' | 'FAILED';
  }>;
  message: string;
}
```

## 💰 Lending API

### Provide Liquidity

**Endpoint**: `POST /api/lending/provide-liquidity`

**Request Body**:
```typescript
{
  tokenAddress: string;            // ERC-20 token contract address (required)
  amount: number;                  // Amount to provide as liquidity (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  lpToken: string;                 // LP token address
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Withdraw Liquidity

**Endpoint**: `POST /api/lending/withdraw-liquidity`

**Request Body**:
```typescript
{
  lpTokenAmount: number;           // LP token amount to withdraw (required)
  tokenAddress: string;            // Token address to withdraw (required)
  amount: number;                  // Amount to withdraw (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Approve Asset for Loan

**Endpoint**: `POST /api/lending/approve-asset`

**Request Body**:
```typescript
{
  tokenId: string;                 // NFT token ID (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Check Lending Approval Status

**Endpoint**: `GET /api/lending/approval-status/:tokenId`

**Path Parameters**:
- `tokenId` (string, required): NFT token ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    isApproved: boolean;           // Whether NFT is approved for lending
  };
  message: string;
}
```

### Get Recommended Loan Amount

**Endpoint**: `GET /api/lending/recommended-amount/:tokenId/:loanTokenAddress`

**Path Parameters**:
- `tokenId` (string, required): NFT token ID
- `loanTokenAddress` (string, required): Loan token contract address

**Response**:
```typescript
{
  success: boolean;
  data: {
    recommendedAmount: string;     // Recommended loan amount (converted from bigint)
    maxAmount: string;             // Maximum possible loan (converted from bigint)
    collateralValue: string;       // Current collateral value (converted from bigint)
    targetLtv: number;             // Target loan-to-value ratio
    maxLtv: number;               // Maximum LTV allowed
  };
  message: string;
}
```

### Create NFT Loan

**Endpoint**: `POST /api/lending/create-loan`

**Request Body**:
```typescript
{
  assetNftContract: string;        // NFT contract address (required)
  tokenId: string;                 // NFT token ID (required)
  loanTokenAddress: string;        // Loan token contract (required)
  amount: number;                  // Loan amount (required)
  intrestRate: number;             // Interest rate in basis points (required)
  duration: number;                // Loan duration in seconds (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  loanId: string;                  // Created loan ID
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Repay Loan

**Endpoint**: `POST /api/lending/repay-loan`

**Request Body**:
```typescript
{
  loanId: number;                  // Loan ID to repay (required)
  amount: number;                  // Amount to repay (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Liquidate Loan

**Endpoint**: `POST /api/lending/liquidate-loan`

**Request Body**:
```typescript
{
  loanId: number;                  // Loan ID to liquidate (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

### Get Loan Information

**Endpoint**: `GET /api/lending/loan/:loanId`

**Path Parameters**:
- `loanId` (string, required): Loan ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    loanId: string;                // Loan ID (converted from bigint)
    borrower: string;              // Borrower address
    lender: string;                // Lender address
    collateralType: 'NFT' | 'FRACTIONAL'; // Type of collateral
    collateralAddress: string;     // Collateral contract address
    collateralTokenId: string;     // Collateral token ID (converted from bigint)
    collateralAmount: string;      // Collateral amount (converted from bigint)
    loanAmount: string;            // Loan amount (converted from bigint)
    interestRate: string;          // Interest rate (converted from bigint)
    duration: string;              // Loan duration (converted from bigint)
    startTime: string;             // Start timestamp (converted from bigint)
    endTime: string;               // End timestamp (converted from bigint)
    status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED'; // Loan status
    totalRepayment: string;        // Total repayment amount (converted from bigint)
    amountRepaid: string;          // Amount already repaid (converted from bigint)
  };
  message: string;
}
```

### Calculate Total Owed

**Endpoint**: `GET /api/lending/total-owed/:loanId`

**Path Parameters**:
- `loanId` (string, required): Loan ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    totalOwed: string;             // Total amount owed including interest (converted from bigint)
  };
  message: string;
}
```

### Check if Loan is Liquidatable

**Endpoint**: `GET /api/lending/liquidatable/:loanId`

**Path Parameters**:
- `loanId` (string, required): Loan ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    isLiquidatable: boolean;       // Whether loan can be liquidated
  };
  message: string;
}
```

### Calculate Loan Health Ratio

**Endpoint**: `GET /api/lending/health-ratio/:loanId`

**Path Parameters**:
- `loanId` (string, required): Loan ID

**Response**:
```typescript
{
  success: boolean;
  data: {
    healthRatio: number;           // Health ratio (1.0 = fully collateralized)
  };
  message: string;
}
```

### Get User Loans

**Endpoint**: `GET /api/lending/user-loans/:userAddress`

**Path Parameters**:
- `userAddress` (string, required): User's Ethereum address

**Response**:
```typescript
{
  success: boolean;
  data: {
    loanIds: string[];             // Array of loan IDs (converted from bigint)
  };
  message: string;
}
```

### Get Active Loans

**Endpoint**: `GET /api/lending/active-loans`

**Query Parameters**: None

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    loanId: string;                // Loan ID (converted from bigint)
    borrower: string;              // Borrower address
    lender: string;                // Lender address
    collateralType: 'NFT' | 'FRACTIONAL'; // Type of collateral
    collateralAddress: string;     // Collateral contract address
    collateralTokenId: string;     // Collateral token ID (converted from bigint)
    collateralAmount: string;      // Collateral amount (converted from bigint)
    loanAmount: string;            // Loan amount (converted from bigint)
    interestRate: string;          // Interest rate (converted from bigint)
    duration: string;              // Loan duration (converted from bigint)
    startTime: string;             // Start timestamp (converted from bigint)
    endTime: string;               // End timestamp (converted from bigint)
    status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED'; // Loan status
    totalRepayment: string;        // Total repayment amount (converted from bigint)
    amountRepaid: string;          // Amount already repaid (converted from bigint)
  }>;
  message: string;
}
```

### Get Liquidatable Loans

**Endpoint**: `GET /api/lending/liquidatable-loans`

**Query Parameters**: None

**Response**:
```typescript
{
  success: boolean;
  data: Array<{
    loanId: string;                // Loan ID (converted from bigint)
    borrower: string;              // Borrower address
    lender: string;                // Lender address
    collateralType: 'NFT' | 'FRACTIONAL'; // Type of collateral
    collateralAddress: string;     // Collateral contract address
    collateralTokenId: string;     // Collateral token ID (converted from bigint)
    collateralAmount: string;      // Collateral amount (converted from bigint)
    loanAmount: string;            // Loan amount (converted from bigint)
    interestRate: string;          // Interest rate (converted from bigint)
    duration: string;              // Loan duration (converted from bigint)
    startTime: string;             // Start timestamp (converted from bigint)
    endTime: string;               // End timestamp (converted from bigint)
    status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED'; // Loan status
    totalRepayment: string;        // Total repayment amount (converted from bigint)
    amountRepaid: string;          // Amount already repaid (converted from bigint)
  }>;
  message: string;
}
```

## 🪙 Token Operations API

### Approve ERC-20 Token

**Endpoint**: `POST /api/tokens/approve`

**Request Body**:
```typescript
{
  tokenAddress: string;            // ERC-20 token contract address (required)
  amount: number;                  // Amount to approve (required)
  spender: string;                 // Spender address (required)
}
```

**Response (Backend Mode)**:
```typescript
{
  success: boolean;
  txHash: string;                  // Transaction hash
  message: string;
}
```

**Response (Frontend Mode)**:
```typescript
{
  success: boolean;
  contractCall: ContractCallObject; // Contract call for wagmi
  message: string;
}
```

## 📋 API Reference Summary

### Asset Management Endpoints (7 total)

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/assets/metadata` | Create asset metadata | Metadata object | AssetMetadata |
| POST | `/api/assets/mint` | Mint asset NFT | MintAssetParams | tokenId, txHash |
| GET | `/api/assets/user/:userAddress` | Get user's assets | userAddress | Array of tokenIds |
| GET | `/api/assets/:tokenId/info` | Get asset details | tokenId | Full AssetInfo |
| GET | `/api/assets/:tokenId/owner` | Get asset owner | tokenId | owner address |
| GET | `/api/assets/balance/:userAddress` | Get asset count | userAddress | balance count |
| GET | `/api/assets/:tokenId/appraisal-history` | Get appraisal history | tokenId | Array of appraisals |

### Fractionalization Endpoints (12 total)

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/fractionalization/approve` | Approve for fractionalization | tokenId | txHash/contractCall |
| POST | `/api/fractionalization/fractionalize` | Fractionalize NFT | tokenId, supply, price | assetId, txHash |
| POST | `/api/fractionalization/redeem` | Redeem fractional tokens | contract, amount | txHash/contractCall |
| GET | `/api/fractionalization/approval-status/:tokenId` | Check approval | tokenId | isApproved boolean |
| GET | `/api/fractionalization/asset/:assetId` | Get fractionalized asset | assetId | FractionalizationInfo |
| GET | `/api/fractionalization/reserve/:assetId` | Get reserve data | assetId | ReserveData |
| GET | `/api/fractionalization/token-info/:tokenContract` | Get asset ID from token | tokenContract | assetId |
| GET | `/api/fractionalization/balance/:assetId/:userAddress` | Get token balance | assetId, userAddress | balance |
| POST | `/api/fractionalization/verify-token` | Verify fractional token | tokenContract | Verification data |
| POST | `/api/fractionalization/token-value` | Get token value | contract, amount | value in wei |
| POST | `/api/fractionalization/request-verification` | Request reserve verification | assetId | txHash/contractCall |
| GET | `/api/fractionalization/verification-status/:assetId` | Get verification status | assetId | Array of requests |

### Lending Endpoints (15 total)

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/lending/provide-liquidity` | Provide liquidity | tokenAddress, amount | txHash, lpToken |
| POST | `/api/lending/withdraw-liquidity` | Withdraw liquidity | lpTokenAmount, tokenAddress, amount | txHash/contractCall |
| POST | `/api/lending/approve-asset` | Approve NFT for lending | tokenId | txHash/contractCall |
| GET | `/api/lending/approval-status/:tokenId` | Check lending approval | tokenId | isApproved boolean |
| GET | `/api/lending/recommended-amount/:tokenId/:loanTokenAddress` | Get loan recommendation | tokenId, loanTokenAddress | Loan amounts & LTV |
| POST | `/api/lending/create-loan` | Create NFT loan | Loan parameters | loanId, txHash |
| POST | `/api/lending/repay-loan` | Repay loan | loanId, amount | txHash/contractCall |
| POST | `/api/lending/liquidate-loan` | Liquidate loan | loanId | txHash/contractCall |
| GET | `/api/lending/loan/:loanId` | Get loan details | loanId | Full LoanInfo |
| GET | `/api/lending/total-owed/:loanId` | Calculate total owed | loanId | totalOwed amount |
| GET | `/api/lending/liquidatable/:loanId` | Check if liquidatable | loanId | isLiquidatable boolean |
| GET | `/api/lending/health-ratio/:loanId` | Get health ratio | loanId | healthRatio number |
| GET | `/api/lending/user-loans/:userAddress` | Get user's loans | userAddress | Array of loanIds |
| GET | `/api/lending/active-loans` | Get all active loans | None | Array of LoanInfo |
| GET | `/api/lending/liquidatable-loans` | Get liquidatable loans | None | Array of LoanInfo |

### Token Operations Endpoints (1 total)

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/api/tokens/approve` | Approve ERC-20 token | tokenAddress, amount, spender | txHash/contractCall |

### System Endpoints

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| GET | `/api/health` | Health check | None | System status |

## 📝 Type Definitions

### Core Types

```typescript
// Asset status enumeration
enum AssetStatus {
    Active = 'Active',
    UnderReview = 'UnderReview',
    Frozen = 'Frozen',
    Liquidating = 'Liquidating'
}

// Chainlink request tracking
interface ChainlinkRequest {
    requestId: string;
    tokenId: bigint;
    requestType: 'METADATA_UPDATE' | 'AUTHENTICITY_CHECK' | 'RESERVE_VERIFICATION';
    timestamp: bigint;
    status: 'PENDING' | 'FULFILLED' | 'FAILED';
}

// Contract call object for frontend usage
interface ContractCallObject {
    address: string;
    abi: any[];
    functionName: string;
    args: any[];
    value?: bigint;
}
```

### Response Format

All API responses follow this consistent format:

```typescript
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}
```

### Error Types

```typescript
interface PlatformError {
    code: string;
    message: string;
    details?: any;
    contractAddress?: string;
    transactionHash?: string;
}
```

## 🚨 Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Operation failed",
  "error": "Detailed error message"
}
```

### Common Error Scenarios

1. **Insufficient Balance**: User lacks required tokens/ETH
2. **Invalid Token ID**: Token doesn't exist or not owned
3. **Approval Required**: Token not approved for operation
4. **Network Issues**: RPC connection problems
5. **Contract Errors**: Smart contract reverts

## 📋 Examples

### Complete Asset Lifecycle

```typescript
// 1. Create and mint asset
const metadata = await fetch('/api/assets/metadata', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Premium Artwork",
    description: "Original painting by renowned artist",
    image: "ipfs://QmArtworkImage",
    attributes: [
      { trait_type: "Artist", value: "John Doe" },
      { trait_type: "Year", value: 2023 }
    ]
  })
});

const mintResult = await fetch('/api/assets/mint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: "0x742d35Cc6634C0532925a3b8D82C57B3e7B3aaB5",
    assetType: "artwork",
    physicalLocation: "Secure Art Storage Facility",
    appraisalValueUSD: 150000,
    custodian: "SecureArt Storage",
    authenticityCertHash: "0xabc123...",
    metadataURI: "ipfs://QmMetadata..."
  })
});

// 2. Fractionalize the asset
await fetch('/api/fractionalization/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tokenId: "1" })
});

await fetch('/api/fractionalization/fractionalize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenId: "1",
    fractionalSupply: "1000000",
    reservePrice: "100"
  })
});

// 3. Use as collateral for loan
await fetch('/api/lending/approve-asset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tokenId: "1" })
});

await fetch('/api/lending/create-loan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assetNftContract: "0x...",
    tokenId: "1",
    loanTokenAddress: "0x...",
    amount: 50000,
    intrestRate: 500, // 5%
    duration: 2592000 // 30 days
  })
});
```

### Frontend Integration (wagmi)

```typescript
import { useContractWrite } from 'wagmi';

function MintAssetComponent() {
  const [contractCall, setContractCall] = useState(null);
  
  const { write } = useContractWrite({
    address: contractCall?.address,
    abi: contractCall?.abi,
    functionName: contractCall?.functionName,
    args: contractCall?.args,
    value: contractCall?.value,
  });

  const handleMint = async () => {
    const response = await fetch('/api/assets/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: address,
        assetType: "artwork",
        // ... other parameters
      })
    });
    
    const result = await response.json();
    if (result.success && result.contractCall) {
      setContractCall(result.contractCall);
      write();
    }
  };

  return (
    <button onClick={handleMint}>
      Mint Asset NFT
    </button>
  );
}
```

## 🔐 Best Practices

### Security

1. **Always validate inputs** on both client and server side
2. **Use HTTPS** for all API communications
3. **Store private keys securely** (environment variables, key management)
4. **Implement rate limiting** to prevent abuse
5. **Validate contract addresses** before operations

### Performance

1. **Cache frequently accessed data** (contract addresses, metadata)
2. **Use connection pooling** for RPC calls
3. **Implement retry logic** for network failures
4. **Batch operations** when possible
5. **Monitor gas prices** and adjust accordingly

### Error Handling

1. **Provide meaningful error messages** to users
2. **Log errors comprehensively** for debugging
3. **Implement graceful degradation** for non-critical failures
4. **Use exponential backoff** for retries
5. **Monitor transaction status** and handle failures

### Development

1. **Use TypeScript** for type safety
2. **Write comprehensive tests** for all endpoints
3. **Document API changes** and version appropriately
4. **Use environment-specific configurations**
5. **Implement proper logging** and monitoring

## 📊 Monitoring & Analytics

### Key Metrics to Track

- **Transaction Success Rate**: Monitor failed vs successful transactions
- **Gas Usage**: Track gas consumption across operations
- **Response Times**: API endpoint performance
- **Error Rates**: Frequency and types of errors
- **User Activity**: Most used features and endpoints

### Health Checks

```bash
# Basic health check
curl http://localhost:3000/api/health

# Network connectivity
curl http://localhost:3000/api/assets/balance/0x0000000000000000000000000000000000000000
```

## 🤝 Support

For questions, issues, or contributions:

1. Check the [API Documentation](http://localhost:3000/api/health)
2. Review error logs for debugging information
3. Ensure all environment variables are correctly configured
4. Verify network connectivity and contract deployments

## 🔧 Frontend Integration Guide

### React + wagmi Integration

#### 1. Setup API Client

```typescript
// utils/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  contractCall?: {
    address: string;
    abi: any[];
    functionName: string;
    args: any[];
    value?: bigint;
  };
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Asset methods
  async mintAsset(params: {
    to: string;
    assetType: string;
    physicalLocation: string;
    appraisalValueUSD: number;
    custodian: string;
    authenticityCertHash: string;
    metadataURI: string;
  }) {
    return this.request('/assets/mint', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getUserAssets(userAddress: string) {
    return this.request<string[]>(`/assets/user/${userAddress}`);
  }

  async getAssetInfo(tokenId: string) {
    return this.request(`/assets/${tokenId}/info`);
  }

  // Fractionalization methods
  async fractionalizeAsset(params: {
    tokenId: string;
    fractionalSupply: string;
    reservePrice: string;
  }) {
    return this.request('/fractionalization/fractionalize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Lending methods
  async createLoan(params: {
    assetNftContract: string;
    tokenId: string;
    loanTokenAddress: string;
    amount: number;
    intrestRate: number;
    duration: number;
  }) {
    return this.request('/lending/create-loan', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();
```

#### 2. Custom Hooks for API Integration

```typescript
// hooks/useAssets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { apiClient } from '../utils/apiClient';

export function useUserAssets() {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: ['userAssets', address],
    queryFn: () => apiClient.getUserAssets(address!),
    enabled: !!address,
  });
}

export function useMintAsset() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  
  const { write, data: txData, isLoading: isWriteLoading } = useContractWrite();
  
  const { isLoading: isTxLoading } = useWaitForTransaction({
    hash: txData?.hash,
    onSuccess: () => {
      // Invalidate user assets query to refetch
      queryClient.invalidateQueries(['userAssets', address]);
    },
  });

  const mintMutation = useMutation({
    mutationFn: async (params: {
      assetType: string;
      physicalLocation: string;
      appraisalValueUSD: number;
      custodian: string;
      authenticityCertHash: string;
      metadataURI: string;
    }) => {
      const response = await apiClient.mintAsset({
        to: address!,
        ...params,
      });
      
      if (response.contractCall) {
        write({
          address: response.contractCall.address as `0x${string}`,
          abi: response.contractCall.abi,
          functionName: response.contractCall.functionName,
          args: response.contractCall.args,
          value: response.contractCall.value,
        });
      }
      
      return response;
    },
  });

  return {
    mintAsset: mintMutation.mutate,
    isLoading: mintMutation.isLoading || isWriteLoading || isTxLoading,
    error: mintMutation.error,
    isSuccess: mintMutation.isSuccess && !isTxLoading,
  };
}
```

#### 3. React Components

```typescript
// components/MintAssetForm.tsx
import React, { useState } from 'react';
import { useMintAsset } from '../hooks/useAssets';

export function MintAssetForm() {
  const [formData, setFormData] = useState({
    assetType: '',
    physicalLocation: '',
    appraisalValueUSD: 0,
    custodian: '',
    authenticityCertHash: '',
    metadataURI: '',
  });

  const { mintAsset, isLoading, error, isSuccess } = useMintAsset();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mintAsset(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Asset Type</label>
        <input
          type="text"
          value={formData.assetType}
          onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="e.g., real-estate, artwork"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Physical Location</label>
        <input
          type="text"
          value={formData.physicalLocation}
          onChange={(e) => setFormData({ ...formData, physicalLocation: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Custody location"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Appraisal Value (USD)</label>
        <input
          type="number"
          value={formData.appraisalValueUSD}
          onChange={(e) => setFormData({ ...formData, appraisalValueUSD: Number(e.target.value) })}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Custodian</label>
        <input
          type="text"
          value={formData.custodian}
          onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Custodian organization"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Authenticity Certificate Hash</label>
        <input
          type="text"
          value={formData.authenticityCertHash}
          onChange={(e) => setFormData({ ...formData, authenticityCertHash: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="IPFS hash"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Metadata URI</label>
        <input
          type="text"
          value={formData.metadataURI}
          onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="IPFS metadata URI"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Minting...' : 'Mint Asset NFT'}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm">
          Error: {error.message}
        </div>
      )}
      
      {isSuccess && (
        <div className="text-green-600 text-sm">
          Asset minted successfully!
        </div>
      )}
    </form>
  );
}
```

#### 4. Asset Display Component

```typescript
// components/AssetCard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';

interface AssetCardProps {
  tokenId: string;
}

export function AssetCard({ tokenId }: AssetCardProps) {
  const { data: assetInfo, isLoading, error } = useQuery({
    queryKey: ['assetInfo', tokenId],
    queryFn: () => apiClient.getAssetInfo(tokenId),
  });

  if (isLoading) return <div>Loading asset...</div>;
  if (error) return <div>Error loading asset</div>;
  if (!assetInfo?.data) return <div>Asset not found</div>;

  const asset = assetInfo.data;

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">Token #{tokenId}</h3>
        <span className="text-sm text-gray-500">{asset.assetType}</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Owner:</span> {asset.owner}
        </div>
        <div>
          <span className="font-medium">Location:</span> {asset.physicalLocation}
        </div>
        <div>
          <span className="font-medium">Appraisal:</span> ${parseInt(asset.appraisalValue) / 1e18} USD
        </div>
        <div>
          <span className="font-medium">Custodian:</span> {asset.custodian}
        </div>
        <div>
          <span className="font-medium">Authenticated:</span> 
          <span className={asset.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {asset.isAuthenticated ? ' ✓ Yes' : ' ✗ No'}
          </span>
        </div>
      </div>
      
      {asset.metadata && (
        <div className="mt-3">
          <h4 className="font-medium mb-1">Metadata</h4>
          <div className="text-sm text-gray-600">
            <div>{asset.metadata.name}</div>
            <div>{asset.metadata.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 5. Complete Integration Example

```typescript
// pages/dashboard.tsx
import React from 'react';
import { useAccount } from 'wagmi';
import { useUserAssets } from '../hooks/useAssets';
import { AssetCard } from '../components/AssetCard';
import { MintAssetForm } from '../components/MintAssetForm';

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: userAssets, isLoading, error } = useUserAssets();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Asset Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mint New Asset */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mint New Asset</h2>
          <MintAssetForm />
        </div>
        
        {/* User Assets */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Assets</h2>
          {isLoading && <div>Loading assets...</div>}
          {error && <div>Error loading assets</div>}
          {userAssets?.data && userAssets.data.length === 0 && (
            <div>No assets found</div>
          )}
          <div className="space-y-4">
            {userAssets?.data?.map((tokenId) => (
              <AssetCard key={tokenId} tokenId={tokenId} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Error Handling Best Practices

```typescript
// utils/errorHandling.ts
export function handleApiError(error: any) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Custom error boundary for API errors
export function ApiErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-4 border border-red-300 rounded bg-red-50">
          <h3 className="text-red-800 font-medium">API Error</h3>
          <p className="text-red-600 text-sm mt-1">{handleApiError(error)}</p>
          <button
            onClick={resetError}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded"
          >
            Try Again
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Type Definitions for Frontend

```typescript
// types/api.ts
export interface AssetMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
  custody_proof?: string;
  appraisal_value?: string;
  authenticity_certificate?: string;
}

export interface AssetInfo {
  tokenId: string;
  owner: string;
  assetType: string;
  physicalLocation: string;
  appraisalValue: string;
  lastAppraisalDate: string;
  isAuthenticated: boolean;
  custodian: string;
  authenticityCertHash: string;
  isCrossChain: boolean;
  originChain: string;
  metadata: AssetMetadata;
}

export interface LoanInfo {
  loanId: string;
  borrower: string;
  lender: string;
  collateralType: 'NFT' | 'FRACTIONAL';
  collateralAddress: string;
  collateralTokenId: string;
  collateralAmount: string;
  loanAmount: string;
  interestRate: string;
  duration: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED';
  totalRepayment: string;
  amountRepaid: string;
}

export interface FractionalizationInfo {
  assetId: string;
  nftContract: string;
  tokenId: string;
  originalOwner: string;
  fractionalSupply: string;
  reservePrice: string;
  isActive: boolean;
  creationTime: string;
  lastYieldDistribution: string;
  lastReserveCheck: string;
  status: 'Active' | 'UnderReview' | 'Frozen' | 'Liquidating';
  custodianEndpoint: string;
  fractionalTokenContract: string;
}
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-11  
**License**: MIT 