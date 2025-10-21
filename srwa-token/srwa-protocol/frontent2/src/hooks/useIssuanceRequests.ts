import { useCallback, useEffect, useState } from 'react';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useProgramsSafe } from '../contexts/ProgramContext';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

export type RequestStatus = 'pending' | 'rejected' | 'deployed';

export interface SrwaRequestAccount {
  publicKey: PublicKey;
  account: any;
}

export interface RequestInput {
  requestId: number;
  mint: PublicKey;
  name: string;
  symbol: string;
  decimals: number;
  config: any;
  offering: any;
  yieldConfig: {
    protocol: 'marginfi' | 'solend';
    targetApy: number;
  };
}

export function useIssuanceRequests() {
  const { programs } = useProgramsSafe();
  const wallet = useAnchorWallet();
  const [requests, setRequests] = useState<SrwaRequestAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!programs?.srwaFactory) {
      setRequests([]);
      return;
    }

    try {
      const all = await programs.srwaFactory.account.srwaRequest.all();
      setRequests(all as SrwaRequestAccount[]);
    } catch (err: any) {
      console.error('Failed to fetch SRWA requests', err);
      setError(err.message ?? 'Failed to fetch requests');
    }
  }, [programs?.srwaFactory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestSrwa = useCallback(async (input: RequestInput) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }
    if (!programs?.srwaFactory) {
      throw new Error('SRWA Factory program not loaded');
    }

    const requestIdBn = new BN(input.requestId);
    const [requestPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('srwa_request'),
        wallet.publicKey.toBuffer(),
        requestIdBn.toArrayLike(Buffer, 'le', 8),
      ],
      programs.srwaFactory.programId
    );

    const yieldPayload = {
      protocol: input.yieldConfig.protocol === 'marginfi' ? { marginfi: {} } : { solend: {} },
      targetApyBps: Math.round(input.yieldConfig.targetApy * 100),
    } as any;

    await programs.srwaFactory.methods
      .requestSrwa(
        requestIdBn,
        input.mint,
        input.name,
        input.symbol,
        input.decimals,
        input.config,
        input.offering,
        yieldPayload,
      )
      .accounts({
        issuer: wallet.publicKey,
        request: requestPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await refresh();
    return requestPda;
  }, [wallet?.publicKey, programs?.srwaFactory, refresh]);

  const approveSrwa = useCallback(async (request: SrwaRequestAccount) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }
    if (!programs?.srwaFactory) {
      throw new Error('SRWA Factory program not loaded');
    }

    const mint: PublicKey = request.account.mint;
    const [srwaConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('srwa_config'), mint.toBuffer()],
      programs.srwaFactory.programId
    );
    const [offeringStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('offering'), mint.toBuffer()],
      programs.srwaFactory.programId
    );
    const [valuationPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('valuation'), mint.toBuffer()],
      programs.srwaFactory.programId
    );

    await programs.srwaFactory.methods
      .approveSrwa()
      .accounts({
        admin: wallet.publicKey,
        request: request.publicKey,
        mint,
        srwaConfig: srwaConfigPda,
        offeringState: offeringStatePda,
        valuationData: valuationPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await refresh();
  }, [wallet?.publicKey, programs?.srwaFactory, refresh]);

  const rejectSrwa = useCallback(async (request: SrwaRequestAccount, reason: string) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }
    if (!programs?.srwaFactory) {
      throw new Error('SRWA Factory program not loaded');
    }

    await programs.srwaFactory.methods
      .rejectSrwa(reason)
      .accounts({
        admin: wallet.publicKey,
        request: request.publicKey,
      })
      .rpc();

    await refresh();
  }, [wallet?.publicKey, programs?.srwaFactory, refresh]);

  return {
    requests,
    loading,
    error,
    refresh,
    requestSrwa,
    approveSrwa,
    rejectSrwa,
  };
}
