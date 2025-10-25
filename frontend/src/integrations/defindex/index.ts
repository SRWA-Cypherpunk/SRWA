import type { Pool, Position } from '@/types/domain';

// ===== DEFINDEX API CLIENT =====

interface DefIndexApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
}

interface DefIndexPoolAnalytics {
  address: string;
  name: string;
  tvl: number;
  volume24h: number;
  volume7d: number;
  fees24h: number;
  apy: number;
  participants: number;
  transactions: number;
  risk_score: number;
  health_factor: number;
}

interface DefIndexMarketOverview {
  total_tvl: number;
  total_volume_24h: number;
  total_pools: number;
  active_users: number;
  top_pools: DefIndexPoolAnalytics[];
}

// DefIndex API Key
const DEFINDEX_API_KEY = 'sk_d9c9b679ac6582c2db7c54ffecf386c6094e7ad560fb1d22310294fe3b3134d8';

// Enhanced API functions with better error handling and retry logic
export async function fetchPositions(apiBase: string, account: string): Promise<Position[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${apiBase}/api/v1/positions?account=${account}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
          'X-API-Key': DEFINDEX_API_KEY
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No positions found - return empty array
          return [];
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const result: DefIndexApiResponse<Position[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }
      
      return result.data || [];
    } catch (error) {
      lastError = error as Error;
      console.warn(`DefIndex positions fetch attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to fetch positions after ${maxRetries} attempts: ${lastError?.message}`);
}

export async function fetchPool(apiBase: string, address: string): Promise<Pool | null> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
      
      const response = await fetch(`${apiBase}/api/v1/pools/${address}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
          'X-API-Key': DEFINDEX_API_KEY
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Pool not found
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const result: DefIndexApiResponse<Pool> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }
      
      return result.data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`DefIndex pool fetch attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to fetch pool after ${maxRetries} attempts: ${lastError?.message}`);
}

export async function fetchApy(apiBase: string, address: string): Promise<number | null> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${apiBase}/api/v1/pools/${address}/analytics`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
          'X-API-Key': DEFINDEX_API_KEY
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const result: DefIndexApiResponse<DefIndexPoolAnalytics> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }
      
      return result.data?.apy || null;
    } catch (error) {
      lastError = error as Error;
      console.warn(`DefIndex APY fetch attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to fetch APY after ${maxRetries} attempts: ${lastError?.message}`);
}

// ===== NEW ENHANCED API FUNCTIONS =====

export async function fetchPoolAnalytics(apiBase: string, address: string): Promise<DefIndexPoolAnalytics | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${apiBase}/api/v1/pools/${address}/analytics`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
        'X-API-Key': DEFINDEX_API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Analytics API returned ${response.status}: ${response.statusText}`);
    }
    
    const result: DefIndexApiResponse<DefIndexPoolAnalytics> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Analytics API request failed');
    }
    
    return result.data;
  } catch (error) {
    console.error(`Error fetching pool analytics for ${address}:`, error);
    throw error;
  }
}

export async function fetchMarketOverview(apiBase: string): Promise<DefIndexMarketOverview | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${apiBase}/api/v1/markets/overview`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
        'X-API-Key': DEFINDEX_API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Market overview API returned ${response.status}: ${response.statusText}`);
    }
    
    const result: DefIndexApiResponse<DefIndexMarketOverview> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Market overview API request failed');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching market overview:', error);
    throw error;
  }
}

export async function fetchAllPools(apiBase: string): Promise<DefIndexPoolAnalytics[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(`${apiBase}/api/v1/pools`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
        'X-API-Key': DEFINDEX_API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Pools API returned ${response.status}: ${response.statusText}`);
    }
    
    const result: DefIndexApiResponse<DefIndexPoolAnalytics[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Pools API request failed');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching all pools:', error);
    throw error;
  }
}

// ===== API HEALTH CHECK =====

export async function checkApiHealth(apiBase: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${apiBase}/api/v1/health`, {
      headers: {
        'Authorization': `Bearer ${DEFINDEX_API_KEY}`,
        'X-API-Key': DEFINDEX_API_KEY
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    console.warn('DefIndex API health check failed:', error);
    return false;
  }
}