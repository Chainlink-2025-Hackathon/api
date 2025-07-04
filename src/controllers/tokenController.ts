import { Request, Response } from 'express';
import { Features } from '../services/features';

export class TokenController {
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

    // POST /api/tokens/approve
    approveToken = async (req: any, res: any) => {
        try {
            const { tokenAddress, amount, spender } = req.body;
            
            if (!tokenAddress || !amount || !spender) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: tokenAddress, amount, spender'
                });
            }

            const result = await this.features.approveToken({
                tokenAddress,
                amount: BigInt(amount),
                spender
            });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({data: response.contractCall, message: response.message ,success: true});
        } catch (error) {
            console.error('Error approving token:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve token',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/tokens/mint-usdc
    mintUSDC = async (req: any, res: any) => {
        try {
            const { amount } = req.body;
            
            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount is required'
                });
            }

            const result = await this.features.mintMockUSDC({ amount });
            const response = this.convertBigIntToNumber(result);

            res.status(200).json({data: response.contractCall, message: response.message ,success: true});
        } catch (error) {
            console.error('Error minting USDC:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mint USDC',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
} 