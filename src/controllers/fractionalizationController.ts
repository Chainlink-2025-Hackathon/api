import { Request, Response } from 'express';
import { Features } from '../services/features';

export class FractionalizationController {
    private features: Features;

    constructor(features: Features) {
        this.features = features;
    }

    private convertBigIntToNumber(obj: any): any {
        if (typeof obj === 'bigint') {
            return Number(obj);
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.convertBigIntToNumber(item));
        } else if (obj !== null && typeof obj === 'object') {
            const converted: any = {};
            for (const [key, value] of Object.entries(obj)) {
                converted[key] = this.convertBigIntToNumber(value);
            }
            return converted;
        }
        return obj;
    }

    // POST /api/fractionalization/approve
    approveAssetForFractionalization = async (req: any, res: any) => {
        try {
            const { tokenId } = req.body;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const result = await this.features.approveAssetForFractionalization({ tokenId: tokenId.toString() });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Asset approved for fractionalization'
            });
        } catch (error) {
            console.error('Error approving asset for fractionalization:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve asset for fractionalization',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/fractionalization/fractionalize
    fractionalizeAsset = async (req: any, res: any) => {
        try {
            const { tokenId, fractionalSupply, reservePrice } = req.body;
            
            if (!tokenId || !fractionalSupply || !reservePrice) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: tokenId, fractionalSupply, reservePrice'
                });
            }

            const result = await this.features.fractionalizeAsset({
                tokenId: tokenId.toString(),
                fractionalSupply,
                reservePrice
            });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Asset fractionalized successfully'
            });
        } catch (error) {
            console.error('Error fractionalizing asset:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fractionalize asset',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/fractionalization/redeem
    redeemAsset = async (req: any, res: any) => {
        try {
            const { fractionalizedTokenContract, amount } = req.body;
            
            if (!fractionalizedTokenContract || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: fractionalizedTokenContract, amount'
                });
            }

            const result = await this.features.redeemAsset({
                fractionalizedTokenContract,
                amount
            });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Asset redeemed successfully'
            });
        } catch (error) {
            console.error('Error redeeming asset:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to redeem asset',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/fractionalization/approval-status/:tokenId
    checkApprovalStatus = async (req: any, res: any) => {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const isApproved = await this.features.isNFTApprovedForFractionalization({ tokenId });

            res.status(200).json({
                success: true,
                data: { isApproved },
                message: 'Approval status retrieved successfully'
            });
        } catch (error) {
            console.error('Error checking approval status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check approval status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/fractionalization/asset/:assetId
    getFractionalizedAsset = async (req: any, res: any) => {
        try {
            const { assetId } = req.params;
            
            if (!assetId) {
                return res.status(400).json({
                    success: false,
                    message: 'Asset ID is required'
                });
            }

            const assetInfo = await this.features.getFractionalizedAsset({ assetId });
            const response = this.convertBigIntToNumber(assetInfo);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Fractionalized asset retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting fractionalized asset:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get fractionalized asset',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/fractionalization/reserve/:assetId
    getReserveData = async (req: any, res: any) => {
        try {
            const { assetId } = req.params;
            
            if (!assetId) {
                return res.status(400).json({
                    success: false,
                    message: 'Asset ID is required'
                });
            }

            const reserveData = await this.features.getReserveData({ assetId });
            const response = this.convertBigIntToNumber(reserveData);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Reserve data retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting reserve data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get reserve data',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/fractionalization/token-info/:tokenContract
    getFractionalizedAssetInfo = async (req: any, res: any) => {
        try {
            const { tokenContract } = req.params;
            
            if (!tokenContract) {
                return res.status(400).json({
                    success: false,
                    message: 'Token contract address is required'
                });
            }

            const tokenInfo = await this.features.getFractionalizedAssetInfo({ 
                fractionalizedTokenContract: tokenContract 
            });
            const response = this.convertBigIntToNumber(tokenInfo);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Token info retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting token info:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get token info',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/fractionalization/verify-token
    verifyFractionalizedToken = async (req: any, res: any) => {
        try {
            const { tokenContract } = req.body;
            
            if (!tokenContract) {
                return res.status(400).json({
                    success: false,
                    message: 'Token contract address is required'
                });
            }

            const isValid = await this.features.verifyFractionalizedToken({
                fractionalizedTokenContract: tokenContract
            });

            res.status(200).json({
                success: true,
                data: { isValid },
                message: 'Token verification completed'
            });
        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify token',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/fractionalization/token-value
    getTokenValue = async (req: any, res: any) => {
        try {
            const { fractionalizedTokenContract, amount } = req.body;
            
            if (!fractionalizedTokenContract || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: fractionalizedTokenContract, amount'
                });
            }

            const value = await this.features.getTokenValue({
                fractionalizedTokenContract,
                amount
            });
            const response = this.convertBigIntToNumber(value);

            res.status(200).json({
                success: true,
                data: { value: response },
                message: 'Token value calculated successfully'
            });
        } catch (error) {
            console.error('Error getting token value:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get token value',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/fractionalization/balance/:assetId/:userAddress
    getAssetTokenBalance = async (req: any, res: any) => {
        try {
            const { assetId, userAddress } = req.params;
            
            if (!assetId || !userAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'Asset ID and user address are required'
                });
            }

            const balance = await this.features.getAssetTokenBalance({
                assetId,
                userAddress
            });
            const response = this.convertBigIntToNumber(balance);

            res.status(200).json({
                success: true,
                data: { balance: response },
                message: 'Token balance retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting token balance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get token balance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/fractionalization/request-verification
    requestReserveVerification = async (req: any, res: any) => {
        try {
            const { assetId } = req.body;
            
            if (!assetId) {
                return res.status(400).json({
                    success: false,
                    message: 'Asset ID is required'
                });
            }

            const result = await this.features.requestReserveVerification({ assetId });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Reserve verification requested successfully'
            });
        } catch (error) {
            console.error('Error requesting reserve verification:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to request reserve verification',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/fractionalization/verification-status/:assetId
    getReserveVerificationStatus = async (req: any, res: any) => {
        try {
            const { assetId } = req.params;
            
            if (!assetId) {
                return res.status(400).json({
                    success: false,
                    message: 'Asset ID is required'
                });
            }

            const status = await this.features.getReserveVerificationStatus({ assetId });
            const response = this.convertBigIntToNumber(status);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Verification status retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting verification status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get verification status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
} 