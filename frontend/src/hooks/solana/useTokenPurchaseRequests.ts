import { useCallback, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { toast } from 'sonner';

/**
 * Purchase Request Structure (stored locally for now, could be on-chain later)
 */
export interface TokenPurchaseRequest {
  id: string;
  investor: string; // Wallet address
  tokenMint: string; // Token being purchased
  tokenName: string;
  tokenSymbol: string;
  solAmount: number; // Amount of SOL sent
  tokenAmount: number; // Amount of tokens requested
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  approvedAt?: number;
  txSignature?: string;
  escrowAccount?: string; // Where SOL is held
}

// Local storage key
const STORAGE_KEY = 'srwa_purchase_requests';

/**
 * Hook for managing token purchase requests
 *
 * FLUXO:
 * 1. Investor cria purchase request (SOL é enviado para escrow)
 * 2. Admin vê requests pendentes
 * 3. Admin aprova:
 *    - SOL do escrow vai para pool USD/SOL (Raydium/Orca)
 *    - Admin transfere tokens RWA para investor (via useTokenDistribution)
 * 4. Request marcada como 'approved'
 */
export function useTokenPurchaseRequests() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [requests, setRequests] = useState<TokenPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Load requests from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRequests(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading purchase requests:', error);
      }
    }
  }, []);

  // Save requests to localStorage
  const saveRequests = useCallback((newRequests: TokenPurchaseRequest[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRequests));
    setRequests(newRequests);
  }, []);

  /**
   * Investor cria purchase request
   * SOL é enviado para um PDA escrow (simplificado: envia para admin wallet)
   */
  const createPurchaseRequest = useCallback(
    async (
      tokenMint: string,
      tokenName: string,
      tokenSymbol: string,
      solAmount: number,
      tokenAmount: number,
      adminWallet: string
    ): Promise<{ success: boolean; requestId?: string; error?: string }> => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        return { success: false, error: 'Wallet não conectada' };
      }

      try {
        setLoading(true);

        // Validar inputs
        if (solAmount <= 0 || tokenAmount <= 0) {
          throw new Error('Valores inválidos');
        }

        const adminPubkey = new PublicKey(adminWallet);

        // Criar transação: enviar SOL para admin (escrow simplificado)
        const lamports = Math.floor(solAmount * 1e9); // SOL to lamports

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: adminPubkey,
            lamports,
          })
        );

        transaction.feePayer = wallet.publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        toast.info('✍️ Assine a transação para enviar SOL...');
        const signedTx = await wallet.signTransaction(transaction);

        toast.info('📤 Enviando SOL...');
        const signature = await connection.sendRawTransaction(signedTx.serialize());

        await connection.confirmTransaction(signature, 'confirmed');

        // Criar purchase request
        const requestId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const newRequest: TokenPurchaseRequest = {
          id: requestId,
          investor: wallet.publicKey.toBase58(),
          tokenMint,
          tokenName,
          tokenSymbol,
          solAmount,
          tokenAmount,
          status: 'pending',
          createdAt: Date.now(),
          txSignature: signature,
          escrowAccount: adminWallet, // Simplified: admin wallet holds SOL
        };

        // Salvar request
        const updatedRequests = [...requests, newRequest];
        saveRequests(updatedRequests);

        toast.success('✅ Purchase request criada!', {
          description: `Aguarde aprovação do admin para receber ${tokenAmount} ${tokenSymbol}`,
        });

        return { success: true, requestId };
      } catch (error: any) {
        console.error('Create purchase request error:', error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [wallet, connection, requests, saveRequests]
  );

  /**
   * Admin busca todas purchase requests pendentes
   */
  const getPendingRequests = useCallback((): TokenPurchaseRequest[] => {
    return requests.filter((r) => r.status === 'pending');
  }, [requests]);

  /**
   * Admin busca requests de um investor específico
   */
  const getRequestsByInvestor = useCallback(
    (investorAddress: string): TokenPurchaseRequest[] => {
      return requests.filter((r) => r.investor === investorAddress);
    },
    [requests]
  );

  /**
   * Admin aprova purchase request
   * Nota: A transferência de tokens e swap de SOL são feitos separadamente
   */
  const approvePurchaseRequest = useCallback(
    async (requestId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const request = requests.find((r) => r.id === requestId);
        if (!request) {
          throw new Error('Request não encontrada');
        }

        if (request.status !== 'pending') {
          throw new Error('Request já foi processada');
        }

        // Marcar como aprovada
        const updatedRequests = requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'approved' as const,
                approvedAt: Date.now(),
              }
            : r
        );

        saveRequests(updatedRequests);

        toast.success('✅ Purchase request aprovada!', {
          description: `Agora transfira ${request.tokenAmount} ${request.tokenSymbol} para o investidor`,
        });

        return { success: true };
      } catch (error: any) {
        console.error('Approve purchase request error:', error);
        return { success: false, error: error.message };
      }
    },
    [requests, saveRequests]
  );

  /**
   * Admin rejeita purchase request
   */
  const rejectPurchaseRequest = useCallback(
    async (requestId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const request = requests.find((r) => r.id === requestId);
        if (!request) {
          throw new Error('Request não encontrada');
        }

        if (request.status !== 'pending') {
          throw new Error('Request já foi processada');
        }

        // Marcar como rejeitada
        const updatedRequests = requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'rejected' as const,
                approvedAt: Date.now(),
              }
            : r
        );

        saveRequests(updatedRequests);

        toast.info('Request rejeitada', {
          description: 'O investidor deverá ser reembolsado manualmente',
        });

        return { success: true };
      } catch (error: any) {
        console.error('Reject purchase request error:', error);
        return { success: false, error: error.message };
      }
    },
    [requests, saveRequests]
  );

  /**
   * Limpar requests antigas (opcional)
   */
  const clearOldRequests = useCallback(
    (daysOld: number = 30) => {
      const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
      const filtered = requests.filter((r) => r.createdAt > cutoffTime);
      saveRequests(filtered);
    },
    [requests, saveRequests]
  );

  return {
    requests,
    loading,
    createPurchaseRequest,
    getPendingRequests,
    getRequestsByInvestor,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    clearOldRequests,
  };
}
