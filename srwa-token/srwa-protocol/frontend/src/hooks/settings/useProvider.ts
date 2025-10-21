/**
 * useProvider - Placeholder for blockchain provider
 * TODO: Implement with Solana RPC connection
 */

export const useProvider = () => {
  return {
    connection: null,
    connected: false,
    network: 'devnet',
    error: null,
  };
};

export default useProvider;
