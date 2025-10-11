/**
 * useAssetPrices - Placeholder for asset price feeds
 * TODO: Implement with Pyth Network oracle
 */

export const useAssetPrices = (assets: string[] = []) => {
  return {
    prices: {},
    loading: false,
    error: null,
    refresh: async () => {},
  };
};

export default useAssetPrices;
