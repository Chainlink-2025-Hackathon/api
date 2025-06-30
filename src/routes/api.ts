import { Router } from 'express';
import { Features } from '../services/features';

// Import all controllers
import { AssetController } from '../controllers/assetController';
import { FractionalizationController } from '../controllers/fractionalizationController';
import { LendingController } from '../controllers/lendingController';
import { TokenController } from '../controllers/tokenController';

export function createApiRoutes(features: Features): Router {
  const router = Router();

  // Initialize controllers
  const assetController = new AssetController(features);
  const fractionalizationController = new FractionalizationController(features);
  const lendingController = new LendingController(features);
  const tokenController = new TokenController(features);

  // API health check
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Chainlink NFT DeFi API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // ====== ASSET ROUTES ======
  const assetRoutes = Router();
  
  // Asset metadata routes
  assetRoutes.post('/metadata', assetController.createMetadata);
  
  // Asset NFT routes
  assetRoutes.post('/mint', assetController.mintAsset);
  assetRoutes.get('/user/:userAddress', assetController.getUserAssets);
  assetRoutes.get('/:tokenId/info', assetController.getAssetInfo);
  assetRoutes.get('/:tokenId/owner', assetController.getAssetOwner);
  assetRoutes.get('/balance/:userAddress', assetController.getAssetBalance);
  assetRoutes.get('/:tokenId/appraisal-history', assetController.getAppraisalHistory);
  
  router.use('/assets', assetRoutes);

  // ====== FRACTIONALIZATION ROUTES ======
  const fractionalizationRoutes = Router();
  
  // Fractionalization operations
  fractionalizationRoutes.post('/approve', fractionalizationController.approveAssetForFractionalization);
  fractionalizationRoutes.post('/fractionalize', fractionalizationController.fractionalizeAsset);
  fractionalizationRoutes.post('/redeem', fractionalizationController.redeemAsset);
  
  // Status and info routes
  fractionalizationRoutes.get('/approval-status/:tokenId', fractionalizationController.checkApprovalStatus);
  fractionalizationRoutes.get('/asset/:assetId', fractionalizationController.getFractionalizedAsset);
  fractionalizationRoutes.get('/reserve/:assetId', fractionalizationController.getReserveData);
  fractionalizationRoutes.get('/token-info/:tokenContract', fractionalizationController.getFractionalizedAssetInfo);
  fractionalizationRoutes.get('/balance/:assetId/:userAddress', fractionalizationController.getAssetTokenBalance);
  
  // Token operations
  fractionalizationRoutes.post('/verify-token', fractionalizationController.verifyFractionalizedToken);
  fractionalizationRoutes.post('/token-value', fractionalizationController.getTokenValue);
  
  // Chainlink Functions integration
  fractionalizationRoutes.post('/request-verification', fractionalizationController.requestReserveVerification);
  fractionalizationRoutes.get('/verification-status/:assetId', fractionalizationController.getReserveVerificationStatus);
  
  router.use('/fractionalization', fractionalizationRoutes);

  // ====== LENDING ROUTES ======
  const lendingRoutes = Router();
  
  // Liquidity operations
  lendingRoutes.post('/provide-liquidity', lendingController.provideLiquidity);
  lendingRoutes.post('/withdraw-liquidity', lendingController.withdrawLiquidity);
  lendingRoutes.post('/approve-token-for-lending', lendingController.approveTokenForLending);
  
  // Asset approval for lending
  lendingRoutes.post('/approve-asset', lendingController.approveAssetForLoan);
  lendingRoutes.get('/approval-status/:tokenId', lendingController.checkLendingApprovalStatus);
  
  // Loan operations
  lendingRoutes.get('/recommended-amount/:tokenId/:loanTokenAddress', lendingController.getRecommendedLoanAmount);
  lendingRoutes.post('/create-loan', lendingController.createNFTLoan);
  lendingRoutes.post('/repay-loan', lendingController.repayLoan);
  lendingRoutes.post('/liquidate-loan', lendingController.liquidateLoan);
  
  // Loan information
  lendingRoutes.get('/loan/:loanId', lendingController.getLoanInfo);
  lendingRoutes.get('/total-owed/:loanId', lendingController.calculateTotalOwed);
  lendingRoutes.get('/liquidatable/:loanId', lendingController.isLiquidatable);
  lendingRoutes.get('/health-ratio/:loanId', lendingController.calculateLoanHealthRatio);
  
  // User and system-wide loan queries
  lendingRoutes.get('/user-loans/:userAddress', lendingController.getUserLoans);
  lendingRoutes.get('/active-loans', lendingController.getActiveLoans);
  lendingRoutes.get('/liquidatable-loans', lendingController.getLiquidatableLoans);
  
  router.use('/lending', lendingRoutes);

  // ====== TOKEN ROUTES ======
  const tokenRoutes = Router();
  
  // ERC-20 token operations
  tokenRoutes.post('/approve', tokenController.approveToken);
  tokenRoutes.post('/mint-usdc', tokenController.mintUSDC);
  router.use('/tokens', tokenRoutes);

  // ====== 404 HANDLER ======
  router.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.originalUrl,
      availableEndpoints: [
        'GET /api/health',
        'POST /api/assets/mint',
        'GET /api/assets/:tokenId/info',
        'GET /api/assets/user/:userAddress',
        'POST /api/lending/create-loan',
        'GET /api/lending/loan/:loanId',
        'POST /api/fractionalization/fractionalize',
        'GET /api/fractionalization/asset/:assetId',
        'POST /api/tokens/approve'
      ]
    });
  });

  return router;
} 