import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';

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

const STORAGE_KEY = 'srwa_purchase_requests';

export function usePurchaseRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

  // Load from localStorage on mount
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

  // Save to localStorage whenever requests change
  const saveToStorage = useCallback((reqs: PurchaseRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
    } catch (err) {
      console.error('[usePurchaseRequests] Failed to save to localStorage:', err);
    }
  }, []);

  // Create new purchase request
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

    console.log('[usePurchaseRequests.createRequest] Created purchase request:', newRequest);
    return newRequest;
  }, [saveToStorage]);

  // Approve purchase request
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

    console.log('[usePurchaseRequests.approveRequest] Approved purchase request:', requestId);
  }, [saveToStorage]);

  // Reject purchase request
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

    console.log('[usePurchaseRequests.rejectRequest] Rejected purchase request:', requestId);
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
    console.log('[usePurchaseRequests.clearAll] Cleared all requests');
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
