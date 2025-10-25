/**
 * WalletStatus - Placeholder component for wallet connection status
 * TODO: Update when Solana wallet is integrated
 */

import { useWallet } from './WalletProvider';

export const WalletStatus = () => {
  const { connected, address } = useWallet();

  if (!connected) {
    return <div className="text-fg-muted text-sm">Not connected</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-solana-500 animate-pulse" />
      <span className="text-fg-secondary text-sm font-mono">
        {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connected'}
      </span>
    </div>
  );
};

export default WalletStatus;
