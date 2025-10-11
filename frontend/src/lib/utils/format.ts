/**
 * Formatting Utilities
 * Common formatting functions for currency, percentages, addresses, and dates
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500000) // "$1.5M"
 * formatCurrency(1500) // "$1.5K"
 * formatCurrency(10.5) // "$10.50"
 */
export function formatCurrency(
  amount: number,
  options: {
    compact?: boolean;
    decimals?: number;
    symbol?: string;
  } = {}
): string {
  const { compact = true, decimals = 2, symbol = '$' } = options;

  // Handle invalid numbers
  if (isNaN(amount) || !isFinite(amount)) {
    return `${symbol}0.00`;
  }

  // Compact format for large numbers
  if (compact) {
    if (amount >= 1e9) {
      return `${symbol}${(amount / 1e9).toFixed(1)}B`;
    }
    if (amount >= 1e6) {
      return `${symbol}${(amount / 1e6).toFixed(1)}M`;
    }
    if (amount >= 1e3) {
      return `${symbol}${(amount / 1e3).toFixed(1)}K`;
    }
  }

  // Standard format
  return `${symbol}${amount.toFixed(decimals)}`;
}

/**
 * Format a number as percentage
 * @param value - The value to format (0-1 or 0-100 based on isDecimal)
 * @param options - Formatting options
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.0485) // "4.85%"
 * formatPercent(48.5, { isDecimal: false }) // "48.50%"
 * formatPercent(0) // "—"
 */
export function formatPercent(
  value: number,
  options: {
    decimals?: number;
    isDecimal?: boolean;
    showZero?: boolean;
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 2, isDecimal = true, showZero = false, showSign = false } = options;

  // Handle invalid numbers
  if (isNaN(value) || value === 0 || !isFinite(value)) {
    return showZero ? '0.00%' : '—';
  }

  const percentValue = isDecimal ? value * 100 : value;
  const sign = showSign && percentValue > 0 ? '+' : '';

  return `${sign}${percentValue.toFixed(decimals)}%`;
}

/**
 * Format a blockchain address for display
 * @param address - The address to format
 * @param options - Formatting options
 * @returns Formatted address string
 *
 * @example
 * formatAddress("CB...U3YXJ36E") // "CB...J36E"
 * formatAddress("CB...U3YXJ36E", { startChars: 6 }) // "CBJSAO...J36E"
 */
export function formatAddress(
  address: string | null | undefined,
  options: {
    startChars?: number;
    endChars?: number;
  } = {}
): string {
  const { startChars = 4, endChars = 4 } = options;

  if (!address) return '';

  if (address.length <= startChars + endChars) {
    return address;
  }

  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1500000) // "1,500,000"
 * formatNumber(1234.5678, 2) // "1,234.57"
 */
export function formatNumber(value: number, decimals = 0): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format APY value
 * @param apy - The APY value (0-1)
 * @param decimals - Number of decimal places
 * @returns Formatted APY string
 *
 * @example
 * formatAPY(0.0485) // "4.85%"
 * formatAPY(0) // "—"
 */
export function formatAPY(apy: number, decimals = 2): string {
  return formatPercent(apy, { decimals, isDecimal: true });
}

/**
 * Format TVL (Total Value Locked)
 * @param tvl - The TVL amount
 * @returns Formatted TVL string
 *
 * @example
 * formatTVL(1500000) // "$1.5M"
 */
export function formatTVL(tvl: number): string {
  return formatCurrency(tvl, { compact: true });
}

/**
 * Format utilization rate
 * @param rate - The utilization rate (0-1)
 * @returns Formatted utilization string
 *
 * @example
 * formatUtilization(0.85) // "85.00%"
 */
export function formatUtilization(rate: number): string {
  return formatPercent(rate, { decimals: 2, isDecimal: true, showZero: true });
}

/**
 * Format health factor
 * @param factor - The health factor
 * @returns Formatted health factor string
 *
 * @example
 * formatHealthFactor(2.5) // "2.50"
 * formatHealthFactor(0) // "—"
 */
export function formatHealthFactor(factor: number): string {
  if (isNaN(factor) || factor === 0 || !isFinite(factor)) {
    return '—';
  }
  return factor.toFixed(2);
}

/**
 * Format a timestamp as a relative time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 minute ago"
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

/**
 * Format a date
 * @param date - Date object or timestamp
 * @param format - Format style ('short' | 'long' | 'time')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "Jan 15, 2024"
 * formatDate(new Date(), 'long') // "January 15, 2024 at 10:30 AM"
 */
export function formatDate(
  date: Date | number,
  format: 'short' | 'long' | 'time' = 'short'
): string {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  if (format === 'time') {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  if (format === 'long') {
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncate a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 *
 * @example
 * truncate("This is a long string", 10) // "This is a..."
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // "1.0 KB"
 * formatFileSize(1048576) // "1.0 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Capitalize first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * capitalize("hello world") // "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param str - String to convert
 * @returns Title case string
 *
 * @example
 * toTitleCase("hello world") // "Hello World"
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}
