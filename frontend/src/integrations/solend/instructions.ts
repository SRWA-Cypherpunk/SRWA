import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import { int64, publicKey, uint64, uint128 } from './layout';

export const LENDING_MARKET_SIZE = 290;
export const RESERVE_SIZE = 619;

enum LendingInstruction {
  InitLendingMarket = 0,
  InitReserve = 2,
}

export const initLendingMarketIx = (
  owner: PublicKey,
  quoteCurrency: Buffer,
  lendingMarket: PublicKey,
  lendingProgramId: PublicKey,
  oracleProgramId: PublicKey,
  switchboardProgramId: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    publicKey('owner'),
    BufferLayout.blob(32, 'quoteCurrency'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstruction.InitLendingMarket,
      owner,
      quoteCurrency,
    },
    data
  );

  const keys = [
    { pubkey: lendingMarket, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: oracleProgramId, isSigner: false, isWritable: false },
    { pubkey: switchboardProgramId, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: lendingProgramId,
    data,
  });
};

export interface ReserveConfigEncoded {
  optimalUtilizationRate: number;
  maxUtilizationRate: number;
  loanToValueRatio: number;
  liquidationBonus: number;
  liquidationThreshold: number;
  minBorrowRate: number;
  optimalBorrowRate: number;
  maxBorrowRate: number;
  superMaxBorrowRate: BN;
  fees: {
    borrowFeeWad: BN;
    flashLoanFeeWad: BN;
    hostFeePercentage: number;
  };
  depositLimit: BN;
  borrowLimit: BN;
  feeReceiver: PublicKey;
  protocolLiquidationFee: number;
  protocolTakeRate: number;
  addedBorrowWeightBPS: BN;
  reserveType: number;
  maxLiquidationBonus: number;
  maxLiquidationThreshold: number;
  scaledPriceOffsetBPS: BN;
  extraOracle?: PublicKey;
  attributedBorrowLimitOpen: BN;
  attributedBorrowLimitClose: BN;
}

export const initReserveIx = (
  liquidityAmount: number | BN,
  config: ReserveConfigEncoded,
  sourceLiquidity: PublicKey,
  destinationCollateral: PublicKey,
  reserve: PublicKey,
  liquidityMint: PublicKey,
  liquiditySupply: PublicKey,
  liquidityFeeReceiver: PublicKey,
  collateralMint: PublicKey,
  collateralSupply: PublicKey,
  pythPrice: PublicKey,
  switchboardFeed: PublicKey,
  lendingMarket: PublicKey,
  lendingMarketAuthority: PublicKey,
  lendingMarketOwner: PublicKey,
  transferAuthority: PublicKey,
  lendingProgramId: PublicKey
): TransactionInstruction => {
  const dataAccounts = [
    BufferLayout.u8('instruction'),
    uint64('liquidityAmount'),
    BufferLayout.u8('optimalUtilizationRate'),
    BufferLayout.u8('maxUtilizationRate'),
    BufferLayout.u8('loanToValueRatio'),
    BufferLayout.u8('liquidationBonus'),
    BufferLayout.u8('liquidationThreshold'),
    BufferLayout.u8('minBorrowRate'),
    BufferLayout.u8('optimalBorrowRate'),
    BufferLayout.u8('maxBorrowRate'),
    uint64('superMaxBorrowRate'),
    uint64('borrowFeeWad'),
    uint64('flashLoanFeeWad'),
    BufferLayout.u8('hostFeePercentage'),
    uint64('depositLimit'),
    uint64('borrowLimit'),
    publicKey('feeReceiver'),
    BufferLayout.u8('protocolLiquidationFee'),
    BufferLayout.u8('protocolTakeRate'),
    uint64('addedBorrowWeightBPS'),
    BufferLayout.u8('reserveType'),
    BufferLayout.u8('maxLiquidationBonus'),
    BufferLayout.u8('maxLiquidationThreshold'),
    int64('scaledPriceOffsetBPS'),
    BufferLayout.u8('extraOracle'),
    uint64('attributedBorrowLimitOpen'),
    uint64('attributedBorrowLimitClose'),
  ];

  if (config.extraOracle) {
    dataAccounts.splice(25, 0, publicKey('extraOraclePubkey'));
  }

  const dataLayout = BufferLayout.struct(dataAccounts);
  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstruction.InitReserve,
      liquidityAmount: new BN(liquidityAmount),
      optimalUtilizationRate: config.optimalUtilizationRate,
      maxUtilizationRate: config.maxUtilizationRate,
      loanToValueRatio: config.loanToValueRatio,
      liquidationBonus: config.liquidationBonus,
      liquidationThreshold: config.liquidationThreshold,
      minBorrowRate: config.minBorrowRate,
      optimalBorrowRate: config.optimalBorrowRate,
      maxBorrowRate: config.maxBorrowRate,
      superMaxBorrowRate: config.superMaxBorrowRate,
      borrowFeeWad: config.fees.borrowFeeWad,
      flashLoanFeeWad: config.fees.flashLoanFeeWad,
      hostFeePercentage: config.fees.hostFeePercentage,
      depositLimit: config.depositLimit,
      borrowLimit: config.borrowLimit,
      feeReceiver: config.feeReceiver,
      protocolLiquidationFee: config.protocolLiquidationFee,
      protocolTakeRate: config.protocolTakeRate,
      addedBorrowWeightBPS: config.addedBorrowWeightBPS,
      reserveType: config.reserveType,
      maxLiquidationBonus: config.maxLiquidationBonus,
      maxLiquidationThreshold: config.maxLiquidationThreshold,
      scaledPriceOffsetBPS: config.scaledPriceOffsetBPS,
      extraOracle: Number(Boolean(config.extraOracle)),
      extraOraclePubkey: config.extraOracle,
      attributedBorrowLimitOpen: config.attributedBorrowLimitOpen,
      attributedBorrowLimitClose: config.attributedBorrowLimitClose,
    },
    data
  );

  const keys = [
    { pubkey: sourceLiquidity, isSigner: false, isWritable: true },
    { pubkey: destinationCollateral, isSigner: false, isWritable: true },
    { pubkey: reserve, isSigner: false, isWritable: true },
    { pubkey: liquidityMint, isSigner: false, isWritable: false },
    { pubkey: liquiditySupply, isSigner: false, isWritable: true },
    { pubkey: liquidityFeeReceiver, isSigner: false, isWritable: true },
    { pubkey: collateralMint, isSigner: false, isWritable: true },
    { pubkey: collateralSupply, isSigner: false, isWritable: true },
    { pubkey: pythPrice, isSigner: false, isWritable: false },
    { pubkey: pythPrice, isSigner: false, isWritable: false },
    { pubkey: switchboardFeed, isSigner: false, isWritable: false },
    { pubkey: lendingMarket, isSigner: false, isWritable: true },
    { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
    { pubkey: lendingMarketOwner, isSigner: true, isWritable: false },
    { pubkey: transferAuthority, isSigner: true, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  if (config.extraOracle) {
    keys.push({
      pubkey: config.extraOracle,
      isSigner: false,
      isWritable: false,
    });
  }

  return new TransactionInstruction({
    keys,
    programId: lendingProgramId,
    data,
  });
};
