/**
 * Hooks barrel export
 * Centralized export for all custom hooks
 */

// UI Hooks
export { useMobile } from './ui/use-mobile';
export { useToast } from './ui/use-toast';

// Wallet Hooks
export { useWallet } from './wallet/useWallet';
export { useWalletAssets } from './wallet/useWalletAssets';
export { useWalletTransactions } from './wallet/useWalletTransactions';

// Markets Hooks
export { useAssetPrices } from './markets/useAssetPrices';
export { useBlendPools } from './markets/useBlendPools';
export { useDefIndexData } from './markets/useDefIndexData';
export { useLendingOperations } from './markets/useLendingOperations';
export { useSRWAMarkets } from './markets/useSRWAMarkets';
export { useUserBlendPositions } from './markets/useUserBlendPositions';

// RWA Hooks
export { useRWALending } from './rwa/useRWALending';
export { useUserRWATokens } from './rwa/useUserRWATokens';
export { useSRWAOperations } from './rwa/useSRWAOperations';

// Settings Hooks
export { useSettings } from './settings/useSettings';
export { useProvider } from './settings/useProvider';
