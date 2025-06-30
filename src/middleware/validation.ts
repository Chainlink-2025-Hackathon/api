import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

/**
 * Ethereum address validation
 */
export const isEthereumAddress = (value: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};

/**
 * Validation rules for asset operations
 */
export const validateMintAsset = [
  body('to').custom(isEthereumAddress).withMessage('Invalid recipient address'),
  body('assetType').isString().notEmpty().withMessage('Asset type is required'),
  body('physicalLocation').isString().notEmpty().withMessage('Physical location is required'),
  body('appraisalValue').isNumeric().withMessage('Appraisal value must be numeric'),
  body('custodian').isString().notEmpty().withMessage('Custodian is required'),
  handleValidationErrors
];

export const validateUpdateAsset = [
  param('tokenId').isNumeric().withMessage('Token ID must be numeric'),
  body('appraisalValue').isNumeric().withMessage('Appraisal value must be numeric'),
  body('physicalLocation').isString().notEmpty().withMessage('Physical location is required'),
  handleValidationErrors
];

export const validateCrossChainTransfer = [
  param('tokenId').isNumeric().withMessage('Token ID must be numeric'),
  body('destinationChainSelector').isNumeric().withMessage('Destination chain selector must be numeric'),
  body('recipient').custom(isEthereumAddress).withMessage('Invalid recipient address'),
  handleValidationErrors
];

/**
 * Validation rules for lending operations
 */
export const validateCreateLoan = [
  body('collateralToken').custom(isEthereumAddress).withMessage('Invalid collateral token address'),
  body('collateralTokenId').isNumeric().withMessage('Collateral token ID must be numeric'),
  body('loanAmount').isNumeric().withMessage('Loan amount must be numeric'),
  body('interestRate').isNumeric().withMessage('Interest rate must be numeric'),
  body('duration').isNumeric().withMessage('Duration must be numeric'),
  handleValidationErrors
];

export const validateLiquidateLoan = [
  param('loanId').isNumeric().withMessage('Loan ID must be numeric'),
  body('liquidator').custom(isEthereumAddress).withMessage('Invalid liquidator address'),
  handleValidationErrors
];

/**
 * Validation rules for auction operations
 */
export const validateCreateAuction = [
  body('tokenAddress').custom(isEthereumAddress).withMessage('Invalid token address'),
  body('tokenId').isNumeric().withMessage('Token ID must be numeric'),
  body('startingPrice').isNumeric().withMessage('Starting price must be numeric'),
  body('reservePrice').isNumeric().withMessage('Reserve price must be numeric'),
  body('duration').isNumeric().withMessage('Duration must be numeric'),
  body('auctionType').isIn(['English', 'Dutch', 'Sealed']).withMessage('Invalid auction type'),
  handleValidationErrors
];

export const validatePlaceBid = [
  param('auctionId').isNumeric().withMessage('Auction ID must be numeric'),
  body('bidAmount').isNumeric().withMessage('Bid amount must be numeric'),
  body('bidder').custom(isEthereumAddress).withMessage('Invalid bidder address'),
  handleValidationErrors
];

/**
 * Validation rules for fractionalization operations
 */
export const validateFractionalize = [
  body('tokenAddress').custom(isEthereumAddress).withMessage('Invalid token address'),
  body('tokenId').isNumeric().withMessage('Token ID must be numeric'),
  body('fractionalSupply').isNumeric().withMessage('Fractional supply must be numeric'),
  body('reservePrice').isNumeric().withMessage('Reserve price must be numeric'),
  body('custodianEndpoint').isString().notEmpty().withMessage('Custodian endpoint is required'),
  handleValidationErrors
];

export const validateBuyShares = [
  param('vaultAddress').custom(isEthereumAddress).withMessage('Invalid vault address'),
  body('amount').isNumeric().withMessage('Amount must be numeric'),
  body('buyer').custom(isEthereumAddress).withMessage('Invalid buyer address'),
  handleValidationErrors
];

export const validateSellShares = [
  param('vaultAddress').custom(isEthereumAddress).withMessage('Invalid vault address'),
  body('shareAmount').isNumeric().withMessage('Share amount must be numeric'),
  body('seller').custom(isEthereumAddress).withMessage('Invalid seller address'),
  handleValidationErrors
];

/**
 * Common parameter validations
 */
export const validateTokenId = [
  param('tokenId').isNumeric().withMessage('Token ID must be numeric'),
  handleValidationErrors
];

export const validateEthereumAddressParam = (paramName: string) => [
  param(paramName).custom(isEthereumAddress).withMessage(`Invalid ${paramName} address`),
  handleValidationErrors
];

export const validatePagination = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  handleValidationErrors
];

/**
 * Rate limiting helper
 */
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}; 