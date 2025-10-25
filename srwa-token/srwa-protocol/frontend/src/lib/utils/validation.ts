/**
 * Validation Utilities
 * Common validation functions for forms and data
 */

/**
 * Check if a value is a valid number
 * @param value - Value to check
 * @returns True if valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && !isNaN(value);
}

/**
 * Check if a value is a valid positive number
 * @param value - Value to check
 * @returns True if valid positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  return isValidNumber(value) && value > 0;
}

/**
 * Check if a string is a valid Solana address
 * @param address - Address string to validate
 * @returns True if valid address
 *
 * @example
 * isValidSolanaAddress("CB...J36E") // true
 * isValidSolanaAddress("invalid") // false
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are 32-44 characters, base58 encoded
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}

/**
 * Check if a string is a valid email
 * @param email - Email string to validate
 * @returns True if valid email
 *
 * @example
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid") // false
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 * @param url - URL string to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate transaction amount
 * @param amount - Amount to validate
 * @param options - Validation options
 * @returns Validation result
 *
 * @example
 * validateAmount(100, { min: 10, max: 1000 }) // { valid: true }
 * validateAmount(5, { min: 10 }) // { valid: false, error: "Amount must be at least 10" }
 */
export function validateAmount(
  amount: number,
  options: {
    min?: number;
    max?: number;
    balance?: number;
  } = {}
): { valid: boolean; error?: string } {
  const { min, max, balance } = options;

  if (!isValidNumber(amount)) {
    return { valid: false, error: 'Please enter a valid amount' };
  }

  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  if (min !== undefined && amount < min) {
    return { valid: false, error: `Amount must be at least ${min}` };
  }

  if (max !== undefined && amount > max) {
    return { valid: false, error: `Amount cannot exceed ${max}` };
  }

  if (balance !== undefined && amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }

  return { valid: true };
}

/**
 * Validate APY value
 * @param apy - APY to validate (0-1)
 * @returns True if valid APY
 */
export function isValidAPY(apy: number): boolean {
  return isValidNumber(apy) && apy >= 0 && apy <= 1;
}

/**
 * Validate health factor
 * @param healthFactor - Health factor to validate
 * @returns True if valid health factor
 */
export function isValidHealthFactor(healthFactor: number): boolean {
  return isValidNumber(healthFactor) && healthFactor >= 0;
}

/**
 * Validate utilization rate
 * @param rate - Utilization rate to validate (0-1)
 * @returns True if valid rate
 */
export function isValidUtilizationRate(rate: number): boolean {
  return isValidNumber(rate) && rate >= 0 && rate <= 1;
}

/**
 * Check if health factor is safe
 * @param healthFactor - Health factor to check
 * @param threshold - Safety threshold (default: 1.5)
 * @returns True if safe
 */
export function isHealthFactorSafe(healthFactor: number, threshold = 1.5): boolean {
  return isValidHealthFactor(healthFactor) && healthFactor >= threshold;
}

/**
 * Check if health factor is at risk
 * @param healthFactor - Health factor to check
 * @param threshold - Risk threshold (default: 1.2)
 * @returns True if at risk
 */
export function isHealthFactorAtRisk(healthFactor: number, threshold = 1.2): boolean {
  return isValidHealthFactor(healthFactor) && healthFactor < threshold;
}

/**
 * Validate percentage value
 * @param value - Percentage value to validate
 * @param isDecimal - Whether value is decimal (0-1) or percentage (0-100)
 * @returns True if valid percentage
 */
export function isValidPercentage(value: number, isDecimal = true): boolean {
  if (!isValidNumber(value)) return false;
  if (isDecimal) {
    return value >= 0 && value <= 1;
  }
  return value >= 0 && value <= 100;
}

/**
 * Validate slippage value
 * @param slippage - Slippage in basis points
 * @returns Validation result
 */
export function validateSlippage(slippage: number): { valid: boolean; error?: string } {
  if (!isValidNumber(slippage)) {
    return { valid: false, error: 'Invalid slippage value' };
  }

  if (slippage < 0) {
    return { valid: false, error: 'Slippage cannot be negative' };
  }

  if (slippage > 1000) {
    return { valid: false, error: 'Slippage cannot exceed 10%' };
  }

  if (slippage > 500) {
    return { valid: true, error: 'High slippage warning: Transaction may fail or result in unfavorable rates' };
  }

  return { valid: true };
}

/**
 * Check if a string is empty or whitespace
 * @param str - String to check
 * @returns True if empty
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if a value is defined and not null
 * @param value - Value to check
 * @returns True if defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Validate string length
 * @param str - String to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateStringLength(
  str: string,
  options: {
    min?: number;
    max?: number;
  } = {}
): { valid: boolean; error?: string } {
  const { min, max } = options;

  if (min !== undefined && str.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }

  if (max !== undefined && str.length > max) {
    return { valid: false, error: `Cannot exceed ${max} characters` };
  }

  return { valid: true };
}

/**
 * Check if an array is empty
 * @param arr - Array to check
 * @returns True if empty
 */
export function isEmptyArray<T>(arr: T[] | null | undefined): boolean {
  return !arr || arr.length === 0;
}

/**
 * Check if an object is empty
 * @param obj - Object to check
 * @returns True if empty
 */
export function isEmptyObject(obj: Record<string, unknown> | null | undefined): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Sanitize user input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers
    .trim();
}

/**
 * Validate pool name
 * @param name - Pool name to validate
 * @returns Validation result
 */
export function validatePoolName(name: string): { valid: boolean; error?: string } {
  if (isEmpty(name)) {
    return { valid: false, error: 'Pool name is required' };
  }

  const lengthValidation = validateStringLength(name, { min: 3, max: 100 });
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // Check for valid characters (alphanumeric, spaces, hyphens)
  const validNameRegex = /^[a-zA-Z0-9\s\-]+$/;
  if (!validNameRegex.test(name)) {
    return { valid: false, error: 'Pool name can only contain letters, numbers, spaces, and hyphens' };
  }

  return { valid: true };
}

/**
 * Validate tag
 * @param tag - Tag to validate
 * @returns Validation result
 */
export function validateTag(tag: string): { valid: boolean; error?: string } {
  if (isEmpty(tag)) {
    return { valid: false, error: 'Tag cannot be empty' };
  }

  const lengthValidation = validateStringLength(tag, { max: 20 });
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // Tags should be lowercase alphanumeric with hyphens
  const validTagRegex = /^[a-z0-9\-]+$/;
  if (!validTagRegex.test(tag)) {
    return { valid: false, error: 'Tag must be lowercase letters, numbers, and hyphens only' };
  }

  return { valid: true };
}
