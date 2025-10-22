/**
 * Math and Financial Calculation Utilities
 * Functions for DeFi calculations, APY, interest rates, and more
 */

/**
 * Clamp a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * clamp(150, 0, 100) // 100
 * clamp(-10, 0, 100) // 0
 * clamp(50, 0, 100) // 50
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate percentage of a value
 * @param value - The value
 * @param percentage - Percentage (0-100 or 0-1 based on isDecimal)
 * @param isDecimal - Whether percentage is decimal (0-1) or whole (0-100)
 * @returns Calculated percentage
 *
 * @example
 * percentageOf(1000, 0.1) // 100 (10% of 1000)
 * percentageOf(1000, 10, false) // 100 (10% of 1000)
 */
export function percentageOf(value: number, percentage: number, isDecimal = true): number {
  const percent = isDecimal ? percentage : percentage / 100;
  return value * percent;
}

/**
 * Calculate percentage change between two values
 * @param oldValue - Original value
 * @param newValue - New value
 * @returns Percentage change as decimal (0.1 = 10% increase)
 *
 * @example
 * percentageChange(100, 110) // 0.1 (10% increase)
 * percentageChange(100, 90) // -0.1 (10% decrease)
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return (newValue - oldValue) / oldValue;
}

/**
 * Calculate compound interest
 * @param principal - Initial amount
 * @param rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Time period in years
 * @param compoundingFrequency - Number of times interest compounds per year
 * @returns Final amount with compound interest
 *
 * @example
 * compoundInterest(1000, 0.05, 1, 12) // Monthly compounding
 * compoundInterest(1000, 0.05, 2, 365) // Daily compounding
 */
export function compoundInterest(
  principal: number,
  rate: number,
  time: number,
  compoundingFrequency = 365
): number {
  return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
}

/**
 * Calculate APY from APR
 * @param apr - Annual Percentage Rate (as decimal)
 * @param compoundingFrequency - Number of times interest compounds per year
 * @returns Annual Percentage Yield (as decimal)
 *
 * @example
 * aprToApy(0.05, 365) // Daily compounding
 * aprToApy(0.10, 12) // Monthly compounding
 */
export function aprToApy(apr: number, compoundingFrequency = 365): number {
  return Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1;
}

/**
 * Calculate APR from APY
 * @param apy - Annual Percentage Yield (as decimal)
 * @param compoundingFrequency - Number of times interest compounds per year
 * @returns Annual Percentage Rate (as decimal)
 *
 * @example
 * apyToApr(0.0513, 365) // Reverse calculation
 */
export function apyToApr(apy: number, compoundingFrequency = 365): number {
  return (Math.pow(1 + apy, 1 / compoundingFrequency) - 1) * compoundingFrequency;
}

/**
 * Calculate utilization rate
 * @param totalBorrowed - Total amount borrowed
 * @param totalSupplied - Total amount supplied
 * @returns Utilization rate (0-1)
 *
 * @example
 * calculateUtilization(800000, 1000000) // 0.8 (80% utilized)
 */
export function calculateUtilization(totalBorrowed: number, totalSupplied: number): number {
  if (totalSupplied === 0) return 0;
  return clamp(totalBorrowed / totalSupplied, 0, 1);
}

/**
 * Calculate borrow APY based on utilization rate
 * Uses a kinked interest rate model
 * @param utilization - Utilization rate (0-1)
 * @param baseRate - Base interest rate (0-1)
 * @param multiplier - Rate multiplier before kink
 * @param jumpMultiplier - Rate multiplier after kink
 * @param kink - Utilization rate threshold (0-1)
 * @returns Borrow APY (0-1)
 *
 * @example
 * calculateBorrowAPY(0.8, 0.02, 0.1, 2.0, 0.8) // At kink point
 */
export function calculateBorrowAPY(
  utilization: number,
  baseRate = 0.02,
  multiplier = 0.1,
  jumpMultiplier = 2.0,
  kink = 0.8
): number {
  if (utilization <= kink) {
    return baseRate + utilization * multiplier;
  }
  const excessUtilization = utilization - kink;
  return baseRate + kink * multiplier + excessUtilization * jumpMultiplier;
}

/**
 * Calculate supply APY from borrow APY and utilization
 * @param borrowAPY - Borrow APY (0-1)
 * @param utilization - Utilization rate (0-1)
 * @param reserveFactor - Reserve factor (0-1), portion kept by protocol
 * @returns Supply APY (0-1)
 *
 * @example
 * calculateSupplyAPY(0.08, 0.8, 0.1) // 80% utilization, 10% reserve
 */
export function calculateSupplyAPY(
  borrowAPY: number,
  utilization: number,
  reserveFactor = 0.1
): number {
  return borrowAPY * utilization * (1 - reserveFactor);
}

/**
 * Calculate health factor for a lending position
 * @param collateralValue - Total collateral value in USD
 * @param borrowValue - Total borrow value in USD
 * @param liquidationThreshold - Liquidation threshold (0-1)
 * @returns Health factor (>1 is safe, <1 is liquidatable)
 *
 * @example
 * calculateHealthFactor(10000, 6000, 0.8) // 1.33 (safe)
 * calculateHealthFactor(10000, 8500, 0.8) // 0.94 (liquidatable)
 */
export function calculateHealthFactor(
  collateralValue: number,
  borrowValue: number,
  liquidationThreshold = 0.8
): number {
  if (borrowValue === 0) return Infinity;
  return (collateralValue * liquidationThreshold) / borrowValue;
}

/**
 * Calculate maximum borrow amount for a collateral value
 * @param collateralValue - Collateral value in USD
 * @param ltv - Loan-to-Value ratio (0-1)
 * @returns Maximum borrow amount in USD
 *
 * @example
 * calculateMaxBorrow(10000, 0.75) // 7500 (can borrow up to 75% of collateral)
 */
export function calculateMaxBorrow(collateralValue: number, ltv = 0.75): number {
  return collateralValue * ltv;
}

/**
 * Calculate liquidation price for a position
 * @param collateralAmount - Amount of collateral tokens
 * @param borrowAmount - Amount borrowed in USD
 * @param liquidationThreshold - Liquidation threshold (0-1)
 * @returns Liquidation price per collateral token
 *
 * @example
 * calculateLiquidationPrice(10, 6000, 0.8) // $750 per token
 */
export function calculateLiquidationPrice(
  collateralAmount: number,
  borrowAmount: number,
  liquidationThreshold = 0.8
): number {
  if (collateralAmount === 0) return 0;
  return borrowAmount / (collateralAmount * liquidationThreshold);
}

/**
 * Calculate price impact for a swap
 * @param inputAmount - Input token amount
 * @param outputAmount - Output token amount
 * @param inputPrice - Input token price
 * @param outputPrice - Output token price
 * @returns Price impact as decimal (0.01 = 1% impact)
 *
 * @example
 * calculatePriceImpact(1000, 950, 1, 1) // 0.05 (5% negative impact)
 */
export function calculatePriceImpact(
  inputAmount: number,
  outputAmount: number,
  inputPrice: number,
  outputPrice: number
): number {
  const inputValue = inputAmount * inputPrice;
  const outputValue = outputAmount * outputPrice;
  return (inputValue - outputValue) / inputValue;
}

/**
 * Calculate slippage-adjusted output amount
 * @param amount - Input amount
 * @param slippageBps - Slippage in basis points (100 = 1%)
 * @returns Minimum output amount accounting for slippage
 *
 * @example
 * calculateSlippageAmount(1000, 50) // 995 (0.5% slippage)
 */
export function calculateSlippageAmount(amount: number, slippageBps: number): number {
  const slippagePercent = slippageBps / 10000;
  return amount * (1 - slippagePercent);
}

/**
 * Convert basis points to percentage
 * @param bps - Basis points
 * @returns Percentage as decimal (0.01 = 1%)
 *
 * @example
 * bpsToPercent(50) // 0.005 (0.5%)
 * bpsToPercent(10000) // 1 (100%)
 */
export function bpsToPercent(bps: number): number {
  return bps / 10000;
}

/**
 * Convert percentage to basis points
 * @param percent - Percentage as decimal (0.01 = 1%)
 * @returns Basis points
 *
 * @example
 * percentToBps(0.005) // 50 (0.5%)
 * percentToBps(1) // 10000 (100%)
 */
export function percentToBps(percent: number): number {
  return Math.round(percent * 10000);
}

/**
 * Round to specific decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 *
 * @example
 * roundToDecimals(3.14159, 2) // 3.14
 * roundToDecimals(1.005, 2) // 1.01
 */
export function roundToDecimals(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate weighted average
 * @param values - Array of values
 * @param weights - Array of weights
 * @returns Weighted average
 *
 * @example
 * weightedAverage([10, 20, 30], [1, 2, 3]) // 23.33
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
  return weightedSum / totalWeight;
}

/**
 * Calculate moving average
 * @param values - Array of values
 * @param period - Period for moving average
 * @returns Moving average
 *
 * @example
 * movingAverage([1, 2, 3, 4, 5], 3) // [2, 3, 4]
 */
export function movingAverage(values: number[], period: number): number[] {
  if (values.length < period) return [];

  const result: number[] = [];
  for (let i = period - 1; i < values.length; i++) {
    const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

/**
 * Calculate standard deviation
 * @param values - Array of values
 * @returns Standard deviation
 *
 * @example
 * standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]) // 2
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 *
 * @example
 * lerp(0, 100, 0.5) // 50
 * lerp(10, 20, 0.25) // 12.5
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Check if a number is within a range (inclusive)
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if within range
 *
 * @example
 * inRange(5, 0, 10) // true
 * inRange(15, 0, 10) // false
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Calculate annualized return
 * @param initialValue - Initial investment value
 * @param finalValue - Final investment value
 * @param days - Number of days held
 * @returns Annualized return as decimal
 *
 * @example
 * annualizedReturn(1000, 1100, 365) // 0.1 (10% annual return)
 */
export function annualizedReturn(initialValue: number, finalValue: number, days: number): number {
  if (initialValue === 0 || days === 0) return 0;
  const totalReturn = (finalValue - initialValue) / initialValue;
  return Math.pow(1 + totalReturn, 365 / days) - 1;
}
