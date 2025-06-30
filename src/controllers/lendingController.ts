import { Request, Response } from 'express';
import { Features } from '../services/features';

export class LendingController {
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

    // POST /api/lending/approve-token-for-lending
    approveTokenForLending = async (req: Request, res: Response) => {
        try {
            const { amount } = req.body;
            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: amount'
                });
            }
            const result = await this.features.approveTokenForLending({ amount });  
            const response = this.convertBigIntToNumber(result);
            res.status(200).json({status:true, data:response.contractCall, message: "Token approved for lending"});
        } catch (error) {
            console.error('Error approving token for lending:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve token for lending',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // POST /api/lending/provide-liquidity
    provideLiquidity = async (req: Request, res: Response) => {
        try {
            const { tokenAddress, amount } = req.body;
            
            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: tokenAddress, amount'
                });
            }

            const result = await this.features.provideLiquidity({ amount });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({status:true, data:response.contractCall, message: "Liquidity provided"});
        } catch (error) {
            console.error('Error providing liquidity:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to provide liquidity',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/lending/withdraw-liquidity
    withdrawLiquidity = async (req: Request, res: Response) => {
        try {
            const { lpTokenAmount, tokenAddress, amount } = req.body;
            
            if (!lpTokenAmount || !tokenAddress || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: lpTokenAmount, tokenAddress, amount'
                });
            }

            const result = await this.features.withdrawLiquidity({ 
                lpTokenAmount, 
                tokenAddress, 
                amount 
            });
            const response = this.convertBigIntToNumber(result);
            res.status(200).json({status:true, data:response, message: "Liquidity withdrawn"});
        } catch (error) {
            console.error('Error withdrawing liquidity:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to withdraw liquidity',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/lending/approve-asset
    approveAssetForLoan = async (req: Request, res: Response) => {
        try {
            const { tokenId } = req.body;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const result = await this.features.approveAssetForLoan({ tokenId });
            const response = this.convertBigIntToNumber(result);
            res.status(200).json({status:true, data:response.contractCall, message: "Asset approved for loan"});
        } catch (error) {
            console.error('Error approving asset for loan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve asset for loan',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/approval-status/:tokenId
    checkLendingApprovalStatus = async (req: Request, res: Response) => {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID is required'
                });
            }

            const isApproved = await this.features.isNFTApprovedForLending({ tokenId });
            const response = this.convertBigIntToNumber(isApproved);
            res.status(200).json({
                success: true,
                data: { isApproved: response },
                message: 'Lending approval status retrieved successfully'
            });
        } catch (error) {
            console.error('Error checking lending approval status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check lending approval status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/recommended-amount/:tokenId/:loanTokenAddress
    getRecommendedLoanAmount = async (req: Request, res: Response) => {
        try {
            const { tokenId } = req.params;
            
            if (!tokenId ) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ID required'
                });
            }

            const recommendedAmount = await this.features.getRecommendedLoanAmount({ 
                tokenId 
            });
            const response = this.convertBigIntToNumber(recommendedAmount);
            res.status(200).json({
                success: true,
                data: response,
                message: 'Recommended loan amount retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting recommended loan amount:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get recommended loan amount',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/lending/create-loan
    createNFTLoan = async (req: Request, res: Response) => {
        try {
            const { tokenId, amount, intrestRate, duration } = req.body;

            if (!tokenId || !amount  || !duration) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields:  tokenId, amount, duration'
                });
            }

            const result = await this.features.createNFTLoan({
                tokenId,
                amount,
                intrestRate,
                duration
            });
            const response = this.convertBigIntToNumber(result);
            res.status(200).json({status:true, data:response.contractCall, message: "NFT loan created"});
        } catch (error) {
            console.error('Error creating NFT loan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create NFT loan',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/lending/repay-loan
    repayLoan = async (req: Request, res: Response) => {
        try {
            const { loanId, amount } = req.body;
            
            if (!loanId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: loanId, amount'
                });
            }

            const result = await this.features.repayLoan({ loanId, amount });
            const response = this.convertBigIntToNumber(result);
            res.status(200).json({status:true, data:response, message: "Loan repaid"});
        } catch (error) {
            console.error('Error repaying loan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to repay loan',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/lending/liquidate-loan
    liquidateLoan = async (req: Request, res: Response) => {
        try {
            const { loanId } = req.body;
            
            if (!loanId) {
                return res.status(400).json({
                    success: false,
                    message: 'Loan ID is required'
                });
            }

            const result = await this.features.liquidateLoan({ loanId });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Loan liquidated successfully'
            });
        } catch (error) {
            console.error('Error liquidating loan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to liquidate loan',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/loan/:loanId
    getLoanInfo = async (req: Request, res: Response) => {
        try {
            const { loanId } = req.params;
            
            if (!loanId) {
                return res.status(400).json({
                    success: false,
                    message: 'Loan ID is required'
                });
            }

            const loanInfo = await this.features.getLoanInfo({ loanId: parseInt(loanId) });
            const response = this.convertBigIntToNumber(loanInfo);

            res.status(200).json({
                success: true,
                data: response,
                message: 'Loan info retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting loan info:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get loan info',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/total-owed/:loanId
    calculateTotalOwed = async (req: Request, res: Response) => {
        try {
            const { loanId } = req.params;
            
            if (!loanId) {
                return res.status(400).json({
                    success: false,
                    message: 'Loan ID is required'
                });
            }

            const totalOwed = await this.features.calculateTotalOwed({ loanId: parseInt(loanId) });
            const response = this.convertBigIntToNumber(totalOwed);
            res.status(200).json({
                success: true,
                data: { totalOwed: response },
                message: 'Total owed calculated successfully'
            });
        } catch (error) {
            console.error('Error calculating total owed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to calculate total owed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/liquidatable/:loanId
    isLiquidatable = async (req: Request, res: Response) => {
        try {
            const { loanId } = req.params;
            
            if (!loanId) {
                return res.status(400).json({
                    success: false,
                    message: 'Loan ID is required'
                });
            }

            const isLiquidatable = await this.features.isLiquidatable({ loanId: parseInt(loanId) });
            const response = this.convertBigIntToNumber(isLiquidatable);
            res.status(200).json({
                success: true,
                data: { isLiquidatable: response },
                message: 'Liquidation status retrieved successfully'
            });
        } catch (error) {
            console.error('Error checking liquidation status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check liquidation status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/user-loans/:userAddress
    getUserLoans = async (req: Request, res: Response) => {
        try {
            const { userAddress } = req.params;
            
            if (!userAddress) {
                return res.status(400).json({
                    success: false,
                    message: 'User address is required'
                });
            }

            const userLoans = await this.features.getUserLoans({ userAddress });
            const response = this.convertBigIntToNumber(userLoans);
            res.status(200).json({
                success: true,
                data: response,
                message: 'User loans retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting user loans:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user loans',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/active-loans
    getActiveLoans = async (req: Request, res: Response) => {
        try {
            const activeLoans = await this.features.getActiveLoans({ userAddress: '' });
            const response = this.convertBigIntToNumber(activeLoans);
            res.status(200).json({
                success: true,
                data: response,
                message: 'Active loans retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting active loans:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get active loans',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/liquidatable-loans
    getLiquidatableLoans = async (req: Request, res: Response) => {
        try {
            const liquidatableLoans = await this.features.getLiquidatableLoans({ userAddress: '' });
            const response = this.convertBigIntToNumber(liquidatableLoans);
            res.status(200).json({
                success: true,
                data: response,
                message: 'Liquidatable loans retrieved successfully'
            });
        } catch (error) {
            console.error('Error getting liquidatable loans:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get liquidatable loans',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/lending/health-ratio/:loanId
    calculateLoanHealthRatio = async (req: Request, res: Response) => {
        try {
            const { loanId } = req.params;
            
            if (!loanId) {
                return res.status(400).json({
                    success: false,
                    message: 'Loan ID is required'
                });
            }

            const healthRatio = await this.features.calculateLoanHealthRatio({ loanId: parseInt(loanId) });
            const response = this.convertBigIntToNumber(healthRatio);   
            res.status(200).json({
                success: true,
                data: { healthRatio: response },
                message: 'Loan health ratio calculated successfully'
            });
        } catch (error) {
            console.error('Error calculating loan health ratio:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to calculate loan health ratio',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
} 