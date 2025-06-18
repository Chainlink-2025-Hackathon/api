import { ObjectId } from 'mongodb';

export interface Asset {
  _id?: ObjectId;
  id: string;
  contract_address: string;
  token_id: number;
  asset_type: string;
  location: string;
  custodian: string;
  value: number;
  last_appraisal_date: string;
  authenticity_cert: string;
  status: 'active' | 'inactive' | 'frozen' | 'liquidating';
  created_at?: Date;
  updated_at?: Date;
}

export interface Custodian {
  _id?: ObjectId;
  id: string;
  name: string;
  api_key: string;
  endpoint: string;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MarketData {
  _id?: ObjectId;
  asset_type: string;
  current_price: number;
  price_change_24h: number;
  volume_24h: number;  
  last_updated: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ReserveLog {
  _id?: ObjectId;
  id: string;
  asset_id: string;
  verification_time: string;
  status: 'verified' | 'failed' | 'pending';
  details: string;
  created_at?: Date;
}

export interface AuthUser {
  username: string;
  role: 'admin' | 'user';
}

export interface JWTPayload {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AssetVerificationResponse {
  verification_id: string;
  contract_address: string;
  token_id: string;
  is_present: boolean;
  location: string;
  last_inspection: string;
  custodian: string;
  certificate_hash: string;
}

export interface VaultGuardVerificationResponse {
  verification_id: string;
  asset_details: {
    contract: string;
    tokenId: string;
    verified: boolean;
    storage_facility: string;
    security_level: string;
    insurance_coverage: string;
  };
  timestamp: string;
  signature: string;
}

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  animation_url?: string;
  background_color?: string;
  youtube_url?: string;
}

export interface AppraisalData {
  asset_id: string;
  appraised_value: number;
  currency: string;
  appraisal_date: string;
  appraiser: {
    name: string;
    license: string;
    accreditation: string;
  };
  methodology: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  valid_until: string;
  certificate_hash: string;
}

export interface AuthenticityVerification {
  verification_id: string;
  certificate_hash: string;
  is_authentic: boolean;
  verification_method: string;
  verified_by: string;
  verification_date: string;
  confidence_score: number;
  details: {
    chain_of_custody: string;
    physical_condition: string;
    documentation: string;
    expert_opinion: string;
  };
}

export interface CrossChainAssetStatus {
  asset_id: string;
  chain_id: string;
  status: 'active' | 'inactive' | 'transferring';
  location: {
    current_chain: string;
    original_chain: string;
    transfer_history: Array<{
      from_chain: string;
      to_chain: string;
      timestamp: string;
      transaction_hash: string;
    }>;
  };
  verification_status: {
    last_verified: string;
    verification_count: number;
    next_verification: string;
  };
}

export interface YieldData {
  asset_id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  yield_amount: number;
  currency: string;
  yield_type: 'rental_income' | 'appreciation' | 'dividends';
  payment_date: string;
  next_payment: string;
  yield_history: Array<{
    date: string;
    amount: number;
  }>;
}

export interface PortfolioAnalytics {
  total_value: number;
  asset_count: number;
  monthly_yield: number;
  performance: {
    '1d': number;
    '7d': number;
    '30d': number;
    '1y': number;
  };
  top_assets: Array<{
    id: string;
    type: string;
    value: number;
    yield: string;
  }>;
}

export interface ChainlinkFunctionsRequest {
  source: string;
  args: string[];
}

export interface ChainlinkFunctionsResponse {
  request_id: string;
  result: string | number | boolean;
  execution_time: number;
  gas_used: number;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T | null;
  error?: string;
  timestamp: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface DatabaseConfig {
  connectionString: string;
  databaseName: string;
}

export interface ServerConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
  mongoUrl: string;
  databaseName: string;
}

// Database Collections
export interface DatabaseCollections {
  assets: Asset[];
  custodians: Custodian[];
  marketData: MarketData[];
  reserveLogs: ReserveLog[];
}

// Express Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      custodian?: Custodian;
    }
  }
}

export {}; 