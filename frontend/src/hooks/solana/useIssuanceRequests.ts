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
  TOKEN_2022_PROGRAM_ID,
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
        // Always get blockhash first
        const latest = await connection.getLatestBlockhash(commitment);
        tx.recentBlockhash = latest.blockhash;
        tx.lastValidBlockHeight = latest.lastValidBlockHeight;

        const canUseWalletSend = walletAdapter?.sendTransaction && additionalSigners.length === 0 && !skipWalletSend;

        if (canUseWalletSend) {
          try {
            const signature = await walletAdapter.sendTransaction(tx, connection, sendOptions);
            await connection.confirmTransaction(
              {
                signature,
                blockhash: latest.blockhash,
                lastValidBlockHeight: latest.lastValidBlockHeight,
              },
              commitment
            );
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

        // Manual signing flow for transactions with additional signers
        console.log('[useIssuanceRequests.sendWithWallet] Using manual signing flow', {
          additionalSigners: additionalSigners.length,
          signerKeys: additionalSigners.map(s => s.publicKey.toBase58()),
        });

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
    const mintField = request.account.mint;
    if (mintField instanceof PublicKey) {
      return mintField;
    }
    if (mintField && typeof mintField === 'object' && 'toBase58' in mintField) {
      try {
        return new PublicKey((mintField as any).toBase58());
      } catch (err) {
        console.warn('[useIssuanceRequests.getEffectiveMintKey] Failed to parse mint field', err);
      }
    }
    if (typeof mintField === 'string' && mintField.length > 0) {
      try {
        return new PublicKey(mintField);
      } catch (err) {
        console.warn('[useIssuanceRequests.getEffectiveMintKey] Invalid mint string', err);
      }
    }
    return PublicKey.default;
  }, []);

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

    // Build instruction
    const ix = await programs.srwaFactory.methods
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
      .instruction();

    // Create and sign transaction manually
    const tx = new Transaction().add(ix);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = wallet.publicKey;

    const signedTx = await wallet.signTransaction(tx);

    try {
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      console.log('[useIssuanceRequests.requestSrwa] Request created successfully:', signature);

      await refresh();
      return requestPda;
    } catch (err: any) {
      // Check if the request was actually created despite the error
      console.log('[useIssuanceRequests.requestSrwa] Error during transaction, checking if request exists:', err.message);

      // Wait a bit for the transaction to potentially settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const requestAccount = await programs.srwaFactory.account.srwaRequest.fetch(requestPda);
        if (requestAccount) {
          console.log('[useIssuanceRequests.requestSrwa] Request was created successfully despite error');
          await refresh();
          return requestPda;
        }
      } catch (fetchErr) {
        // Request doesn't exist, throw original error
        console.error('[useIssuanceRequests.requestSrwa] Request not found, original error:', err);
      }

      throw err;
    }
  }, [wallet?.publicKey, programs?.srwaFactory, refresh, walletAdapter]);

  const approveSrwa = useCallback(async (request: SrwaRequestAccount) => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }
    if (!programs?.srwaFactory) {
      throw new Error('SRWA Factory program not loaded');
    }

    const existingMint = request.account.mint as PublicKey | undefined;
    let mintKeypair: Keypair | null = null;
    let mint = existingMint ?? PublicKey.default;
    if (!existingMint || existingMint.equals(PublicKey.default)) {
      mintKeypair = Keypair.generate();
      mint = mintKeypair.publicKey;
      console.log('[useIssuanceRequests.approveSrwa] Generated mint keypair during approval', mint.toBase58());
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

    // Token-2022 program ID
    const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

    // Create the instruction
    const ix = await programs.srwaFactory.methods
      .approveSrwa()
      .accounts({
        admin: wallet.publicKey,
        adminRegistry: adminRegistryPda,
        request: request.publicKey,
        mint,
        srwaConfig: srwaConfigPda,
        offeringState: offeringStatePda,
        valuationData: valuationPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .instruction();

    // Build transaction manually
    const tx = new Transaction();
    tx.add(ix);

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = wallet.publicKey;

    // CRITICAL: Sign in the correct order
    // 1. First, sign with additional keypairs (mintKeypair)
    if (mintKeypair) {
      console.log('[useIssuanceRequests.approveSrwa] Signing with mint keypair:', mint.toBase58());
      tx.sign(mintKeypair);
    }

    // 2. Then sign with wallet (this adds the wallet's signature)
    console.log('[useIssuanceRequests.approveSrwa] Signing with wallet:', wallet.publicKey.toBase58());
    const signedTx = await wallet.signTransaction(tx);

    // Send the fully signed transaction
    console.log('[useIssuanceRequests.approveSrwa] Sending transaction...');
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('[useIssuanceRequests.approveSrwa] Transaction sent:', signature);

    // Confirm transaction
    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    console.log('[useIssuanceRequests.approveSrwa] Approval transaction confirmed:', signature);

    console.log('[useIssuanceRequests.approveSrwa] SRWA approved successfully. Now minting initial supply to admin wallet.');

    // Mint initial supply to the ADMIN wallet (not issuer)
    try {
      const mintAccountInfo = await connection.getAccountInfo(mint);
      if (!mintAccountInfo) {
        console.warn('[useIssuanceRequests.approveSrwa] Mint account not found on-chain, skipping initial mint');
      } else {
        // Use TOKEN_2022_PROGRAM_ID since this is a Token-2022 mint
        const mintInfo = await getMint(connection, mint, 'confirmed', TOKEN_2022_PROGRAM_ID);
        if (!mintInfo.mintAuthority || !mintInfo.mintAuthority.equals(wallet.publicKey)) {
          console.warn('[useIssuanceRequests.approveSrwa] Admin wallet is not mint authority, skipping initial mint', {
            mint: mint.toBase58(),
            expectedAuthority: wallet.publicKey.toBase58(),
            onChainAuthority: mintInfo.mintAuthority?.toBase58() ?? null,
          });
          return;
        }

        const adminAta = await getAssociatedTokenAddress(
          mint,
          wallet.publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        const instructions: TransactionInstruction[] = [];

        const adminAtaInfo = await connection.getAccountInfo(adminAta);
        if (!adminAtaInfo) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              adminAta,
              wallet.publicKey,
              mint,
              TOKEN_PROGRAM_ID,
              TOKEN_2022_PROGRAM_ID
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

        // Create mint instruction manually for Token-2022
        // Convert bigint to number for the instruction
        const amountAsNumber = Number(mintAmount);

        console.log('[useIssuanceRequests.approveSrwa] Preparing mint instruction', {
          mint: mint.toBase58(),
          destination: adminAta.toBase58(),
          authority: wallet.publicKey.toBase58(),
          amountBigInt: mintAmount.toString(),
          amountNumber: amountAsNumber,
          programId: TOKEN_2022_PROGRAM_ID.toBase58(),
        });

        const mintToIx = createMintToInstruction(
          mint,
          adminAta,
          wallet.publicKey,
          amountAsNumber,
          [],
          TOKEN_2022_PROGRAM_ID
        );

        console.log('[useIssuanceRequests.approveSrwa] Mint instruction created successfully');

        instructions.push(mintToIx);

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

    // Build instruction
    const ix = await programs.srwaFactory.methods
      .rejectSrwa(reason)
      .accounts({
        admin: wallet.publicKey,
        request: request.publicKey,
      })
      .instruction();

    // Create and sign transaction manually
    const tx = new Transaction().add(ix);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = wallet.publicKey;

    const signedTx = await wallet.signTransaction(tx);

    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'confirmed'
    );

    console.log('[useIssuanceRequests.rejectSrwa] Request rejected successfully:', signature);

    await refresh();
  }, [wallet?.publicKey, programs?.srwaFactory, refresh, connection]);

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
    sendTokensToIssuer,
    transferFromAdminToInvestor,
    getEffectiveMintKey,
  };
}
