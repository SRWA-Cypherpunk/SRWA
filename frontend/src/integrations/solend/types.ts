import { PublicKey } from '@solana/web3.js';

export type Percentage = number;

export interface SolendMarketConfigInput {
  createNewMarket: boolean;
  quoteCurrency: string;
  oracleProgramId: string;
  switchboardProgramId: string;
  existingMarket?: string;
}

export interface SolendReserveRiskConfigInput {
  optimalUtilizationRate: Percentage;
  maxUtilizationRate: Percentage;
  loanToValueRatio: Percentage;
  liquidationThreshold: Percentage;
  maxLiquidationThreshold: Percentage;
  liquidationBonus: Percentage;
  maxLiquidationBonus: Percentage;
  minBorrowRate: Percentage;
  optimalBorrowRate: Percentage;
  maxBorrowRate: Percentage;
  superMaxBorrowRate: number;
  protocolLiquidationFee: Percentage;
  protocolTakeRate: Percentage;
  addedBorrowWeightBps: string;
  scaledPriceOffsetBps: string;
  extraOracle?: string;
  attributedBorrowLimitOpen: string;
  attributedBorrowLimitClose: string;
  depositLimit: string;
  borrowLimit: string;
}

export interface SolendReserveInput {
  liquidityMint: string;
  initialLiquidity: string;
  pythPriceAccount: string;
  switchboardFeed: string;
  feeReceiver?: string;
  riskConfig: SolendReserveRiskConfigInput;
}

export interface CreateSolendPoolInput {
  market: SolendMarketConfigInput;
  reserve: SolendReserveInput;
}

export interface CreatedReserveAccounts {
  reserve: PublicKey;
  collateralMint: PublicKey;
  collateralSupply: PublicKey;
  liquiditySupply: PublicKey;
  liquidityFeeReceiver: PublicKey;
  userCollateral: PublicKey;
}

export interface CreateSolendPoolResult {
  marketPubkey: PublicKey;
  marketAuthority: PublicKey;
  reservePubkey: PublicKey;
  reserveAccounts: CreatedReserveAccounts;
  signatures: string[];
}
