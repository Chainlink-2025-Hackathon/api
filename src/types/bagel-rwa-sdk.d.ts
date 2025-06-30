// declare module '@bagel-rwa/sdk' {
//   import { ethers } from 'ethers';

//   export interface BagelsRWAConfig {
//     usageType: 'Backend' | 'Frontend';
//     networkConfig: {
//       chainId: number;
//       name: string;
//       rpcUrl: string;
//     };
//     contractAddresses: {
//       assetNFT: string;
//       fractionalizationVault: string;
//       lendingContract: string;
//       auctionContract: string;
//       indexVault: string;
//       governanceContract?: string;
//       governanceToken?: string;
//     };
//     signer?: ethers.Wallet;
//   }

//   export interface TransactionResult {
//     txHash: string;
//     tokenId?: bigint;
//     loanId?: bigint;
//     auctionId?: bigint;
//     requestId?: string;
//     vaultAddress?: string;
//     sharesPurchased?: bigint;
//     averagePrice?: bigint;
//     ethReceived?: bigint;
//     poolTokens?: bigint;
//     yieldEarned?: bigint;
//     autoApproved?: boolean;
//     originalValueETH?: bigint;
//     convertedValueUSD?: bigint;
//     conversionRate?: bigint;
//   }

//   export interface AssetInfo {
//     tokenId: bigint;
//     owner: string;
//     assetType: string;
//     physicalLocation: string;
//     appraisalValue: bigint;
//     lastAppraisalDate: bigint;
//     isAuthenticated: boolean;
//     custodian: string;
//     authenticityCertHash: string;
//     isCrossChain: boolean;
//     originChain?: bigint;
//     metadata: any;
//   }

//   export interface LoanInfo {
//     loanId: bigint;
//     borrower: string;
//     lender: string;
//     collateralToken: string;
//     collateralTokenId: bigint;
//     loanAmount: bigint;
//     interestRate: bigint;
//     duration: bigint;
//     startTime: bigint;
//     endTime: bigint;
//     amountRepaid: bigint;
//     isActive: boolean;
//     isDefaulted: boolean;
//     liquidationThreshold: bigint;
//     collateralValue: bigint;
//     healthFactor: bigint;
//   }

//   export interface AuctionInfo {
//     auctionId: bigint;
//     seller: string;
//     tokenAddress: string;
//     tokenId: bigint;
//     startingPrice: bigint;
//     reservePrice: bigint;
//     currentBid: bigint;
//     highestBidder: string;
//     startTime: bigint;
//     endTime: bigint;
//     duration: bigint;
//     auctionType: string;
//     isActive: boolean;
//     isSettled: boolean;
//     isCanceled: boolean;
//     bidCount: bigint;
//     reserveMet: boolean;
//     custodianVerified: boolean;
//   }

//   export interface FractionalizationInfo {
//     vaultAddress: string;
//     curator: string;
//     tokenAddress: string;
//     tokenId: bigint;
//     totalSupply: bigint;
//     reservePrice: bigint;
//     isRedeemable: boolean;
//     isCurated: boolean;
//     pricePerShare: bigint;
//     totalShares: bigint;
//     availableShares: bigint;
//     marketCap: bigint;
//     lastTradePrice: bigint;
//     createdAt: bigint;
//     custodianVerified: boolean;
//   }

//   // New interfaces for enhanced functionality
//   export interface AppraisalValidationResult {
//     isValid: boolean;
//     issues: string[];
//     recommendations: string[];
//     currentFormat: string;
//     requiredFormat: string;
//   }

//   export interface LoanValidationResult {
//     isValid: boolean;
//     issues: string[];
//     warnings: string[];
//     recommendations: string[];
//     maxLoanAmount?: bigint;
//     suggestedInterestRate?: bigint;
//     collateralValue?: bigint;
//     ltv?: bigint;
//   }

//   export interface LoanRecommendation {
//     collateralValue: bigint;
//     recommendedAmount: bigint;
//     maxAmount: bigint;
//     minAmount: bigint;
//     ltv: bigint;
//     suggestedInterestRate: bigint;
//     suggestedDuration: bigint;
//     riskFactors: string[];
//   }

//   export interface UserPoolPosition {
//     poolTokenBalance: bigint;
//     underlyingAssetBalance: bigint;
//     yieldEarned: bigint;
//     totalYieldEarned: bigint;
//     apy: bigint;
//     deposits: Array<{
//       amount: bigint;
//       timestamp: bigint;
//       lockupPeriod: bigint;
//       maturityDate: bigint;
//     }>;
//   }

//   export interface PoolYieldData {
//     currentAPY: bigint;
//     averageAPY: bigint;
//     totalValueLocked: bigint;
//     totalLoansOutstanding: bigint;
//     utilizationRate: bigint;
//     totalInterestEarned: bigint;
//     poolHealth: string;
//   }

//   export interface AppraisalFormatResult {
//     value: bigint;
//     formattedValue: string;
//     decimals: number;
//     unit: string;
//   }

//   export class BagelsRWA {
//     constructor(config: BagelsRWAConfig);
    
//     assetNFT: {
//       mintAsset(to: string, assetType: string, physicalLocation: string, appraisalValue: bigint, custodian: string, authenticityCertHash: string, metadataURI: string): Promise<TransactionResult>;
//       mintAssetWithUSDAppraisal(to: string, assetType: string, physicalLocation: string, appraisalValue: bigint, custodian: string, authenticityCertHash: string, metadataURI: string): Promise<TransactionResult>;
//       getAssetInfo(tokenId: bigint): Promise<AssetInfo>;
//       updateAssetInfo(tokenId: bigint, appraisalValue: bigint, physicalLocation: string): Promise<string>;
//       updateAppraisalToUSD(tokenId: bigint, appraisalValueUSD: bigint): Promise<string>;
//       validateAppraisalForLending(tokenId: bigint): Promise<AppraisalValidationResult>;
//       convertETHToUSDAppraisal(tokenId: bigint, ethToUsdRate: bigint): Promise<TransactionResult>;
//       getAppraisalValueInFormat(tokenId: bigint, format: 'ETH' | 'USD' | 'WEI' | 'GWEI'): Promise<AppraisalFormatResult>;
//       requestMetadataUpdate(tokenId: bigint): Promise<{ requestId: string; txHash: string }>;
//       transferCrossChain(tokenId: bigint, destinationChainSelector: bigint, recipient: string): Promise<string>;
//       estimateCrossChainFee(tokenId: bigint, destinationChain: bigint, recipient: string): Promise<bigint>;
//       getTokensOwnedBy(owner: string): Promise<bigint[]>;
//       getAppraisalHistory(tokenId: bigint): Promise<any[]>;
//     };

//     lending: {
//       createLoan(collateralToken: string, collateralTokenId: bigint, loanAmount: bigint, interestRate: bigint, duration: bigint, custodianEndpoint: string): Promise<TransactionResult>;
//       createNFTLoan(collateralToken: string, collateralTokenId: bigint, loanAmount: bigint, interestRate: bigint, duration: bigint, custodianEndpoint: string, autoApprove: boolean): Promise<TransactionResult>;
//       approveNFTForLending(tokenAddress: string, tokenId: bigint): Promise<string>;
//       isNFTApprovedForLending(tokenAddress: string, tokenId: bigint, owner: string): Promise<boolean>;
//       validateLoanParameters(collateralToken: string, collateralTokenId: bigint, loanAmount: bigint, interestRate: bigint, duration: bigint): Promise<LoanValidationResult>;
//       getRecommendedLoanAmount(tokenAddress: string, tokenId: bigint, riskLevel: 'conservative' | 'moderate' | 'aggressive'): Promise<LoanRecommendation>;
//       addLiquidityToPool(amount: bigint, duration: bigint): Promise<TransactionResult>;
//       removeLiquidityFromPool(poolTokenAmount: bigint): Promise<TransactionResult>;
//       getUserPoolPosition(userAddress: string): Promise<UserPoolPosition>;
//       calculatePoolYield(): Promise<PoolYieldData>;
//       getLoanInfo(loanId: bigint): Promise<LoanInfo>;
//       repayLoan(loanId: bigint): Promise<string>;
//       partialRepayLoan(loanId: bigint, amount: bigint): Promise<string>;
//       liquidate(loanId: bigint, liquidator: string): Promise<string>;
//       calculateHealthFactor(loanId: bigint): Promise<bigint>;
//       getLoansByBorrower(borrower: string): Promise<any[]>;
//       getLoansByLender(lender: string): Promise<any[]>;
//       getLoansAtRisk(threshold: bigint): Promise<any[]>;
//       updateCollateralValue(loanId: bigint): Promise<string>;
//       getPoolStats(): Promise<any>;
//       calculateMaxLoanAmount(tokenAddress: string, tokenId: bigint, amount: bigint): Promise<bigint>;
//     };

//     auction: {
//       createAuction(tokenAddress: string, tokenId: bigint, startingPrice: bigint, reservePrice: bigint, duration: bigint, auctionType: string, custodianEndpoint: string): Promise<TransactionResult>;
//       getAuctionInfo(auctionId: bigint): Promise<AuctionInfo>;
//       placeBid(auctionId: bigint, bidAmount: bigint, bidder: string): Promise<string>;
//       settleAuction(auctionId: bigint): Promise<{ winner: string; finalPrice: bigint; txHash: string }>;
//       cancelAuction(auctionId: bigint): Promise<string>;
//       extendAuction(auctionId: bigint, additionalTime: bigint): Promise<string>;
//       getAuctionBids(auctionId: bigint): Promise<any[]>;
//       getActiveAuctions(limit: bigint, offset: bigint): Promise<any[]>;
//       getAuctionsBySeller(seller: string): Promise<any[]>;
//       getAuctionsByBidder(bidder: string): Promise<any[]>;
//       withdrawBid(auctionId: bigint, bidder: string): Promise<string>;
//       getAuctionStats(): Promise<any>;
//       getAuctionsNeedingSettlement(): Promise<any[]>;
//     };

//     fractionalization: {
//       fractionalize(tokenAddress: string, tokenId: bigint, fractionalSupply: bigint, reservePrice: bigint, custodianEndpoint: string): Promise<TransactionResult>;
//       getFractionalizationInfo(vaultAddress: string): Promise<FractionalizationInfo>;
//       buyFractionalShares(vaultAddress: string, amount: bigint, buyer: string): Promise<TransactionResult>;
//       sellFractionalShares(vaultAddress: string, shareAmount: bigint, seller: string): Promise<TransactionResult>;
//       redeemFractionalAsset(vaultAddress: string, redeemer: string): Promise<TransactionResult>;
//       updateReservePrice(vaultAddress: string, newReservePrice: bigint): Promise<string>;
//       getUserShares(vaultAddress: string, userAddress: string): Promise<bigint>;
//       getUserVaults(userAddress: string): Promise<any[]>;
//       getActiveVaults(limit: bigint, offset: bigint): Promise<any[]>;
//       getVaultTradingHistory(vaultAddress: string, limit: bigint): Promise<any[]>;
//       previewBuy(vaultAddress: string, amount: bigint): Promise<any>;
//       previewSell(vaultAddress: string, shareAmount: bigint): Promise<any>;
//       getFractionalizationStats(): Promise<any>;
//     };

//     indexVault: {
//       invest(amount: bigint, strategy: 'balanced' | 'growth' | 'conservative'): Promise<TransactionResult>;
//       withdraw(shares: bigint, recipient: string): Promise<TransactionResult>;
//       getVaultInfo(): Promise<any>;
//       getUserShares(userAddress: string): Promise<bigint>;
//       getPerformanceMetrics(): Promise<any>;
//       getPortfolioComposition(): Promise<any[]>;
//       rebalancePortfolio(weights: Array<{ assetId: bigint; weight: bigint }>): Promise<string>;
//       getVaultStats(): Promise<any>;
//       previewInvestment(amount: bigint, strategy: 'balanced' | 'growth' | 'conservative'): Promise<any>;
//     };

//     launchpad: {
//       listNFT(params: {
//         nftContract: string;
//         tokenId: bigint;
//         price: bigint;
//         paymentToken?: string;
//         duration?: number;
//       }): Promise<TransactionResult>;
//       purchaseNFT(listingId: bigint, value?: bigint): Promise<string>;
//       cancelNFTListing(listingId: bigint): Promise<string>;
//       listFractionalTokens(params: {
//         fractionalTokenContract: string;
//         tokenAmount: bigint;
//         pricePerToken: bigint;
//         paymentToken?: string;
//         duration?: number;
//       }): Promise<TransactionResult>;
//       purchaseFractionalTokens(listingId: bigint, tokenAmount: bigint, value?: bigint): Promise<string>;
//       makeNFTOffer(listingId: bigint, offerAmount: bigint, paymentToken?: string, duration?: number, value?: bigint): Promise<TransactionResult>;
//       acceptNFTOffer(offerId: bigint): Promise<string>;
//       cancelOffer(offerId: bigint): Promise<string>;
//       getNFTListing(listingId: bigint): Promise<any>;
//       getFractionalListing(listingId: bigint): Promise<any>;
//       getOffer(offerId: bigint): Promise<any>;
//       getUserNFTListings(user: string): Promise<any[]>;
//       getUserFractionalListings(user: string): Promise<any[]>;
//       getUserOffers(user: string): Promise<any[]>;
//       getUserPurchases(user: string): Promise<any[]>;
//       getStats(): Promise<any>;
//       isVerifiedNFTContract(contractAddress: string): Promise<boolean>;
//       isSupportedPaymentToken(tokenAddress: string): Promise<boolean>;
//       getPlatformFee(): Promise<bigint>;
//       getTreasury(): Promise<string>;
//     };

//     switchNetwork(networkName: string): Promise<BagelsRWA>;
//     getNonceInfo(): Promise<any>;
//     subscribeToEvent(contract: string, event: string, callback: (event: any) => void): any;
//   }

//   export { ethers };
//   export type TransactionResponse = TransactionResult;
// } 