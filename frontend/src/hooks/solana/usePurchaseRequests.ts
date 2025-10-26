import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';

/**
 * TODO: MIGRAR PARA ON-CHAIN
 *
 * Este hook atualmente usa localStorage para armazenar purchase requests.
 * PRÓXIMOS PASSOS:
 *
 * 1. Criar programa Solana purchase_request.rs com:
 *    - PurchaseRequest account (PDA derivado de [mint, investor, timestamp])
 *    - Estado: Pending, Approved, Rejected
 *    - Instruções: create_purchase_request, approve_purchase, reject_purchase
 *
 * 2. Adicionar ao IDL e gerar tipos TypeScript
 *
 * 3. Substituir localStorage por queries on-chain usando getProgramAccounts
 *    com filtros por mint, investor, status
 *
 * 4. Usar websocket subscriptions para updates em tempo real
 *
 * Por enquanto, os purchase requests são TEMPORÁRIOS e existem apenas no browser.
 * Em produção, isso DEVE ser on-chain para auditoria e persistência.
 */

export interface PurchaseRequest {
  id: string;
  investor: string;
  mint: string;
  tokenSymbol: string;
  tokenName: string;
  quantity: number;
  pricePerToken: number;
  totalSol: number;
  decimals: number;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  txSignature?: string;
  approvedAt?: number;
  approvedBy?: string;
}

// TEMPORÁRIO: Será removido quando migrado para on-chain
const STORAGE_KEY = 'srwa_purchase_requests';

export function usePurchaseRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

  // TEMPORÁRIO: Load from localStorage on mount
  // TODO: Substituir por fetch de PDAs on-chain
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRequests(parsed);
      }
    } catch (err) {
      console.error('[usePurchaseRequests] Failed to load from localStorage:', err);
    }
  }, []);

  // TEMPORÁRIO: Save to localStorage whenever requests change
  // TODO: Remover quando migrado para on-chain
  const saveToStorage = useCallback((reqs: PurchaseRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
    } catch (err) {
      console.error('[usePurchaseRequests] Failed to save to localStorage:', err);
    }
  }, []);

  // Create new purchase request
  // TODO: Substituir por instrução create_purchase_request on-chain
  const createRequest = useCallback((request: Omit<PurchaseRequest, 'id' | 'timestamp' | 'status'>) => {
    const newRequest: PurchaseRequest = {
      ...request,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
    };

    setRequests((prev) => {
      const updated = [...prev, newRequest];
      saveToStorage(updated);
      return updated;
    });

    console.log('[usePurchaseRequests.createRequest] Created purchase request (TEMPORARY - localStorage):', newRequest);
    return newRequest;
  }, [saveToStorage]);

  // Approve purchase request
  // TODO: Substituir por instrução approve_purchase on-chain
  const approveRequest = useCallback((requestId: string, txSignature: string, approverAddress: string) => {
    setRequests((prev) => {
      const updated = prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'approved' as const,
              txSignature,
              approvedAt: Date.now(),
              approvedBy: approverAddress,
            }
          : req
      );
      saveToStorage(updated);
      return updated;
    });

    console.log('[usePurchaseRequests.approveRequest] Approved purchase request (TEMPORARY - localStorage):', requestId);
  }, [saveToStorage]);

  // Reject purchase request
  // TODO: Substituir por instrução reject_purchase on-chain
  const rejectRequest = useCallback((requestId: string) => {
    setRequests((prev) => {
      const updated = prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'rejected' as const,
            }
          : req
      );
      saveToStorage(updated);
      return updated;
    });

    console.log('[usePurchaseRequests.rejectRequest] Rejected purchase request (TEMPORARY - localStorage):', requestId);
  }, [saveToStorage]);

  // Get requests by status
  const getPendingRequests = useCallback(() => {
    return requests.filter((req) => req.status === 'pending');
  }, [requests]);

  const getApprovedRequests = useCallback(() => {
    return requests.filter((req) => req.status === 'approved');
  }, [requests]);

  // Clear all requests (for testing)
  const clearAll = useCallback(() => {
    setRequests([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('[usePurchaseRequests.clearAll] Cleared all requests (TEMPORARY - localStorage)');
  }, []);

  return {
    requests,
    createRequest,
    approveRequest,
    rejectRequest,
    getPendingRequests,
    getApprovedRequests,
    clearAll,
  };
}
