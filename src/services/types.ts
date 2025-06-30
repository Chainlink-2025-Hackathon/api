// Network and chain configuration
export interface NetworkConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorer?: string;
  }
  
  export interface ContractAddresses {
    assetNFT: string;
    fractionalizationVault: string;
    lendingContract: string;
    auctionContract: string;
    indexVault: string;
    launchpadContract: string;
    governanceContract?: string;
    governanceToken?: string;
    timelockController?: string;
    mockERC20?: string;
  }
  
  // Asset and NFT related types
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
  
  // Enhanced AssetInfo to match updated contract
  export interface AssetInfo {
    tokenId: bigint;
    owner: string;
    assetType: string;           // e.g., "artwork", "collectible", "real_estate"
    physicalLocation: string;    // custody information
    appraisalValue: bigint;      // in wei
    lastAppraisalDate: bigint;   // timestamp
    isAuthenticated: boolean;    // verified via Chainlink Functions
    custodian: string;           // who holds the physical asset
    authenticityCertHash: string; // IPFS hash of authenticity certificate
    isCrossChain: boolean;       // whether this is a cross-chain token
    originChain: bigint;         // original chain where the NFT was minted
    metadata: AssetMetadata;
  }
  
  // Cross-chain message types
  export interface CrossChainMessage {
    tokenId: bigint;
    recipient: string;
    metadataURI: string;
    assetInfo: AssetInfo;
    messageType: 'TRANSFER' | 'MINT' | 'METADATA_UPDATE';
  }
  
  // Fractionalization types - enhanced with new functionality
  export interface FractionalizationInfo {
    assetId: string;             // bytes32 asset ID
    nftContract: string;         // Address of the NFT contract
    tokenId: bigint;            // Token ID of the NFT
    originalOwner: string;       // Original owner who fractionalized
    fractionalSupply: bigint;    // Total supply of fractional tokens
    reservePrice: bigint;        // Minimum price for redemption
    isActive: boolean;           // Whether fractionalization is active
    creationTime: bigint;        // When fractionalization occurred
    lastYieldDistribution: bigint; // Last yield distribution timestamp
    lastReserveCheck: bigint;    // Last proof of reserve verification
    status: AssetStatus;         // Current status of the asset
    custodianEndpoint: string;   // API endpoint for custodian verification
    fractionalTokenContract: string; // Address of the asset-specific ERC-20 token contract
  }
  
  export enum AssetStatus {
    Active = 'Active',           // Normal operation
    UnderReview = 'UnderReview', // Pending verification
    Frozen = 'Frozen',          // Emergency freeze due to verification failure
    Liquidating = 'Liquidating' // In liquidation process
  }
  
  // Proof of Reserve types
  export interface ReserveData {
    isVerified: boolean;         // Whether reserves are verified
    lastVerification: bigint;    // Timestamp of last verification
    consecutiveFailures: bigint; // Number of consecutive verification failures
    lastRequestId: string;       // Last Chainlink Functions request ID
  }
  
  // Voting types for fractionalization
  export interface VotingInfo {
    endTime: bigint;            // When voting ends
    yesVotes: bigint;           // Votes in favor
    noVotes: bigint;            // Votes against
    totalVotes: bigint;         // Total votes cast
    proposedReservePrice: bigint; // Proposed new reserve price
    isActive: boolean;          // Whether voting is active
  }
  
  export interface FractionalToken {
    address: string;
    name: string;
    symbol: string;
    totalSupply: bigint;
    decimals: number;
    underlyingNFT: bigint;
  }
  
  // Lending types
  export interface LoanInfo {
    loanId: bigint;
    borrower: string;
    lender: string;
    collateralType: 'NFT' | 'FRACTIONAL';
    collateralAddress: string;
    collateralTokenId: bigint;
    collateralAmount: bigint;
    loanAmount: bigint;
    interestRate: bigint;
    duration: bigint;
    startTime: bigint;
    endTime: bigint;
    status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED';
    totalRepayment: bigint;
    amountRepaid: bigint;
  }
  
  export interface LoanRequest {
    collateralType: 'NFT' | 'FRACTIONAL';
    collateralAddress: string;
    collateralTokenId: bigint;
    collateralAmount: bigint;
    requestedAmount: bigint;
    duration: bigint;
    maxInterestRate: bigint;
  }
  
  // Auction types
  export interface AuctionInfo {
    auctionId: bigint;
    seller: string;
    tokenAddress: string;
    tokenId: bigint;
    tokenAmount: bigint;
    startingPrice: bigint;
    reservePrice: bigint;
    currentHighestBid: bigint;
    currentHighestBidder: string;
    startTime: bigint;
    endTime: bigint;
    status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
    isLiquidation: boolean;
    auctionType?: 'ENGLISH' | 'DUTCH';
  }
  
  export interface BidInfo {
    bidder: string;
    amount: bigint;
    timestamp: bigint;
    isActive: boolean;
  }
  
  // Index Vault types
  export interface IndexVaultInfo {
    vaultAddress: string;
    name: string;
    symbol: string;
    totalAssets: bigint;
    totalSupply: bigint;
    sharePrice: bigint;
    managementFee: bigint;
    performanceFee: bigint;
    manager: string;
    isActive: boolean;
  }
  
  export interface VaultAsset {
    tokenAddress: string;
    tokenId: bigint;
    amount: bigint;
    weight: bigint;
    lastPrice: bigint;
    lastUpdated: bigint;
  }
  
  // Enhanced Governance types
  export enum ProposalType {
    GENERAL = 'GENERAL',
    PARAMETER_UPDATE = 'PARAMETER_UPDATE',
    TREASURY_SPEND = 'TREASURY_SPEND',
    EMERGENCY = 'EMERGENCY'
  }
  
  export interface ProposalInfo {
    proposalId: bigint;
    proposer: string;
    title: string;
    description: string;
    targets: string[];
    values: bigint[];
    calldatas: string[];
    startBlock: bigint;
    endBlock: bigint;
    forVotes: bigint;
    againstVotes: bigint;
    abstainVotes: bigint;
    status: 'PENDING' | 'ACTIVE' | 'CANCELED' | 'DEFEATED' | 'SUCCEEDED' | 'QUEUED' | 'EXPIRED' | 'EXECUTED';
    eta: bigint;
    proposalType?: ProposalType;
    creationTime?: bigint;
  }
  
  export interface VoteInfo {
    voter: string;
    proposalId: bigint;
    support: 'FOR' | 'AGAINST' | 'ABSTAIN';
    weight: bigint;
    reason?: string;
  }
  
  // Chainlink types
  export interface ChainlinkRequest {
    requestId: string;
    tokenId: bigint;
    requestType: 'METADATA_UPDATE' | 'AUTHENTICITY_CHECK' | 'RESERVE_VERIFICATION';
    timestamp: bigint;
    status: 'PENDING' | 'FULFILLED' | 'FAILED';
  }
  
  // Transaction types
  export interface TransactionRequest {
    to: string;
    data: string;
    value?: bigint;
    gasLimit?: bigint;
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
  }
  
  export interface TransactionResponse {
    hash: string;
    blockNumber?: number;
    blockHash?: string;
    timestamp?: number;
    confirmations: number;
    from: string;
    to?: string;
    value: bigint;
    gasLimit: bigint;
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    gasUsed?: bigint;
    status?: number;
  }
  
  // Event types
  export interface EventFilter {
    address?: string;
    topics?: (string | string[])[];
    fromBlock?: number | 'latest';
    toBlock?: number | 'latest';
  }
  
  export interface EventLog {
    address: string;
    topics: string[];
    data: string;
    blockNumber: number;
    blockHash: string;
    transactionHash: string;
    transactionIndex: number;
    logIndex: number;
    removed: boolean;
  }
  
  // Error types
  export interface PlatformError {
    code: string;
    message: string;
    details?: any;
    contractAddress?: string;
    transactionHash?: string;
  }
  
  // SDK Configuration
  export interface SDKConfig {
    networkConfig: NetworkConfig;
    contractAddresses: ContractAddresses;
    provider?: any;
    signer?: any;
    usageType?: 'Backend' | 'Frontend';
    defaultGasLimit?: bigint;
    defaultGasPrice?: bigint;
    retryAttempts?: number;
    retryDelay?: number;
  }
  
  // Utility types
  export type Address = string;
  export type Hash = string;
  export type Bytes = string;
  
  // Chainlink price feed data
  export interface ChainlinkPriceData {
    price: bigint;
    updatedAt: bigint;
    round: bigint;
    startedAt: bigint;
    answeredInRound: bigint;
  }
  
  // Proof of Reserve data
  export interface ProofOfReserveData {
    assetId: string;
    reserveAmount: bigint;
    lastVerified: bigint;
    custodian: string;
    isVerified: boolean;
  }
  
  // Event subscription types
  export type EventCallback<T = any> = (event: T) => void;
  
  export interface EventSubscription {
    unsubscribe: () => void;
  }
  
  // Query and pagination types
  export interface QueryOptions {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }
  
  // New type for frontend usage (wagmi-compatible)
  export interface ContractCallObject {
    address: string;
    abi: any[];
    functionName: string;
    args: any[];
    value?: bigint;
  } 