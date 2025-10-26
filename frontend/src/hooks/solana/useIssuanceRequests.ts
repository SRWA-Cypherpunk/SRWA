import { useCallback, useEffect, useState } from 'react';
import { BN } from '@coral-xyz/anchor';
import {
  Keypair,
  PublicKey,
  SendOptions,
  SendTransactionError,
  Signer,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from '@solana/spl-token';
import { useProgramsSafe } from '@/contexts/ProgramContext';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';

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
  const { connection } = useConnection();
  const walletAdapter = useWallet();
  const [requests, setRequests] = useState<SrwaRequestAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintOverrides, setMintOverrides] = useState<Record<string, string>>({});

  interface SendWithWalletOptions extends SendOptions {
    additionalSigners?: Signer[];
    skipWalletSend?: boolean;
  }

  const sendWithWallet = useCallback(
    async (tx: Transaction, opts: SendWithWalletOptions = {}) => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not connected');
      }

      tx.feePayer = wallet.publicKey;
      const {
        additionalSigners = [],
        skipWalletSend = false,
        ...sendOptions
      } = opts;
      const commitment = sendOptions.preflightCommitment ?? 'confirmed';

      try {
        const canUseWalletSend = walletAdapter?.sendTransaction && additionalSigners.length === 0 && !skipWalletSend;

        if (canUseWalletSend) {
          try {
            const signature = await walletAdapter.sendTransaction(tx, connection, sendOptions);
            await connection.confirmTransaction(signature, commitment);
            return signature;
          } catch (walletSendError) {
            if (walletSendError instanceof WalletSendTransactionError) {
              console.warn('[useIssuanceRequests.sendWithWallet] walletAdapter.sendTransaction failed, retrying with manual flow', {
                message: walletSendError.message,
                logs: walletSendError.logs,
              });
              // fall through to manual path below
            } else {
              throw walletSendError;
            }
          }
        }

        const latest = await connection.getLatestBlockhash(commitment);
        tx.recentBlockhash = latest.blockhash;

        if (additionalSigners.length > 0) {
          tx.partialSign(...additionalSigners);
        }

        const signed = await (walletAdapter?.signTransaction
          ? walletAdapter.signTransaction(tx)
          : wallet.signTransaction(tx));

        const signature = await connection.sendRawTransaction(signed.serialize(), sendOptions);
        await connection.confirmTransaction(
          {
            signature,
            blockhash: latest.blockhash,
            lastValidBlockHeight: latest.lastValidBlockHeight,
          },
          commitment
        );
        return signature;
      } catch (err) {
        if (err instanceof SendTransactionError) {
          let logs: string[] | undefined;
          try {
            logs = await err.getLogs(connection);
          } catch (logErr) {
            console.warn('[useIssuanceRequests.sendWithWallet] Failed to fetch logs', logErr);
          }

          const message =
            logs && logs.length
              ? `Transaction failed: ${logs.join(' | ')}`
              : `Transaction failed: ${err.message}`;

          const errorWithLogs = new Error(message);
          (errorWithLogs as any).logs = logs;
          console.error('[useIssuanceRequests.sendWithWallet] SendTransactionError', {
            message: err.message,
            logs,
          });
          throw errorWithLogs;
        }
        throw err;
      }
    },
    [wallet?.publicKey, walletAdapter, wallet, connection]
  );

  const refresh = useCallback(async () => {
    if (!programs?.srwaFactory) {
      console.log('[useIssuanceRequests.refresh] SRWA Factory program not loaded, skipping fetch');
      setRequests([]);
      return;
    }

    try {
      console.log('[useIssuanceRequests.refresh] Fetching SRWA requests from program:', programs.srwaFactory.programId.toBase58());
      const all = await programs.srwaFactory.account.srwaRequest.all();
      console.log('[useIssuanceRequests.refresh] Found requests:', {
        count: all.length,
        requests: all.map((r: any) => ({
          pubkey: r.publicKey.toBase58(),
          issuer: r.account.issuer?.toBase58(),
          name: r.account.name,
          symbol: r.account.symbol,
          status: r.account.status
        }))
      });
      setRequests(all as SrwaRequestAccount[]);
    } catch (err: any) {
      console.error('[useIssuanceRequests.refresh] Failed to fetch SRWA requests', err);
      setError(err.message ?? 'Failed to fetch requests');
    }
  }, [programs?.srwaFactory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getEffectiveMintKey = useCallback((request: SrwaRequestAccount) => {
    const requestKey = request.publicKey.toBase58();
    const override = mintOverrides[requestKey];
    const onChainMint = request.account.mint;
    console.log('[useIssuanceRequests.getEffectiveMintKey]', {
      requestKey: requestKey.slice(0, 16) + '...',
      override,
      onChainMint: onChainMint instanceof PublicKey ? onChainMint.toBase58() : 'ZERO',
      allOverrides: Object.keys(mintOverrides).map(k => k.slice(0, 16) + '...'),
    });
    if (override) {
      return new PublicKey(override);
    }
    return request.account.mint ?? PublicKey.default;
  }, [mintOverrides]);

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
  }, [wallet?.publicKey, programs?.srwaFactory, refresh, walletAdapter]);

  const approveSrwa = useCallback(async (request: SrwaRequestAccount) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }
    if (!programs?.srwaFactory) {
      throw new Error('SRWA Factory program not loaded');
    }

    const mint: PublicKey = getEffectiveMintKey(request);
    if (mint.equals(PublicKey.default)) {
      throw new Error('Mint not created yet. Please create the mint before approving.');
    }
    const mintAccountInfo = await connection.getAccountInfo(mint);
    if (!mintAccountInfo) {
      throw new Error('Mint account not found on-chain. Use "Create Mint" before approving.');
    }

    const [adminRegistryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('admin_registry')],
      programs.srwaFactory.programId
    );
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

    console.log('[useIssuanceRequests.approveSrwa] Derived accounts', {
      admin: wallet.publicKey.toBase58(),
      adminRegistry: adminRegistryPda.toBase58(),
      request: request.publicKey.toBase58(),
      mint: mint.toBase58(),
      srwaConfig: srwaConfigPda.toBase58(),
      offeringState: offeringStatePda.toBase58(),
      valuationData: valuationPda.toBase58(),
      systemProgram: SystemProgram.programId.toBase58(),
      clock: SYSVAR_CLOCK_PUBKEY.toBase58(),
      programId: programs.srwaFactory.programId.toBase58(),
    });

    const approveBuilder = programs.srwaFactory.methods
      .approveSrwa()
      .accounts({
        admin: wallet.publicKey,
        adminRegistry: adminRegistryPda,
        request: request.publicKey,
        mint,
        srwaConfig: srwaConfigPda,
        offeringState: offeringStatePda,
        valuationData: valuationPda,
        clock: SYSVAR_CLOCK_PUBKEY,
        systemProgram: SystemProgram.programId,
      });

    const resolvedAccounts = await approveBuilder.pubkeys();
    console.log(
      '[useIssuanceRequests.approveSrwa] Resolved account map',
      Object.fromEntries(
        Object.entries(resolvedAccounts).map(([key, value]) => [
          key,
          value?.toBase58?.() ?? value,
        ])
      )
    );

    const ix = await approveBuilder.instruction();
    const mintMeta = ix.keys.find((meta) => meta.pubkey.equals(mint));
    if (mintMeta && !mintMeta.isWritable) {
      console.warn('[useIssuanceRequests.approveSrwa] Overriding mint meta to writable (IDL mismatch fix)');
      mintMeta.isWritable = true;
    }
    console.log(
      '[useIssuanceRequests.approveSrwa] Instruction account order',
      ix.keys.map((meta, index) => ({
        index,
        pubkey: meta.pubkey.toBase58(),
        isSigner: meta.isSigner,
        isWritable: meta.isWritable,
      }))
    );

    await sendWithWallet(new Transaction().add(ix), { preflightCommitment: 'confirmed' });

    console.log('[useIssuanceRequests.approveSrwa] SRWA approved successfully. Now minting initial supply to admin wallet.');

    // Mint initial supply to the ADMIN wallet (not issuer)
    try {
      const mintAccountInfo = await connection.getAccountInfo(mint);
      if (!mintAccountInfo) {
        console.warn('[useIssuanceRequests.approveSrwa] Mint account not found on-chain, skipping initial mint');
      } else {
        const mintInfo = await getMint(connection, mint);
        if (!mintInfo.mintAuthority || !mintInfo.mintAuthority.equals(wallet.publicKey)) {
          console.warn('[useIssuanceRequests.approveSrwa] Admin wallet is not mint authority, skipping initial mint', {
            mint: mint.toBase58(),
            expectedAuthority: wallet.publicKey.toBase58(),
            onChainAuthority: mintInfo.mintAuthority?.toBase58() ?? null,
          });
          return;
        }

        const adminAta = await getAssociatedTokenAddress(mint, wallet.publicKey);
        const instructions: TransactionInstruction[] = [];

        const adminAtaInfo = await connection.getAccountInfo(adminAta);
        if (!adminAtaInfo) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              adminAta,
              wallet.publicKey,
              mint
            )
          );
        }

        const decimals = request.account.decimals ?? 0;
        const hardCap = request.account.offering?.target?.hardCap;
        let base = 1n;
        if (hardCap?.toString) {
          try {
            const parsed = BigInt(hardCap.toString());
            if (parsed > 0n) {
              base = parsed;
            }
          } catch (err) {
            console.warn('[useIssuanceRequests.approveSrwa] Failed to parse hardCap, defaulting to 1', err);
          }
        }

        const magnitude = 10n ** BigInt(decimals);
        const mintAmount = base * magnitude;
        const maxU64 = (1n << 64n) - 1n;
        if (mintAmount > maxU64) {
          console.warn('[useIssuanceRequests.approveSrwa] Computed mint amount exceeds u64 range', {
            base: base.toString(),
            decimals,
            mintAmount: mintAmount.toString(),
          });
          throw new Error('Mint amount exceeds supported range');
        }
        instructions.push(
          createMintToInstruction(
            mint,
            adminAta,
            wallet.publicKey,
            mintAmount
          )
        );

        const tx = new Transaction().add(...instructions);
        const signature = await sendWithWallet(tx, { preflightCommitment: 'confirmed' });
        console.log('[useIssuanceRequests.approveSrwa] Minted initial supply to ADMIN ATA', {
          admin: wallet.publicKey.toBase58(),
          adminAta: adminAta.toBase58(),
          amount: mintAmount.toString(),
          signature,
        });
      }
    } catch (mintError) {
      console.error('[useIssuanceRequests.approveSrwa] Failed to mint initial supply to admin wallet', mintError);
      if ((mintError as any)?.logs) {
        console.error('[useIssuanceRequests.approveSrwa] Mint transaction logs', (mintError as any).logs);
      }
    }

    await refresh();
  }, [wallet?.publicKey, programs?.srwaFactory, refresh, walletAdapter, getEffectiveMintKey, connection, sendWithWallet]);

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

  const createMintForRequest = useCallback(async (request: SrwaRequestAccount) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const requestKey = request.publicKey.toBase58();
    console.log('[useIssuanceRequests.createMintForRequest] Starting mint creation for request:', requestKey);
    console.log('[useIssuanceRequests.createMintForRequest] Current mintOverrides:', mintOverrides);

    const decimals = request.account.decimals ?? 0;
    const mintKeypair = Keypair.generate();
    console.log('[useIssuanceRequests.createMintForRequest] Generated new mint:', mintKeypair.publicKey.toBase58());

    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        wallet.publicKey,
        wallet.publicKey
      )
    );

    const signature = await sendWithWallet(tx, {
      preflightCommitment: 'confirmed',
      additionalSigners: [mintKeypair],
      skipWalletSend: true,
    });

    setMintOverrides((prev) => {
      const updated = {
        ...prev,
        [requestKey]: mintKeypair.publicKey.toBase58(),
      };
      console.log('[useIssuanceRequests.createMintForRequest] Updated mintOverrides:', updated);
      return updated;
    });

    console.log('[useIssuanceRequests.createMintForRequest] Mint created', {
      request: requestKey,
      mint: mintKeypair.publicKey.toBase58(),
      signature,
    });

    return mintKeypair.publicKey;
  }, [wallet?.publicKey, connection, wallet, sendWithWallet, mintOverrides]);

  const sendTokensToIssuer = useCallback(async (request: SrwaRequestAccount, amount?: number) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    const mint = getEffectiveMintKey(request);
    if (mint.equals(PublicKey.default)) {
      throw new Error('Mint not created yet');
    }

    const decimals = request.account.decimals ?? 0;
    const issuer = request.account.issuer;

    const adminAta = await getAssociatedTokenAddress(mint, wallet.publicKey);
    let adminAccount;
    try {
      adminAccount = await getAccount(connection, adminAta);
    } catch (err: any) {
      if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
        throw new Error('Admin token account not found. Approve this request to mint the initial supply before sending.');
      }
      throw err;
    }

    const issuerAta = await getAssociatedTokenAddress(mint, issuer, true);

    const instructions: TransactionInstruction[] = [];

    const issuerAtaInfo = await connection.getAccountInfo(issuerAta);
    if (!issuerAtaInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          issuerAta,
          issuer,
          mint
        )
      );
    }

    let transferAmount = 1n;
    if (amount !== undefined) {
      transferAmount = BigInt(Math.floor(amount * 10 ** decimals));
    } else {
      const hardCap = request.account.offering?.target?.hardCap;
      if (hardCap?.toString) {
        try {
          const parsed = BigInt(hardCap.toString());
          if (parsed > 0n) {
            transferAmount = parsed * (10n ** BigInt(decimals));
          }
        } catch (err) {
          console.warn('[useIssuanceRequests.sendTokensToIssuer] Failed to parse hardCap, defaulting to 1', err);
        }
      }
    }

    if (transferAmount <= 0n) {
      throw new Error('Transfer amount must be positive');
    }
    if (transferAmount > adminAccount.amount) {
      throw new Error('Insufficient admin token balance. Mint tokens first before transferring.');
    }
    if (transferAmount > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('Transfer amount too large for safe conversion');
    }

    instructions.push(
      createTransferCheckedInstruction(
        adminAta,
        mint,
        issuerAta,
        wallet.publicKey,
        Number(transferAmount),
        decimals
      )
    );

    const tx = new Transaction().add(...instructions);
    const signature = await sendWithWallet(tx, { preflightCommitment: 'confirmed' });

    console.log('[useIssuanceRequests.sendTokensToIssuer] Transfer completed', {
      request: request.publicKey.toBase58(),
      issuer: issuer.toBase58(),
      signature,
      amount: transferAmount.toString(),
    });
  }, [wallet?.publicKey, connection, walletAdapter, wallet, getEffectiveMintKey, sendWithWallet]);

  /**
   * Transfere tokens do ADMIN para o investidor
   * Usado para processar compras: investidor pagou SOL, recebe tokens do supply do admin
   */
  const transferFromAdminToInvestor = useCallback(async (
    mint: PublicKey,
    investor: PublicKey,
    amount: number,
    decimals: number
  ) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    console.log('[useIssuanceRequests.transferFromAdminToInvestor] Transferring tokens', {
      mint: mint.toBase58(),
      investor: investor.toBase58(),
      amount,
      decimals,
      admin: wallet.publicKey.toBase58(),
    });

    const adminAta = await getAssociatedTokenAddress(mint, wallet.publicKey);
    const investorAta = await getAssociatedTokenAddress(mint, investor);
    const instructions: TransactionInstruction[] = [];

    // Verificar saldo do admin
    let adminAccount;
    try {
      adminAccount = await getAccount(connection, adminAta);
    } catch (err: any) {
      if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
        throw new Error('Admin token account not found. Make sure tokens were minted to admin when approving the SRWA request.');
      }
      throw err;
    }

    // Criar ATA do investidor se não existir
    const investorAtaInfo = await connection.getAccountInfo(investorAta);
    if (!investorAtaInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer (admin)
          investorAta,
          investor,
          mint
        )
      );
      console.log('[useIssuanceRequests.transferFromAdminToInvestor] Creating investor ATA:', investorAta.toBase58());
    }

    // Calcular quantidade de tokens
    const transferAmount = BigInt(Math.floor(amount * 10 ** decimals));
    const maxU64 = (1n << 64n) - 1n;
    if (transferAmount > maxU64) {
      throw new Error('Transfer amount exceeds u64 range');
    }

    // Verificar se admin tem saldo suficiente
    if (adminAccount.amount < transferAmount) {
      throw new Error(
        `Insufficient admin token balance. Required: ${transferAmount.toString()}, Available: ${adminAccount.amount.toString()}`
      );
    }

    // Transferir tokens
    instructions.push(
      createTransferCheckedInstruction(
        adminAta,
        mint,
        investorAta,
        wallet.publicKey, // owner (admin)
        Number(transferAmount),
        decimals
      )
    );

    const tx = new Transaction().add(...instructions);
    const signature = await sendWithWallet(tx, { preflightCommitment: 'confirmed' });

    console.log('[useIssuanceRequests.transferFromAdminToInvestor] Tokens transferred successfully', {
      investor: investor.toBase58(),
      investorAta: investorAta.toBase58(),
      amount: transferAmount.toString(),
      signature,
      explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });

    return signature;
  }, [wallet?.publicKey, connection, sendWithWallet]);

  return {
    requests,
    loading,
    error,
    refresh,
    requestSrwa,
    approveSrwa,
    rejectSrwa,
    createMintForRequest,
    sendTokensToIssuer,
    transferFromAdminToInvestor,
    getEffectiveMintKey,
  };
}
