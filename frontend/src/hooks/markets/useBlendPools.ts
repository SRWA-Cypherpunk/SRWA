import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BlendPool, BlendReserve, BlendAsset, UseBlendPoolsReturn, BlendError } from '@/types/lending';

// ===== ORIGINAL BLEND SDK INTEGRATION (COMMENTED OUT FOR MOCK IMPLEMENTATION) =====
/*
import { Network, PoolV2, PoolOracle, PoolFactoryContractV2 } from '@blend-capital/blend-sdk';
import { StellarSdk } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '@/lib/stellar-config';
import { fallbackPricingService, getMultipleAssetPrices } from '@/lib/pricing/fallback-pricing';

// Blend SDK Network Configuration for real pool data
const MAINNET_NETWORK: Network = {
  rpc: 'https://soroban-rpc.mainnet.stellar.org',
  passphrase: 'Public Global Stellar Network ; September 2015'
};

// Blend SDK Testnet Network Configuration (using same RPC as Oracle)
const TESTNET_NETWORK: Network = {
  rpc: 'https://soroban-testnet.stellar.org',
  passphrase: 'Test SDF Network ; September 2015'
};

// Known Blend Factory contracts - real addresses from blend-utils
const BLEND_FACTORY_ADDRESSES = {
  MAINNET_V2: 'CALI2BYU2JE6WVRUFYTS6MSBNEHGJ35P4AVCZYF3B6QOE3QKOB2PLE6M', // Real mainnet factory
  TESTNET_V2: 'CDSMKKCWEAYQW4DAUSH3XGRMIVIJB44TZ3UA5YCRHT6MP4LWEWR4GYV6'  // Real testnet factory
};
*/

// ===== ORIGINAL BLEND SDK CLIENT (COMMENTED OUT FOR MOCK IMPLEMENTATION) =====
/*
class BlendSDKClient {
  private network: Network;
  private factoryAddress: string;
  private fallbackRpcUrls: string[];
  private currentRpcIndex: number = 0;

  constructor() {
    // Use the configured network from environment (can be testnet or mainnet)
    const useMainnet = STELLAR_CONFIG.network === 'mainnet';
    this.network = useMainnet ? MAINNET_NETWORK : TESTNET_NETWORK;
    this.factoryAddress = useMainnet ? BLEND_FACTORY_ADDRESSES.MAINNET_V2 : BLEND_FACTORY_ADDRESSES.TESTNET_V2;
    
    // Setup fallback RPCs like Oracle
    this.fallbackRpcUrls = useMainnet 
      ? ['https://soroban-rpc.mainnet.stellar.org', 'https://mainnet.sorobanrpc.com']
      : ['https://soroban-rpc.testnet.stellar.org', 'https://rpc-testnet.stellar.org'];
    
    console.log(`🚀🚀🚀 BLEND SDK CLIENT STARTING 🚀🚀🚀`);
    console.log(`🏦 BlendSDKClient configured for ${STELLAR_CONFIG.network.toUpperCase()} pools (from env)`);
    console.log(`📡 Pool RPC: ${this.network.rpc}`);
    console.log(`🔄 Fallback RPCs: ${this.fallbackRpcUrls.length} available`);
    console.log(`🏭 Factory: ${this.factoryAddress}`);
    console.log(`🔧 STELLAR_CONFIG:`, STELLAR_CONFIG);
  }

  private async tryWithRpcFallback<T>(operation: (network: Network) => Promise<T>): Promise<T> {
    const allRpcUrls = [this.network.rpc, ...this.fallbackRpcUrls];
    
    for (let i = 0; i < allRpcUrls.length; i++) {
      const rpcUrl = allRpcUrls[(this.currentRpcIndex + i) % allRpcUrls.length];
      const networkWithRpc = { ...this.network, rpc: rpcUrl };
      
      try {
        console.log(`🔗 Trying Blend RPC: ${rpcUrl}`);
        const result = await operation(networkWithRpc);
        
        // Success - update current RPC if we switched
        if (i > 0) {
          this.currentRpcIndex = (this.currentRpcIndex + i) % allRpcUrls.length;
          this.network = networkWithRpc;
          console.log(`✅ Switched to Blend RPC: ${rpcUrl}`);
        }
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`❌ Blend RPC ${rpcUrl} failed:`, errorMessage);
        
        // If this is the last RPC to try, throw the error
        if (i === allRpcUrls.length - 1) {
          throw error;
        }
        
        continue; // Try next RPC
      }
    }
    
    throw new Error('All Blend RPC endpoints failed');
  }

  async getOfficialPoolAddresses(): Promise<string[]> {
    try {
      console.log('🏢 Loading official Blend Protocol pool addresses...');
      const isMainnet = this.network.passphrase.includes('Public Global');
      
      // Official Blend Protocol pools - known and verified addresses
      console.log(`📋 Using official pool addresses for ${isMainnet ? 'MAINNET' : 'TESTNET'}`);
      
      if (isMainnet) {
        const OFFICIAL_MAINNET_POOLS = [
          // Official Blend V2 pools - verified addresses from Blend Protocol
          'CAFI54LHZPQKT7XKZPO34BKNXQY6EOAYQP2LEKB6CPFMSGYWEQZ33DUJ', // Main lending pool
          'CA3YKL4HKRWLMQZXLZM2Y3UU6IXZJQXVNP4RSZGRNLGN5SVDCJGCPQHS'  // Secondary pool
        ];
        
        console.log(`🏢 Official mainnet pools: ${OFFICIAL_MAINNET_POOLS.length} addresses`);
        return OFFICIAL_MAINNET_POOLS;
      } else {
        const OFFICIAL_TESTNET_POOLS = [
          // Official testnet pools from Blend Protocol
          'CDDG7DLOWSHRYQ2HWGZEZ4UTR7LPTKFFHN3QUCSZEXOWOPARMONX6T65', // TestnetV2 Pool (working)
          'CBHWKF4RHIKOKSURAKXSJRIIA7RJAMJH4VHRVPYGUF4AJ5L544LYZ35X', // Backstop V2
          'CCQ74HNBMLYICEFUGNLM23QQJU7BKZS7CXC7OAOX4IHRT3LDINZ4V3AF'  // Comet
        ];
        
        console.log(`🧪 Official testnet pools: ${OFFICIAL_TESTNET_POOLS.length} addresses`);
        return OFFICIAL_TESTNET_POOLS;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('💥 Critical error in pool address discovery:', error);
      
      // Final emergency fallback - return minimal pool set
      const emergencyPools = this.network.passphrase.includes('Public Global')
        ? ['CAFI54LHZPQKT7XKZPO34BKNXQY6EOAYQP2LEKB6CPFMSGYWEQZ33DUJ'] // Mainnet
        : ['CDDG7DLOWSHRYQ2HWGZEZ4UTR7LPTKFFHN3QUCSZEXOWOPARMONX6T65']; // Testnet
      
      console.warn(`🚨 Using emergency fallback pools: ${emergencyPools.length} addresses`);
      return emergencyPools;
    }
  }

  async getPoolData(poolAddress: string): Promise<BlendPool> {
    try {
      // Try to fetch real pool data from Blend protocol contracts
      console.log(`Fetching real pool data for ${poolAddress}...`);
      
      // Note: This would use PoolV2.load(mainnetNetwork, poolAddress) in production
      // For now, we'll try to construct real data or fallback to realistic mock data
      
      // Always try to fetch real pool data first
      return await this.getRealPoolData(poolAddress);
    } catch (error) {
      console.error(`Error fetching pool data for ${poolAddress}:`, error);
      throw new Error(`Failed to fetch pool data for ${poolAddress}: ${error.message}`);
    }
  }
  
  private async getRealPoolData(poolAddress: string): Promise<BlendPool> {
    try {
      console.log(`🏦 Loading real pool data from Blend SDK for ${poolAddress}...`);
      
      // Try current network first (testnet or mainnet based on config)
      let blendPool;
      try {
        blendPool = await this.tryWithRpcFallback(async (network) => {
          return await PoolV2.load(network, poolAddress);
        });
        console.log(`✅ Successfully loaded pool data from ${STELLAR_CONFIG.network.toUpperCase()} contracts`);
      } catch (testnetError) {
        console.warn(`⚠️ Failed to load from ${STELLAR_CONFIG.network.toUpperCase()}, trying MAINNET fallback...`, testnetError);
        
        // If testnet fails or pools are empty, try mainnet for demo data
        console.log(`🔄 Trying mainnet pool addresses for liquidity...`);
        const mainnetPoolAddresses = [
          'CAFI54LHZPQKT7XKZPO34BKNXQY6EOAYQP2LEKB6CPFMSGYWEQZ33DUJ', // Blend V2 Primary Pool
          'CA3YKL4HKRWLMQZXLZM2Y3UU6IXZJQXVNP4RSZGRNLGN5SVDCJGCPQHS'  // Alternative pool
        ];
        
        let mainnetSuccess = false;
        for (const mainnetPool of mainnetPoolAddresses) {
          try {
            blendPool = await this.tryMainnetPool(mainnetPool);
            console.log(`✅ Successfully loaded mainnet pool ${mainnetPool} for demo data`);
            mainnetSuccess = true;
            break;
          } catch (mainnetError) {
            console.warn(`⚠️ Mainnet pool ${mainnetPool} failed:`, mainnetError);
          }
        }
        
        if (!mainnetSuccess) {
          throw new Error(`Failed to load pool from both testnet and mainnet`);
        }
        console.log(`✅ Successfully loaded pool data from MAINNET contracts (fallback)`);
      }
      
      // Load oracle data for price information
      let poolOracle = null;
      try {
        poolOracle = await blendPool.loadOracle();
        console.log(`✅ Successfully loaded pool oracle data`);
      } catch (oracleError) {
        console.warn(`⚠️ Failed to load pool oracle, continuing without oracle data:`, oracleError);
      }
      
      // Convert Blend SDK pool to our BlendPool interface and add pricing data
      return await this.convertBlendSDKToBlendPool(blendPool, poolOracle);
    } catch (error) {
      console.error(`❌ Failed to load real pool data for ${poolAddress}:`, error);
      throw new Error(`Failed to load pool data from Blend Protocol: ${error.message}`);
    }
  }
  
  // ===== BLEND SDK CONVERSION =====
  
  private async convertBlendSDKToBlendPool(blendPool: any, poolOracle: any): Promise<BlendPool> {
    try {
      console.log('🔄 Converting Blend SDK pool data to BlendPool format...');
      
      // === DEBUG: FULL POOL STRUCTURE ===
      console.log('🧪 DEBUG: Full blendPool object structure:', {
        keys: Object.keys(blendPool),
        id: blendPool.id,
        reservesType: typeof blendPool.reserves,
        reservesIsArray: Array.isArray(blendPool.reserves),
        reservesIsMap: blendPool.reserves instanceof Map,
        reservesLength: blendPool.reserves?.length || blendPool.reserves?.size,
        sampleReserves: blendPool.reserves
      });
      
      // Extract basic pool information
      const poolAddress = blendPool.id || 'unknown';
      const poolName = `Blend Pool ${poolAddress.slice(-4)}`;
      
      // Convert reserves data - handle both Array and Map structures
      const reserves: BlendReserve[] = [];
      
      if (blendPool.reserves) {
        console.log('🔍 Processing reserves...');
        
        if (blendPool.reserves instanceof Map) {
          // Handle Map<string, Reserve> structure (correct SDK type)
          console.log(`📋 Processing ${blendPool.reserves.size} reserves from Map`);
          let reserveIndex = 0;
          for (const [assetAddress, reserveData] of blendPool.reserves.entries()) {
            try {
              console.log(`🔍 Processing reserve ${reserveIndex} for asset ${assetAddress}:`, reserveData);
              const reserve = this.convertBlendReserveToBlendReserve(reserveData, reserveIndex, assetAddress);
              if (reserve) {
                reserves.push(reserve);
                console.log(`✅ Successfully converted reserve ${reserveIndex} for ${assetAddress}`);
              }
            } catch (err) {
              console.warn(`⚠️ Failed to convert reserve ${reserveIndex} for ${assetAddress}:`, err);
            }
            reserveIndex++;
          }
        } else if (Array.isArray(blendPool.reserves)) {
          // Handle Array structure (fallback)
          console.log(`📋 Processing ${blendPool.reserves.length} reserves from Array`);
          for (const [reserveIndex, reserveData] of blendPool.reserves.entries()) {
            try {
              console.log(`🔍 Processing reserve ${reserveIndex}:`, reserveData);
              const reserve = this.convertBlendReserveToBlendReserve(reserveData, reserveIndex);
              if (reserve) {
                reserves.push(reserve);
                console.log(`✅ Successfully converted reserve ${reserveIndex}`);
              }
            } catch (err) {
              console.warn(`⚠️ Failed to convert reserve ${reserveIndex}:`, err);
            }
          }
        } else {
          console.warn('⚠️ Unknown reserves structure:', typeof blendPool.reserves, blendPool.reserves);
        }
      } else {
        console.warn('⚠️ No reserves found in pool data');
      }
      
      console.log(`✅ Converted ${reserves.length} reserves from Blend SDK`);
      
      // Fetch pricing data for all assets in the pool
      console.log('💰 Fetching pricing data for pool assets...');
      const assetCodes = reserves.map(r => r.asset.code).filter(code => code !== 'UNKNOWN');
      let assetPrices: { [asset: string]: any } = {};
      
      if (assetCodes.length > 0) {
        try {
          assetPrices = await getMultipleAssetPrices(assetCodes);
          console.log(`✅ Fetched prices for ${Object.keys(assetPrices).length}/${assetCodes.length} assets`);
        } catch (pricingError) {
          console.warn('⚠️ Failed to fetch pricing data, continuing without prices:', pricingError);
        }
      }
      
      // Update reserves with pricing data
      for (const reserve of reserves) {
        const assetPrice = assetPrices[reserve.asset.code];
        if (assetPrice) {
          // Add price information to the asset
          (reserve.asset as any).price = assetPrice.price;
          (reserve.asset as any).priceSource = assetPrice.source;
          (reserve.asset as any).priceConfidence = assetPrice.confidence;
          (reserve.asset as any).priceTimestamp = assetPrice.timestamp;
          
          console.log(`💰 ${reserve.asset.code}: $${assetPrice.price} (${assetPrice.source})`);
        }
      }
      
      // Calculate pool-level metrics
      const totalSupply = reserves.reduce((sum, r) => sum + Number(r.totalSupply), 0);
      const totalBorrowed = reserves.reduce((sum, r) => sum + Number(r.totalBorrowed), 0);
      const totalLiquidity = reserves.reduce((sum, r) => sum + Number(r.availableLiquidity), 0);
      
      const avgSupplyAPY = reserves.length > 0 
        ? reserves.reduce((sum, r) => sum + r.supplyAPY, 0) / reserves.length 
        : 0;
      const avgBorrowAPY = reserves.length > 0 
        ? reserves.reduce((sum, r) => sum + r.borrowAPY, 0) / reserves.length 
        : 0;
      
      const utilizationRate = totalSupply > 0 ? totalBorrowed / totalSupply : 0;
      
      const convertedPool: BlendPool = {
        address: poolAddress,
        name: poolName,
        class: this.determinePoolClass(poolName),
        reserves,
        backstopRate: blendPool.backstop_rate || 0.1,
        status: this.determinePoolStatus(blendPool),
        totalSupply: BigInt(totalSupply),
        totalBorrowed: BigInt(totalBorrowed),
        totalLiquidity: BigInt(totalLiquidity),
        averageSupplyAPY: avgSupplyAPY,
        averageBorrowAPY: avgBorrowAPY,
        utilizationRate,
        createdAt: Date.now() - 86400000 * 30, // Default to 30 days ago
        lastUpdated: Date.now()
      };
      
      console.log(`✅ Successfully converted Blend SDK pool to BlendPool format`);
      return convertedPool;
      
    } catch (error) {
      console.error('❌ Error converting Blend SDK pool data:', error);
      throw new Error(`Failed to convert pool data: ${error.message}`);
    }
  }
  
  private convertBlendReserveToBlendReserve(reserveData: any, index: number, providedAssetAddress?: string): BlendReserve | null {
    try {
      // Extract asset information - use provided address from Map key if available
      const assetAddress = providedAssetAddress || reserveData.assetId || reserveData.asset_address || reserveData.asset || `asset_${index}`;
      const assetCode = this.getAssetCode(assetAddress);
      
      console.log(`🔍 Asset identification: address=${assetAddress}, code=${assetCode}`);
      
      // === DEBUG: RESERVE DATA STRUCTURE ===
      console.log(`🧪 DEBUG: Reserve ${index} data structure:`, {
        assetAddress,
        dataKeys: Object.keys(reserveData),
        dataStructure: reserveData,
        // Correct Blend SDK fields
        dSupply: reserveData.data?.dSupply,
        bSupply: reserveData.data?.bSupply,
        supplyApr: reserveData.supplyApr,
        borrowApr: reserveData.borrowApr,
        estSupplyApy: reserveData.estSupplyApy,
        estBorrowApy: reserveData.estBorrowApy
      });
      
      const asset: BlendAsset = {
        code: assetCode,
        contractAddress: assetAddress,
        decimals: this.getAssetDecimals(assetAddress),
        symbol: this.getAssetSymbol(assetAddress),
        name: this.getAssetName(assetAddress),
        logoURI: this.getAssetLogoURI(assetAddress)
      };
      
      // Extract reserve financial data using correct Blend SDK fields
      const totalSupply = BigInt(reserveData.data?.dSupply || '0');
      const totalBorrowed = BigInt(reserveData.data?.bSupply || '0');
      const availableLiquidity = totalSupply - totalBorrowed;
      
      // Use pre-calculated APY from Blend SDK (already in correct format)
      const supplyAPY = reserveData.estSupplyApy || 0;
      const borrowAPY = reserveData.estBorrowApy || 0;
      
      const utilizationRate = Number(totalSupply) > 0 
        ? Number(totalBorrowed) / Number(totalSupply) 
        : 0;
      
      const reserve: BlendReserve = {
        asset,
        totalSupply,
        totalBorrowed,
        availableLiquidity,
        supplyAPY,
        borrowAPY,
        utilizationRate,
        collateralFactor: (reserveData.c_factor || 80) / 100, // Convert from percentage
        liquidationFactor: (reserveData.l_factor || 85) / 100,
        lastUpdated: Date.now(),
        enabled: reserveData.enabled !== false,
        borrowable: reserveData.borrowable !== false,
        collateralCap: BigInt(reserveData.c_cap || '0'),
        borrowCap: BigInt(reserveData.b_cap || '0')
      };
      
      return reserve;
    } catch (error) {
      console.warn(`⚠️ Failed to convert reserve ${index}:`, error);
      return null;
    }
  }

  // ===== HELPER METHODS =====
  
  private getAssetCode(contractAddress: string): string {
    // Map known contract addresses to asset codes
    const assetMap: { [key: string]: string } = {
      // Real testnet asset addresses from pool reserves
      'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC': 'USDC',
      'CAZAQB3D7KSLSNOSQKYD2V4JP5V2Y3B4RDJZRLBFCCIXDCTE3WHSY3UE': 'XLM',  
      'CAP5AMC2OHNVREO66DFIN6DHJMPOBAJ2KCDDIMFBR7WWJH5RZBFM3UEI': 'USDT',
      'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU': 'BLND',
      
      // Common mainnet addresses (for future use)
      'CA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA': 'USDC',
      'CBTKUB5UGXWVJ5CDLHYAHFQFH4SQQPGM2P6KBQZABN6ZED5RTYQRMLTM': 'USDT'
    };
    
    const mapped = assetMap[contractAddress];
    if (mapped) {
      console.log(`✅ Asset mapped: ${contractAddress.slice(-8)} → ${mapped}`);
    } else {
      console.warn(`⚠️ Unknown asset: ${contractAddress.slice(-8)} → UNKNOWN`);
    }
    
    return mapped || 'UNKNOWN';
  }
  
  private getAssetDecimals(contractAddress: string): number {
    const code = this.getAssetCode(contractAddress);
    return code === 'XLM' ? 7 : 6; // XLM has 7 decimals, most others have 6
  }
  
  private getAssetSymbol(contractAddress: string): string {
    return this.getAssetCode(contractAddress);
  }
  
  private getAssetName(contractAddress: string): string {
    const nameMap: { [key: string]: string } = {
      'XLM': 'Stellar Lumens',
      'USDC': 'USD Coin',
      'USDT': 'Tether USD',
      'BLND': 'Blend Token'
    };
    
    const code = this.getAssetCode(contractAddress);
    return nameMap[code] || `Asset ${code}`;
  }
  
  private getAssetLogoURI(contractAddress: string): string {
    const logoMap: { [key: string]: string } = {
      'XLM': 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
      'USDC': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
      'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png',
      'BLND': 'https://blend.capital/logo.svg'
    };
    
    const code = this.getAssetCode(contractAddress);
    return logoMap[code] || '';
  }
  
  private calculateAPY(rate: number): number {
    // Convert rate to APY percentage
    // This is a simplified calculation - real implementation would be more complex
    return rate * 100;
  }
  
  private determinePoolClass(name: string): 'TBill' | 'Receivables' | 'CRE' {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('tbill') || nameLower.includes('treasury')) return 'TBill';
    if (nameLower.includes('receivables') || nameLower.includes('invoice')) return 'Receivables';
    if (nameLower.includes('cre') || nameLower.includes('real estate')) return 'CRE';
    return 'TBill'; // Default
  }
  
  private determinePoolStatus(pool: any): 'Active' | 'Paused' | 'Degraded' {
    try {
      console.log(`🔍 Determining status for pool with data:`, {
        poolKeys: Object.keys(pool),
        status: pool.status,
        metadata: pool.metadata,
        admin: pool.admin,
        config: pool.config
      });
      
      // Check if pool is administratively paused
      if (pool.paused === true || pool.admin_paused === true) {
        console.log(`⏸️ Pool is administratively paused`);
        return 'Paused';
      }
      
      // Check pool status field if available
      if (pool.status !== undefined) {
        if (pool.status === 0 || pool.status === 'paused') return 'Paused';
        if (pool.status === 2 || pool.status === 'degraded') return 'Degraded';
      }
      
      // Check metadata status field
      if (pool.metadata?.status !== undefined) {
        if (pool.metadata.status === 0) return 'Paused';
        if (pool.metadata.status === 2) return 'Degraded';
      }
      
      // Check reserves health
      if (pool.reserves) {
        let disabledReserves = 0;
        let totalReserves = 0;
        
        // Handle both Map and Array structures
        if (pool.reserves instanceof Map) {
          totalReserves = pool.reserves.size;
          for (const [_, reserve] of pool.reserves) {
            if (reserve.enabled === false || reserve.status === 'disabled') {
              disabledReserves++;
            }
          }
        } else if (Array.isArray(pool.reserves)) {
          totalReserves = pool.reserves.length;
          disabledReserves = pool.reserves.filter(r => 
            r.enabled === false || r.status === 'disabled'
          ).length;
        }
        
        if (disabledReserves > 0) {
          console.log(`⚠️ Pool has ${disabledReserves}/${totalReserves} disabled reserves`);
          return 'Degraded';
        }
      }
      
      // Check oracle health
      if (pool.oracle_stale === true || pool.oracle_healthy === false) {
        console.log(`⚠️ Pool oracle is stale or unhealthy`);
        return 'Degraded';
      }
      
      // Check if pool has sufficient liquidity
      if (pool.totalLiquidity !== undefined && Number(pool.totalLiquidity) <= 0) {
        console.log(`⚠️ Pool has zero liquidity`);
        return 'Degraded';
      }
      
      // Default to Active if no issues found
      console.log(`✅ Pool appears to be active and healthy`);
      return 'Active';
      
    } catch (error) {
      console.warn('⚠️ Error determining pool status, defaulting to Degraded:', error);
      return 'Degraded';
    }
  }
  
  // ===== MOCK DATA REMOVED =====
  // Mock data fallback has been completely removed to force real data usage

  async getAllPools(): Promise<BlendPool[]> {
    try {
      console.log('🔍 Discovering all real pools from Blend Protocol...');
      
      // Get official Blend pools (known addresses)
      const officialPoolAddresses = await this.getOfficialPoolAddresses();
      console.log(`📋 Found ${officialPoolAddresses.length} official pool addresses`);
      
      // Discover community pools via factory contract
      const communityPoolAddresses = await this.discoverCommunityPools();
      console.log(`🏘️ Discovered ${communityPoolAddresses.length} community pool addresses`);
      
      // Combine all pool addresses
      const allPoolAddresses = [...officialPoolAddresses, ...communityPoolAddresses];
      
      // Load real data for all pools in parallel
      const poolPromises = allPoolAddresses.map(async (address) => {
        try {
          const pool = await this.getPoolData(address);
          
          // Mark as official or community
          if (officialPoolAddresses.includes(address)) {
            pool.poolType = 'official';
            pool.verified = true;
          } else {
            pool.poolType = 'community';
            pool.verified = false;
          }
          
          return pool;
        } catch (error) {
          console.warn(`⚠️ Failed to load pool ${address.slice(-8)}:`, error);
          return null;
        }
      });
      
      const poolResults = await Promise.allSettled(poolPromises);
      const successfulPools = poolResults
        .filter((result): result is PromiseFulfilledResult<BlendPool> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      console.log(`✅ Total real pools loaded: ${successfulPools.length} (${officialPoolAddresses.length} official + ${communityPoolAddresses.length} community)`);
      
      return successfulPools;
    } catch (error) {
      console.error('❌ Error loading pools:', error);
      
      // Fallback to official pools only
      console.log('🔄 Falling back to official pools only...');
      const officialPoolAddresses = await this.getOfficialPoolAddresses();
      const officialPools = await Promise.allSettled(
        officialPoolAddresses.map(address => this.getPoolData(address))
      );
      
      const successfulOfficialPools = officialPools
        .filter((result): result is PromiseFulfilledResult<BlendPool> => result.status === 'fulfilled')
        .map(result => {
          const pool = result.value;
          pool.poolType = 'official';
          pool.verified = true;
          return pool;
        });
      
      console.log(`✅ Fallback complete: ${successfulOfficialPools.length} official pools loaded`);
      return successfulOfficialPools;
    }
  }
  
  // Discover community (non-official) pools via factory contract
  private async discoverCommunityPools(): Promise<string[]> {
    try {
      console.log(`🏘️ Discovering community pools via factory contract...`);
      
      // Get official pool addresses to exclude them
      const officialAddresses = await this.getOfficialPoolAddresses();
      
      // Get candidate pool addresses that might exist
      const poolCandidates = await this.getCommunityPoolCandidates();
      
      // Filter out official pools
      const communityPoolCandidates = poolCandidates.filter(
        address => !officialAddresses.includes(address)
      );
      
      console.log(`🔍 Testing ${communityPoolCandidates.length} community pool candidates...`);
      
      const validCommunityPools: string[] = [];
      
      // Validate each candidate pool by attempting to load it
      for (const poolAddress of communityPoolCandidates) {
        try {
          const isValid = await this.validatePoolViaFactory(poolAddress);
          if (isValid) {
            console.log(`✅ Community pool ${poolAddress.slice(-8)} validated successfully`);
            validCommunityPools.push(poolAddress);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to validate community pool ${poolAddress.slice(-8)}:`, error);
        }
      }
      
      console.log(`🏘️ Community pool discovery complete: ${validCommunityPools.length}/${communityPoolCandidates.length} pools found`);
      return validCommunityPools;
      
    } catch (error) {
      console.warn('❌ Community pool discovery failed:', error);
      return [];
    }
  }

  // Get candidate pool addresses for community pool discovery
  private async getCommunityPoolCandidates(): Promise<string[]> {
    try {
      console.log('🔍 Gathering community pool candidates...');
      
      // In a real implementation, this would:
      // 1. Query the Pool Factory contract for deployed pools
      // 2. Scan blockchain events for pool creation
      // 3. Use known community pool registries
      
      // For now, we'll return a curated list of potential community pools
      // that we can research and validate
      const isMainnet = this.network.passphrase.includes('Public Global');
      
      if (isMainnet) {
        // Mainnet community pool candidates (research needed)
        const candidates = [
          // TODO: Research and add real mainnet community pool addresses
          // These would be pools created by third parties using Blend Protocol
        ];
        
        console.log(`🔍 Found ${candidates.length} mainnet community pool candidates`);
        return candidates;
      } else {
        // Testnet community pool candidates
        const candidates = [
          // TODO: Add real testnet community pool addresses if discovered
          // For now, we'll try to discover any non-official pools
        ];
        
        console.log(`🔍 Found ${candidates.length} testnet community pool candidates`);
        return candidates;
      }
    } catch (error) {
      console.warn('⚠️ Failed to get community pool candidates:', error);
      return [];
    }
  }

  // Validate a pool address via Pool Factory (simplified validation)
  private async validatePoolViaFactory(poolAddress: string): Promise<boolean> {
    try {
      console.log(`🏭 Validating pool ${poolAddress.slice(-8)} via simplified factory check...`);
      
      // Simplified validation - just check if we can load the pool
      // This avoids the StellarRpc import issue while still providing validation
      return await this.tryWithRpcFallback(async (network) => {
        try {
          const testPool = await PoolV2.load(network, poolAddress);
          return testPool && testPool.id === poolAddress;
        } catch (error) {
          console.warn(`Pool ${poolAddress.slice(-8)} failed validation:`, error);
          return false;
        }
      });
    } catch (error) {
      console.warn(`Factory validation failed for ${poolAddress.slice(-8)}:`, error);
      return false; // If validation fails, assume invalid
    }
  }

  // Helper method to try mainnet pools when testnet is empty
  private async tryMainnetPool(poolAddress: string): Promise<any> {
    const mainnetNetwork = MAINNET_NETWORK;
    const fallbackRpcs = ['https://soroban-rpc.mainnet.stellar.org', 'https://mainnet.sorobanrpc.com'];
    
    for (const rpcUrl of fallbackRpcs) {
      try {
        const network = { ...mainnetNetwork, rpc: rpcUrl };
        return await PoolV2.load(network, poolAddress);
      } catch (error) {
        console.warn(`Failed with mainnet RPC ${rpcUrl}:`, error);
        if (rpcUrl === fallbackRpcs[fallbackRpcs.length - 1]) {
          throw error; // Re-throw on last attempt
        }
      }
    }
  }

  // Load community pool data - only real pools from blockchain
  private async getCommunityPoolData(poolAddress: string): Promise<BlendPool | null> {
    try {
      console.log(`🏘️ Loading community pool from blockchain: ${poolAddress.slice(-8)}`);
      
      // Try to load real pool data via Blend SDK
      const realPool = await this.getPoolData(poolAddress);
      
      // Validate that this is real pool data
      if (this.isRealPoolDataValid(realPool)) {
        // Mark as community pool (non-official)
        const communityPool: BlendPool = {
          ...realPool,
          poolType: 'community',
          verified: false, // Community pools are not officially verified
        };
        
        console.log(`✅ Successfully loaded real community pool: ${realPool.name}`);
        return communityPool;
      } else {
        console.warn(`⚠️ Pool data validation failed for ${poolAddress}, skipping`);
        return null;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load community pool ${poolAddress}:`, error);
      return null;
    }
  }

  
  // Validate Stellar contract address format
  private isValidStellarAddress(address: string): boolean {
    // Stellar contract addresses start with 'C' and are 56 characters long
    return /^C[A-Z0-9]{55}$/.test(address);
  }
  
  // Validate real pool data structure
  private isRealPoolDataValid(pool: BlendPool): boolean {
    try {
      // Check required fields
      if (!pool.address || !pool.name || !pool.reserves) {
        return false;
      }
      
      // Check reserves are valid
      if (!Array.isArray(pool.reserves) || pool.reserves.length === 0) {
        return false;
      }
      
      // Check each reserve has required fields
      for (const reserve of pool.reserves) {
        if (!reserve.asset || !reserve.asset.code || !reserve.asset.contractAddress) {
          return false;
        }
        
        if (typeof reserve.supplyAPY !== 'number' || typeof reserve.borrowAPY !== 'number') {
          return false;
        }
        
        if (typeof reserve.totalSupply !== 'bigint' || typeof reserve.totalBorrowed !== 'bigint') {
          return false;
        }
      }
      
      // Check pool metrics are reasonable
      if (typeof pool.averageSupplyAPY !== 'number' || pool.averageSupplyAPY < 0 || pool.averageSupplyAPY > 1) {
        return false; // APY should be between 0-100%
      }
      
      if (typeof pool.utilizationRate !== 'number' || pool.utilizationRate < 0 || pool.utilizationRate > 1) {
        return false; // Utilization should be between 0-100%
      }
      
      console.log(`✅ Pool data validation passed for ${pool.name}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Pool data validation error:`, error);
      return false;
    }
  }
  

}
*/

// ===== HOOK IMPLEMENTATION =====

const BLEND_POOLS_QUERY_KEY = 'blend-pools';
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const STALE_TIME = 60 * 1000; // 1 minute
const BACKGROUND_REFETCH_INTERVAL = 2 * 60 * 1000; // 2 minutes

// ===== MOCK POOLS FOR BETTER PRESENTATION =====
const createMockBlendPools = (): BlendPool[] => {
  const now = Date.now();
  
  // Mock assets with realistic contract addresses
  const mockAssets = {
    USDC: {
      code: 'USDC',
      contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      decimals: 6,
      symbol: 'USDC',
      name: 'USD Coin',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    XLM: {
      code: 'XLM',
      contractAddress: 'CAZAQB3D7KSLSNOSQKYD2V4JP5V2Y3B4RDJZRLBFCCIXDCTE3WHSY3UE',
      decimals: 7,
      symbol: 'XLM',
      name: 'Stellar Lumens',
      logoURI: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png'
    },
    USDT: {
      code: 'USDT',
      contractAddress: 'CAP5AMC2OHNVREO66DFIN6DHJMPOBAJ2KCDDIMFBR7WWJH5RZBFM3UEI',
      decimals: 6,
      symbol: 'USDT',
      name: 'Tether USD',
      logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png'
    },
    BLND: {
      code: 'BLND',
      contractAddress: 'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU',
      decimals: 7,
      symbol: 'BLND',
      name: 'Blend Token',
      logoURI: 'https://blend.capital/logo.svg'
    }
  };

  return [
    // Pool 1: US Treasury Bills - Conservative, High TVL
    {
      address: 'CTBILL4567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789POOL',
      name: 'US Treasury Bills Pool',
      class: 'TBill' as const,
      reserves: [
        {
          asset: mockAssets.USDC,
          totalSupply: BigInt(85000000 * 1000000), // $85M USDC
          totalBorrowed: BigInt(60500000 * 1000000), // $60.5M borrowed
          availableLiquidity: BigInt(24500000 * 1000000), // $24.5M available
          supplyAPY: 0.0485, // 4.85%
          borrowAPY: 0.0595, // 5.95%
          utilizationRate: 0.711, // 71.1%
          collateralFactor: 0.85,
          liquidationFactor: 0.90,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(100000000 * 1000000),
          borrowCap: BigInt(80000000 * 1000000)
        },
        {
          asset: mockAssets.XLM,
          totalSupply: BigInt(40000000 * 10000000), // 40M XLM
          totalBorrowed: BigInt(26000000 * 10000000), // 26M XLM borrowed
          availableLiquidity: BigInt(14000000 * 10000000), // 14M XLM available
          supplyAPY: 0.0420, // 4.20%
          borrowAPY: 0.0520, // 5.20%
          utilizationRate: 0.650, // 65%
          collateralFactor: 0.75,
          liquidationFactor: 0.85,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(50000000 * 10000000),
          borrowCap: BigInt(35000000 * 10000000)
        }
      ],
      backstopRate: 0.1,
      status: 'Paused' as const,
      totalSupply: BigInt(125000000 * 1000000), // $125M total
      totalBorrowed: BigInt(89200000 * 1000000), // $89.2M total borrowed
      totalLiquidity: BigInt(35800000 * 1000000), // $35.8M available
      averageSupplyAPY: 0.0485,
      averageBorrowAPY: 0.0595,
      utilizationRate: 0.711,
      createdAt: now - 86400000 * 90, // 90 days ago
      lastUpdated: now,
      poolType: 'official' as const,
      verified: true,
      category: 'RWA' as const,
      description: 'Institutional-grade US Treasury Bills lending pool with high liquidity and stable returns',
      riskLevel: 'Low' as const
    },

    // Pool 2: Corporate Bonds - Balanced risk/reward
    {
      address: 'CCORP567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789BONDS',
      name: 'Corporate Bonds Pool',
      class: 'Receivables' as const,
      reserves: [
        {
          asset: mockAssets.USDC,
          totalSupply: BigInt(55000000 * 1000000), // $55M USDC
          totalBorrowed: BigInt(31700000 * 1000000), // $31.7M borrowed
          availableLiquidity: BigInt(23300000 * 1000000), // $23.3M available
          supplyAPY: 0.0625, // 6.25%
          borrowAPY: 0.0785, // 7.85%
          utilizationRate: 0.576, // 57.6%
          collateralFactor: 0.75,
          liquidationFactor: 0.85,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(70000000 * 1000000),
          borrowCap: BigInt(45000000 * 1000000)
        },
        {
          asset: mockAssets.USDT,
          totalSupply: BigInt(23300000 * 1000000), // $23.3M USDT
          totalBorrowed: BigInt(13400000 * 1000000), // $13.4M borrowed
          availableLiquidity: BigInt(9900000 * 1000000), // $9.9M available
          supplyAPY: 0.0605, // 6.05%
          borrowAPY: 0.0765, // 7.65%
          utilizationRate: 0.575, // 57.5%
          collateralFactor: 0.75,
          liquidationFactor: 0.85,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(30000000 * 1000000),
          borrowCap: BigInt(20000000 * 1000000)
        }
      ],
      backstopRate: 0.12,
      status: 'Paused' as const,
      totalSupply: BigInt(78300000 * 1000000), // $78.3M total
      totalBorrowed: BigInt(45100000 * 1000000), // $45.1M total borrowed
      totalLiquidity: BigInt(33200000 * 1000000), // $33.2M available
      averageSupplyAPY: 0.0625,
      averageBorrowAPY: 0.0785,
      utilizationRate: 0.576,
      createdAt: now - 86400000 * 60, // 60 days ago
      lastUpdated: now,
      poolType: 'official' as const,
      verified: true,
      category: 'RWA' as const,
      description: 'Diversified investment-grade corporate bonds with attractive yields and managed risk',
      riskLevel: 'Medium' as const
    },

    // Pool 3: Commercial Real Estate - Highest yields
    {
      address: 'CCRE7890123ABCDEFGHIJKLMNOPQRSTUVWXYZ456789REALESTATE',
      name: 'Commercial Real Estate Pool',
      class: 'CRE' as const,
      reserves: [
        {
          asset: mockAssets.USDC,
          totalSupply: BigInt(95000000 * 1000000), // $95M USDC
          totalBorrowed: BigInt(59700000 * 1000000), // $59.7M borrowed
          availableLiquidity: BigInt(35300000 * 1000000), // $35.3M available
          supplyAPY: 0.0745, // 7.45%
          borrowAPY: 0.0915, // 9.15%
          utilizationRate: 0.628, // 62.8%
          collateralFactor: 0.65,
          liquidationFactor: 0.75,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(120000000 * 1000000),
          borrowCap: BigInt(80000000 * 1000000)
        },
        {
          asset: mockAssets.USDT,
          totalSupply: BigInt(41700000 * 1000000), // $41.7M USDT
          totalBorrowed: BigInt(26200000 * 1000000), // $26.2M borrowed
          availableLiquidity: BigInt(15500000 * 1000000), // $15.5M available
          supplyAPY: 0.0720, // 7.20%
          borrowAPY: 0.0890, // 8.90%
          utilizationRate: 0.628, // 62.8%
          collateralFactor: 0.65,
          liquidationFactor: 0.75,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(50000000 * 1000000),
          borrowCap: BigInt(35000000 * 1000000)
        },
        {
          asset: mockAssets.BLND,
          totalSupply: BigInt(20000000 * 10000000), // 20M BLND
          totalBorrowed: BigInt(12500000 * 10000000), // 12.5M BLND borrowed
          availableLiquidity: BigInt(7500000 * 10000000), // 7.5M BLND available
          supplyAPY: 0.0785, // 7.85%
          borrowAPY: 0.0965, // 9.65%
          utilizationRate: 0.625, // 62.5%
          collateralFactor: 0.60,
          liquidationFactor: 0.70,
          lastUpdated: now,
          enabled: true,
          borrowable: true,
          collateralCap: BigInt(25000000 * 10000000),
          borrowCap: BigInt(18000000 * 10000000)
        }
      ],
      backstopRate: 0.15,
      status: 'Paused' as const,
      totalSupply: BigInt(156700000 * 1000000), // $156.7M total
      totalBorrowed: BigInt(98400000 * 1000000), // $98.4M total borrowed
      totalLiquidity: BigInt(58300000 * 1000000), // $58.3M available
      averageSupplyAPY: 0.0745,
      averageBorrowAPY: 0.0915,
      utilizationRate: 0.628,
      createdAt: now - 86400000 * 45, // 45 days ago
      lastUpdated: now,
      poolType: 'official' as const,
      verified: true,
      category: 'RWA' as const,
      description: 'Premium commercial real estate opportunities with high yields across major US metros',
      riskLevel: 'Medium' as const
    }
  ];
};

export const useBlendPools = (): UseBlendPoolsReturn => {
  // Memoize mock pools to prevent recreation on every render
  const pools = useMemo(() => {
    return createMockBlendPools();
  }, []); // Empty deps - only create once

  const loading = false;
  const error = null;
  const lastUpdated = useMemo(() => Date.now(), []); // Memoize timestamp

  // Mock refetch function - no network calls needed
  const refetch = useCallback(async (): Promise<void> => {
    return Promise.resolve();
  }, []);

  return useMemo(() => ({
    pools,
    loading,
    error,
    refetch,
    lastUpdated
  }), [pools, loading, error, refetch, lastUpdated]);
};

// ===== RELATED HOOKS =====

// Hook for a single pool - Placeholder for Solana integration
export const useBlendPool = (poolAddress: string) => {
  return useQuery({
    queryKey: [BLEND_POOLS_QUERY_KEY, poolAddress],
    queryFn: async () => {
      // TODO: Implement Solana pool loading
      return null;
    },
    enabled: false, // Disabled until Solana integration
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

// Hook for pool statistics
export const usePoolStatistics = () => {
  const { pools, loading, error } = useBlendPools();
  
  const statistics = {
    totalPools: pools.length,
    totalTVL: pools.reduce((sum, pool) => sum + Number(pool.totalLiquidity), 0),
    averageAPY: pools.length > 0 
      ? pools.reduce((sum, pool) => sum + pool.averageSupplyAPY, 0) / pools.length 
      : 0,
    totalSupplied: pools.reduce((sum, pool) => sum + Number(pool.totalSupply), 0),
    totalBorrowed: pools.reduce((sum, pool) => sum + Number(pool.totalBorrowed), 0),
    averageUtilization: pools.length > 0
      ? pools.reduce((sum, pool) => sum + pool.utilizationRate, 0) / pools.length
      : 0,
    activePools: pools.filter(pool => pool.status === 'Active').length,
    pausedPools: pools.filter(pool => pool.status === 'Paused').length,
    degradedPools: pools.filter(pool => pool.status === 'Degraded').length,
  };

  return {
    statistics,
    loading,
    error
  };
};