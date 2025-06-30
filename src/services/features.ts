import { AssetMetadata, BagelsRWA, AssetInfo } from '@bagel-rwa/sdk';
import { 
  NetworkConfig,
  ContractAddresses,
  FractionalizationInfo,
  LoanInfo,
  ReserveData,
  TransactionResponse,
  PlatformError,
  AuctionInfo,
  ProofOfReserveData,
  ChainlinkRequest,
  VotingInfo,
  AssetStatus,
  EventCallback,
  EventSubscription,
  QueryOptions,
  PaginatedResponse,
  ContractCallObject,
  Address,
} from './types';           
import { ethers, Signer, Wallet } from 'ethers';
import erc20Abi from './erc20Abi.json';
const loanTokenAddress = "0x13D9D7D2e4BA2f3c0acB9863FDA8Bb4B95F11f08";

interface Config {
    networkConfig: {
      chainId: number;
      name: string;
      rpcUrl: string;
    };
    contractAddresses: {
      assetNFT: string;
      fractionalizationVault: string;
      lendingContract: string;
      auctionContract: string;
      indexVault: string;
      governanceContract?: string;
      governanceToken?: string;
      launchpadContract: string;
    };
    usageType: 'Backend' | 'Frontend';
    signer?: Wallet;
  }

  interface MintAssetParams {
    to: string;
    assetType: string;
    physicalLocation: string;
    appraisalValueUSD: number
    custodian: string;
    authenticityCertHash: string;
    metadataURI: string;
  }

  interface FractionalizeAssetParams {
    tokenId: string;
    fractionalSupply: string;
    reservePrice: string;
  }

class Features {
    private sdk: BagelsRWA;
    private usageType: 'Backend' | 'Frontend';
    private signer?: Wallet | undefined;

    constructor(config: Config) {
        this.sdk = new BagelsRWA({
            usageType: config.usageType,
            networkConfig: config.networkConfig,
            contractAddresses: config.contractAddresses,
            ...(config.signer && { signer: config.signer })
        });
        this.usageType = config.usageType;
        this.signer = config.signer;
    }

    // Utility function to convert BigInt values to numbers recursively
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

    ///ERC-20 Approval
    async approveToken(params: {tokenAddress: string, amount: BigInt, spender: string}) {
        try {
           
            //create an erc20 contract instance with approval function
            
            
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: {
                        address: params.tokenAddress,
                        abi: erc20Abi,
                        functionName: 'approve',
                        args: [params.spender, params.amount],
                    },
                    message: 'Contract call prepared for frontend execution'
                };
            }

            const erc20Contract = new ethers.Contract(params.tokenAddress, ['function approve(address spender, uint256 amount)'], this.signer);
            const tx = await erc20Contract.approve?.(params.spender, params.amount);
            
            if (!tx) {
                throw new Error('Approval transaction failed');
            }

            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Token approved successfully'
            };  
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async mintMockUSDC(params: {amount: number}) {
        try {
            const tokenAddress = loanTokenAddress;
            const amount = ethers.parseUnits(params.amount.toString(), 6);
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: {
                        address: tokenAddress,
                        abi: erc20Abi,
                        functionName: 'faucet',
                        args: [amount],
                    },
                    message: 'Contract call prepared for frontend execution'
                };
            }

            const erc20Contract = new ethers.Contract(tokenAddress, ['function faucet(uint256 amount)'], this.signer);
            const tx = await erc20Contract.faucet?.(amount);
            
            if (!tx) {
                throw new Error('Approval transaction failed');
            }

            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Token approved successfully'
            };  
            
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    //assetNFT Tokenization

    async   createMetadata(
        name: string,
        description: string,
        image: string,
        attributes: Array<{ trait_type: string; value: string | number }>,
        options?: {
          external_url?: string;
          animation_url?: string;
          custody_proof?: string;
          appraisal_value?: string;
          authenticity_certificate?: string;
        }
      ): Promise<AssetMetadata>  {
        try{
            const metadata = {
          name,
          description,
          image,
          attributes,
          ...options,
        };
        return metadata;
       }catch(error){
        console.error(error);
        throw error;
       }
      }

    async mintAsset(params: MintAssetParams) {
       try{
        const tx = await this.sdk.assetNFT.mintAssetWithUSDAppraisal(
            params.to,
            params.assetType,
            params.physicalLocation,
            params.appraisalValueUSD as any,
            params.custodian,
            params.authenticityCertHash,
            params.metadataURI
        );
        if (this.usageType === 'Frontend') {
            return {
              success: true,
              contractCall: tx, // This should be the contract call object for wagmi
              message: 'Contract call prepared for frontend execution'
            };
          }
    
          return {
            success: true,
            tokenId: (tx as any).tokenId ? Number((tx as any).tokenId) : undefined,
            txHash: (tx as any).txHash,
            message: 'Asset NFT with USD appraisal minted successfully'
          };
       } catch (error) {
        console.error(error);
        throw error;
       }
    }

    async getUserAssetNFT(params: {userAddress: string}) : Promise<Array<{
        tokenId: number;
        owner: string;
        assetType: string;
        physicalLocation: string;
        appraisalValue: number;
        lastAppraisalDate: number;
        isAuthenticated: boolean;
        custodian: string;
        authenticityCertHash: string;
        isCrossChain: boolean;
        originChain: number;
        metadata: AssetMetadata;
    }>> {
       try{
        const userAssets = await this.sdk.assetNFT.getAssetsByOwner(params.userAddress);
        // Use the utility function to convert all BigInt values recursively
        return this.convertBigIntToNumber(userAssets);
       }catch(error){
        console.error(error);
        throw error;
       }
    }

    async getAssetInfo(params: {tokenId: string}) : Promise<{
        tokenId: number;
        owner: string;
        assetType: string;
        physicalLocation: string;
        appraisalValue: number;
        lastAppraisalDate: number;
        isAuthenticated: boolean;
        custodian: string;
        authenticityCertHash: string;
        isCrossChain: boolean;
        originChain: number;
        metadata: AssetMetadata;
    }> {
        try{
            
            const assetInfo = await this.sdk.assetNFT.getAssetInfo(BigInt(parseInt(params.tokenId)));
            return {
                ...assetInfo,
                tokenId: Number(assetInfo.tokenId),
                appraisalValue: Number(assetInfo.appraisalValue),
                lastAppraisalDate: Number(assetInfo.lastAppraisalDate),
                originChain: Number(assetInfo.originChain)
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getOwnerOfAsset(params: {tokenId: string}) : Promise<string> {
        try{
            const owner = await this.sdk.assetNFT.getOwner(BigInt(params.tokenId));
            return owner;
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getBalanceOfAsset(params: {userAddress: string}) : Promise<number> {
        try{
            const balance = await this.sdk.assetNFT.getBalance(params.userAddress);
            return Number(balance);
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getAppraisalHistory(params: {tokenId: string}) : Promise<Array<{
        value: number;
        date: number;
        blockNumber: number;
        transactionHash: string;
    }>> {
        try{
            const appraisalHistory = await this.sdk.assetNFT.getAppraisalHistory(BigInt(params.tokenId));
            return appraisalHistory.map(item => ({
                ...item,
                value: Number(item.value),
                date: Number(item.date)
            }));
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    //fractionalization

    async approveAssetForFractionalization({tokenId}: {tokenId: string}){
        try {
            const assectContract = this.sdk.getContractAddresses().assetNFT;
           const tx = await this.sdk.fractionalization.approveNFTForFractionalization(assectContract, BigInt(tokenId));
           
           if (this.usageType === 'Frontend') {
               return {
                 success: true,
                 contractCall: tx,
                 message: 'Contract call prepared for frontend execution'
               };
           }
           
           return {
               success: true,
               txHash: tx as string,
               message: 'Asset approved for fractionalization successfully'
           };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async fractionalizeAsset(params: FractionalizeAssetParams) {
        try {

            console.log("params:",params);

            const custodianEndpoint = '/api/custodian-1'   
            const assectContract = this.sdk.getContractAddresses().assetNFT;     
            const tx = await this.sdk.fractionalization.fractionalize(
                assectContract,
                parseInt(params.tokenId), // SDK expects number for tokenId
                ethers.parseEther(params.fractionalSupply),
                ethers.parseEther(params.reservePrice),
                custodianEndpoint
            );
            
            if (this.usageType === 'Frontend') {
                return {
                  success: true,
                  contractCall: tx,
                  message: 'Contract call prepared for frontend execution'
                };
            }
            
            return {
                success: true,
                assetId: (tx as any).assetId ? Number((tx as any).assetId) : (tx as any).assetId,
                txHash: (tx as any).txHash,
                message: 'Asset fractionalized successfully'
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async redeemAsset(params: {fractionalizedTokenContract: string, amount: number}) {
        try{
            const tx = await this.sdk.fractionalization.redeemNFT(params.fractionalizedTokenContract, BigInt(params.amount));
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }

            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Asset redeemed successfully'
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async isNFTApprovedForFractionalization(params: {tokenId: string}) : Promise<boolean> {
        try{
            const assectContract = this.sdk.getContractAddresses().assetNFT;
            const isApproved = await this.sdk.fractionalization.isNFTApprovedForFractionalization(assectContract, BigInt(params.tokenId));
            return isApproved;
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getFractionalizedAsset(params: {assetId: string}) : Promise<{
        assetId: string;
        nftContract: string;
        tokenId: number;
        originalOwner: string;
        fractionalSupply: number;
        reservePrice: number;
        isActive: boolean;
        creationTime: number;
        lastYieldDistribution: number;
        lastReserveCheck: number;
        status: AssetStatus;
        custodianEndpoint: string;
        fractionalTokenContract: string;
    }> {
        try{
            const fractionalizedAsset = await this.sdk.fractionalization.getFractionalizedAsset(params.assetId);
            return {
                ...fractionalizedAsset,
                tokenId: Number(fractionalizedAsset.tokenId),
                fractionalSupply: Number(fractionalizedAsset.fractionalSupply),
                reservePrice: Number(fractionalizedAsset.reservePrice),
                creationTime: Number(fractionalizedAsset.creationTime),
                lastYieldDistribution: Number(fractionalizedAsset.lastYieldDistribution),
                lastReserveCheck: Number(fractionalizedAsset.lastReserveCheck)
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getReserveData(params: {assetId: string}) : Promise<{
        isVerified: boolean;
        lastVerification: number;
        consecutiveFailures: number;
        lastRequestId: string;
    }> {
        try{
            const reserveData = await this.sdk.fractionalization.getReserveData(params.assetId);
            return {
                ...reserveData,
                lastVerification: Number(reserveData.lastVerification),
                consecutiveFailures: Number(reserveData.consecutiveFailures)
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getFractionalizedAssetInfo(params: {fractionalizedTokenContract: string}) : Promise<string> {
        try{
            const fractionalizedAssetInfo = await this.sdk.fractionalization.getAssetIdFromTokenContract(params.fractionalizedTokenContract);
            return fractionalizedAssetInfo;
        }catch(error){
            console.error(error);
            throw error;    
        }
    }

    async verifyFractionalizedToken(params: {fractionalizedTokenContract: string}) :  Promise <{
        assetId: string;
        reservePrice: number;
        fractionalSupply: number;
        isActive: boolean;
    }> {
        try{
            const isVerified = await this.sdk.fractionalization.verifyTokenContract(params.fractionalizedTokenContract);
            return {
                ...isVerified,
                reservePrice: Number(isVerified.reservePrice),
                fractionalSupply: Number(isVerified.fractionalSupply)
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getTokenValue(params: {fractionalizedTokenContract: string, amount: number}) : Promise<number> {
        try{
            const tokenValue = await this.sdk.fractionalization.getTokenValue(params.fractionalizedTokenContract, BigInt(params.amount));
            return Number(tokenValue);
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getAssetTokenBalance(params: {assetId: string, userAddress: string}) : Promise<number> {
        try{
            const assetTokenBalance = await this.sdk.fractionalization.getAssetTokenBalance(params.assetId, params.userAddress);
            return Number(assetTokenBalance);
        }catch(error){
            console.error(error);
            throw error;
        }
    }
        /// CHAINLINK FUNCTIONS INTEGRATION
    async requestReserveVerification(params: {assetId: string}) {
        try{
            const tx = await this.sdk.fractionalization.requestReserveVerification(params.assetId);
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }
            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Reserve verification requested successfully'
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getReserveVerificationStatus(params: {assetId: string}) : Promise<Array<{
        requestId: string;
        tokenId: number;
        requestType: 'METADATA_UPDATE' | 'AUTHENTICITY_CHECK' | 'RESERVE_VERIFICATION';
        timestamp: number;
        status: 'PENDING' | 'FULFILLED' | 'FAILED';
    }>> {
        try{
            const reserveVerificationStatus = await this.sdk.fractionalization.getReserveVerificationRequests(params.assetId);
            return reserveVerificationStatus.map(request => ({
                ...request,
                tokenId: Number(request.tokenId),
                timestamp: Number(request.timestamp)
            }));
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    
    
    //lending

    approveTokenForLending = async (params: {amount: number}) => {
        try {
          const tx = await this.approveToken({tokenAddress: loanTokenAddress, amount: ethers.parseUnits(params.amount.toString(), 6), spender: this.sdk.getContractAddresses().lendingContract});
          return tx;
        } catch (error) {
            console.error('Error approving token for lending:', error);
            throw error;
        }
    }

    async provideLiquidity(params: {amount: number}) {
        try {
            const tx = await this.sdk.lending.depositLiquidity(
                loanTokenAddress,
                BigInt(params.amount),
            );
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }
            return {
                success: true,
                txHash: (tx as any).txHash,
                lpToken: (tx as any).lpToken ? Number((tx as any).lpToken) : (tx as any).lpToken,
                message: 'Liquidity provided successfully'
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async withdrawLiquidity(params: {lpTokenAmount: number, tokenAddress: string, amount: number}) {
        try{
            const tx = await this.sdk.lending.withdrawLiquidity(params.tokenAddress, BigInt(params.lpTokenAmount));
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }
            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Liquidity withdrawn successfully'
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async approveAssetForLoan(params: {tokenId: string}) {
        try {
            const assectContract = this.sdk.getContractAddresses().assetNFT;
            const tx = await this.sdk.lending.approveNFTForLending(assectContract, BigInt(params.tokenId));
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }
            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Asset approved for loan successfully'
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async isNFTApprovedForLending(params: {tokenId: string}) : Promise<boolean> {
        try{
            const assectContract = this.sdk.getContractAddresses().assetNFT;
            const isApproved = await this.sdk.lending.isNFTApprovedForLending(assectContract, BigInt(params.tokenId));
            return isApproved;
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getRecommendedLoanAmount(params: {tokenId: string}) : Promise<{
        recommendedAmount: number;
        maxAmount: number;
        collateralValue: number;
        targetLtv: number;
        maxLtv: number;
    }> {
        try{
            const assectContract = this.sdk.getContractAddresses().assetNFT;
            const recommendedLoanAmount = await this.sdk.lending.getRecommendedLoanAmount(assectContract, BigInt(params.tokenId), loanTokenAddress);
            return {
                ...recommendedLoanAmount,
                recommendedAmount: Number(ethers.formatEther(recommendedLoanAmount.recommendedAmount)),
                maxAmount: Number(ethers.formatEther(recommendedLoanAmount.maxAmount)),
                collateralValue: Number(ethers.formatEther(recommendedLoanAmount.collateralValue))
            };
        }catch(error){
            console.error(error);
            throw error;    
        }
    }

    async createNFTLoan(params: {
        tokenId: string, 
        amount: number, 
        intrestRate: number, 
        duration: number,
        }) {
        try {
            const assetNftContract = this.sdk.getContractAddresses().assetNFT;

            const validation = await this.sdk.lending.validateLoanParameters(
                assetNftContract,
                BigInt(params.tokenId),
                loanTokenAddress,
                ethers.parseUnits(params.amount.toString(), 6)
            );

            const isApproved = await this.isNFTApprovedForLending({tokenId: params.tokenId});

            const loanAmount = ethers.parseUnits(params.amount.toString(), 6);

            const _duration = BigInt(params.duration * 24 * 3600);


            const tx = await this.sdk.lending.createNFTLoan(
                assetNftContract,
                BigInt(params.tokenId),
                loanTokenAddress,
                loanAmount,
                BigInt(params.intrestRate),
                _duration
            );

            // Safe logging that converts BigInt to string for serialization
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }

            return {
                success: true,
                loanId: (tx as any).loanId ? Number((tx as any).loanId) : (tx as any).loanId,
                txHash: (tx as any).txHash,
                message: 'NFT loan created successfully'
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async repayLoan(params: {loanId: number, amount: number}) {
        try {
            const tx = await this.sdk.lending.repayLoan(BigInt(params.loanId), BigInt(params.amount));
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }
            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Loan repaid successfully'
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async liquidateLoan(params: {loanId: number}) {
        try{
            const tx = await this.sdk.lending.liquidateLoan(BigInt(params.loanId));
            if (this.usageType === 'Frontend') {
                return {
                    success: true,
                    contractCall: tx,
                    message: 'Contract call prepared for frontend execution'
                };
            }
            return {
                success: true,
                txHash: (tx as any).txHash,
                message: 'Loan liquidated successfully'
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }


    async getLoanInfo(params: {loanId: number}) : Promise<{
        loanId: number;
        borrower: string;
        lender: string;
        collateralType: 'NFT' | 'FRACTIONAL';
        collateralAddress: string;
        collateralTokenId: number;
        collateralAmount: number;
        loanAmount: number;
        interestRate: number;
        duration: number;
        startTime: number;
        endTime: number;
        status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED';
        totalRepayment: number;
        amountRepaid: number;
    }> {
        try{
            const loanInfo = await this.sdk.lending.getLoan(BigInt(params.loanId));
            return {
                ...loanInfo,
                loanId: Number(loanInfo.loanId),
                collateralTokenId: Number(loanInfo.collateralTokenId),
                collateralAmount: Number(loanInfo.collateralAmount),
                loanAmount: Number(loanInfo.loanAmount),
                interestRate: Number(loanInfo.interestRate),
                duration: Number(loanInfo.duration),
                startTime: Number(loanInfo.startTime),
                endTime: Number(loanInfo.endTime),
                totalRepayment: Number(loanInfo.totalRepayment),
                amountRepaid: Number(loanInfo.amountRepaid)
            };
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async calculateTotalOwed(params: {loanId: number}) : Promise<number> {
        try{
            const totalOwed = await this.sdk.lending.calculateTotalOwed(BigInt(params.loanId));
            return Number(totalOwed);
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async isLiquidatable(params: {loanId: number}) : Promise<boolean> {
        try{
            const isLiquidatable = await this.sdk.lending.isLiquidatable(BigInt(params.loanId));
            return isLiquidatable;
        }catch(error){
            console.error(error);
            throw error;
        }
    }

    async getUserLoans(params: {userAddress: string}) : Promise<number[]> {
        try{
            const userLoans = await this.sdk.lending.getUserLoans(params.userAddress);
            return userLoans.map(loan => Number(loan));
        }catch(error){
            console.error(error);
            throw error;        
        }
    }

   async getActiveLoans(params: {userAddress: string}) : Promise<Array<{
        loanId: number;
        borrower: string;
        lender: string;
        collateralType: 'NFT' | 'FRACTIONAL';
        collateralAddress: string;
        collateralTokenId: number;
        collateralAmount: number;
        loanAmount: number;
        interestRate: number;
        duration: number;
        startTime: number;
        endTime: number;
        status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED';
        totalRepayment: number;
        amountRepaid: number;
    }>> {
    try{
        const activeLoans = await this.sdk.lending.getActiveLoans();
        return activeLoans.map(loan => ({
            ...loan,
            loanId: Number(loan.loanId),
            collateralTokenId: Number(loan.collateralTokenId),
            collateralAmount: Number(loan.collateralAmount),
            loanAmount: Number(loan.loanAmount),
            interestRate: Number(loan.interestRate),
            duration: Number(loan.duration),
            startTime: Number(loan.startTime),
            endTime: Number(loan.endTime),
            totalRepayment: Number(loan.totalRepayment),
            amountRepaid: Number(loan.amountRepaid)
        }));
    }catch(error){
        console.error(error);
        throw error;    
    }
    }

    async getLiquidatableLoans(params: {userAddress: string}) : Promise<Array<{
        loanId: number;
        borrower: string;
        lender: string;
        collateralType: 'NFT' | 'FRACTIONAL';
        collateralAddress: string;
        collateralTokenId: number;
        collateralAmount: number;
        loanAmount: number;
        interestRate: number;
        duration: number;
        startTime: number;
        endTime: number;
        status: 'ACTIVE' | 'REPAID' | 'DEFAULTED' | 'LIQUIDATED';
        totalRepayment: number;
        amountRepaid: number;
    }>> {
        try{
            const liquidatableLoans = await this.sdk.lending.getLiquidatableLoans();
            return liquidatableLoans.map(loan => ({
                ...loan,
                loanId: Number(loan.loanId),
                collateralTokenId: Number(loan.collateralTokenId),
                collateralAmount: Number(loan.collateralAmount),
                loanAmount: Number(loan.loanAmount),
                interestRate: Number(loan.interestRate),
                duration: Number(loan.duration),
                startTime: Number(loan.startTime),
                endTime: Number(loan.endTime),
                totalRepayment: Number(loan.totalRepayment),
                amountRepaid: Number(loan.amountRepaid)
            }));
        }catch(error){
            console.error(error);
            throw error;        
        }
    }

    async calculateLoanHealthRatio(params: {loanId: number}) : Promise<number> {
        try{
            const loanHealthRatio = await this.sdk.lending.calculateHealthRatio(BigInt(params.loanId));
            return loanHealthRatio;
        }catch(error){
            console.error(error);
            throw error;        
        }
    }
}

export { Features };