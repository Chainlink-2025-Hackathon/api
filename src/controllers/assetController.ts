import { Request, Response } from 'express';
import { Features } from '../services/features';
import { AssetMetadata } from '@bagel-rwa/sdk';

export class AssetController {
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

    // POST /api/assets/metadata
    createMetadata = async (req: any, res: any) => {
        try {
            const { name, description, image, attributes, options } = req.body;
            
            if (!name || !description || !image || !attributes) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: name, description, image, attributes'
                });
            }

            const metadata = await this.features.createMetadata(
                name,
                description,
                image,
                attributes,
                options
            );

            const response = this.convertBigIntToNumber(metadata);

            return res.status(200).json({
                success: true,
                data: response,
                message: 'Metadata created successfully'
            });
        } catch (error) {
            console.error('Error creating metadata:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create metadata',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/assets/mint
    mintAsset = async (req: any, res: any) => {
        try {
            const { to, assetType, physicalLocation, appraisalValueUSD, custodian, authenticityCertHash, metadataURI } = req.body;
            
            if (!to || !assetType || !physicalLocation || !appraisalValueUSD || !custodian || !authenticityCertHash || !metadataURI) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            const result = await this.features.mintAsset({
                to,
                assetType,
                physicalLocation,
                appraisalValueUSD,
                custodian,
                authenticityCertHash,
                metadataURI
            });
            const response = this.convertBigIntToNumber(result);

            return res.status(200).json({success:true, data:response.contractCall, message: "Asset mint tx created"});
        } catch (error) {
            console.error('Error minting asset:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to mint asset',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/assets/user/:userAddress
    getUserAssets = async (req: any, res: any) => {
        try {
            const { userAddress } = req.params;
            
            if (!userAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'User address is required'
                });
            }

            const assets = await this.features.getUserAssetNFT({ userAddress });

            const response = this.convertBigIntToNumber(assets);

            return res.status(200).json({
                success: true,
                data: response,
                message: 'User assets retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting user assets:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get user assets',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/assets/:tokenId/info
    getAssetInfo = async (req: any, res: any) => {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const assetInfo = await this.features.getAssetInfo({ tokenId });
            const response = this.convertBigIntToNumber(assetInfo);

            return res.status(200).json({
                success: true,
                data: response,
                message: 'Asset info retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting asset info:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get asset info',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/assets/:tokenId/owner
    getAssetOwner = async (req: any, res: any) => {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const owner = await this.features.getOwnerOfAsset({ tokenId });
            const response = this.convertBigIntToNumber(owner);

            return res.status(200).json({
                success: true,
                data: { owner: response },
                message: 'Asset owner retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting asset owner:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get asset owner',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/assets/balance/:userAddress
    getAssetBalance = async (req: any, res: any) => {
        try {
            const { userAddress } = req.params;
            
            if (!userAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'User address is required'
                });
            }

            const balance = await this.features.getBalanceOfAsset({ userAddress });
            const response = this.convertBigIntToNumber(balance);   

            return res.status(200).json({
                success: true,
                data: { balance: response },
                message: 'Asset balance retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting asset balance:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get asset balance',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/assets/:tokenId/appraisal-history
    getAppraisalHistory = async (req: any, res: any) => {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const history = await this.features.getAppraisalHistory({ tokenId });
            const response = this.convertBigIntToNumber(history);

            return res.status(200).json({
                success: true,
                data: response,
                message: 'Appraisal history retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting appraisal history:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get appraisal history',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
} 