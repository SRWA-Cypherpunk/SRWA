/**
 * Utility functions for formatting numbers, currencies, and percentages
 */

/**
 * Format a number as currency
 * @param value - The numeric value to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number with appropriate suffix (K, M, B)
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with suffix
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  }

  return `${sign}${absValue.toFixed(decimals)}`;
}

/**
 * Format a number as a percentage
 * @param value - The numeric value to format (0.1 = 10%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}`;
}

/**
 * Format a large number with commas
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string with commas
 */
export function formatWithCommas(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a timestamp as a relative time string
 * @param timestamp - Unix timestamp in seconds or Date object
 * @returns Relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const isPast = diff < 0;
  const suffix = isPast ? 'ago' : '';
  const prefix = isPast ? '' : 'in';

  if (days > 0) {
    return `${prefix} ${days} day${days > 1 ? 's' : ''} ${suffix}`.trim();
  }
  if (hours > 0) {
    return `${prefix} ${hours} hour${hours > 1 ? 's' : ''} ${suffix}`.trim();
  }
  if (minutes > 0) {
    return `${prefix} ${minutes} minute${minutes > 1 ? 's' : ''} ${suffix}`.trim();
  }

  return isPast ? 'just now' : 'soon';
}

/**
 * Format a date in a consistent format
 * @param date - Date object or timestamp
 * @param format - Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | number,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = date instanceof Date ? date : new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' },
  }[format];

  return d.toLocaleDateString('en-US', options);
}

/**
 * Format wallet address with ellipsis
 * @param address - Wallet address string
 * @param chars - Number of characters to show at start and end (default: 4)
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format token amount with appropriate decimals
 * @param amount - Raw token amount
 * @param decimals - Token decimals (default: 6 for USDC)
 * @param displayDecimals - Number of decimals to display (default: 2)
 * @returns Formatted token amount
 */
export function formatTokenAmount(
  amount: number | string,
  decimals: number = 6,
  displayDecimals: number = 2
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const adjusted = value / Math.pow(10, decimals);
  return adjusted.toFixed(displayDecimals);
}

/**
 * Format APY/APR with appropriate styling
 * @param value - APY/APR value (5.5 = 5.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted APY/APR string
 */
export function formatAPY(value: number, decimals: number = 2): string {
  if (value === 0) return '0%';
  if (value < 0.01) return '<0.01%';
  if (value > 100) return '>100%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format risk level as a readable string
 * @param level - Risk level ('low', 'medium', 'high', 'experimental')
 * @returns Formatted risk level string
 */
export function formatRiskLevel(level: string): string {
  const levels: Record<string, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    experimental: 'Experimental',
  };
  return levels[level.toLowerCase()] || 'Unknown Risk';
}

/**
 * Format phase status as a readable string
 * @param phase - Phase string from smart contract
 * @returns Formatted phase string
 */
export function formatPhase(phase: string): string {
  return phase
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
}