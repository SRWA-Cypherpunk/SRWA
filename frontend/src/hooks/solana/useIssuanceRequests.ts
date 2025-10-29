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
  ASSOCIATED_ s,
  Account,
  MINT_SIZE,
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
import {
  Raydium,
  TxVersion,
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId
} from '@raydium-io/raydium-sdk-v2';
import BN from 'bn.js';

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

  const createRaydiumPool = useCallback(
    async (tokenMint: PublicKey, tokenSymbol: string, initialLiquidity: bigint) => {
      if (!wallet?.publicKey || !walletAdapter?.signAllTransactions) {
        throw new Error('Wallet not connected or does not support signing');
      }

      const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

      console.log('[useIssuanceRequests.createRaydiumPool] Creating pool for token:', {
        tokenMint: tokenMint.toBase58(),
        tokenSymbol,
        initialLiquidity: initialLiquidity.toString(),
      });

      try {
        // Initialize Raydium SDK
        console.log('[useIssuanceRequests.createRaydiumPool] Loading Raydium SDK...', {
          cluster: 'devnet',
          rpcEndpoint: connection.rpcEndpoint,
        });
        const raydium = await Raydium.load({
          owner: wallet.publicKey,
          connection,
          cluster: 'devnet',
          disableFeatureCheck: true,
          disableLoadToken: false,
          blockhashCommitment: 'finalized',
          signAllTransactions: async (txs) => {
            return await walletAdapter.signAllTransactions!(txs);
          },
        });

        console.log('[useIssuanceRequests.createRaydiumPool] Raydium SDK loaded, cluster:', raydium.cluster);

        // Get token decimals
        const [accountAInfo, accountBInfo] = await Promise.all([
          connection.getAccountInfo(tokenMint),
          connection.getAccountInfo(WSOL_MINT),
        ]);

        if (!accountAInfo || !accountBInfo) {
          throw new Error('Token not found');
        }

        const programA = accountAInfo.owner;
        const programB = accountBInfo.owner;

        const [mintAData, mintBData] = await Promise.all([
          getMint(connection, tokenMint, 'confirmed', programA),
          getMint(connection, WSOL_MINT, 'confirmed', programB),
        ]);

        const mintADecimals = mintAData.decimals;
        const mintBDecimals = mintBData.decimals;

        console.log('[useIssuanceRequests.createRaydiumPool] Token decimals:', {
          mintA: mintADecimals,
          mintB: mintBDecimals,
        });

        // Get fee configs
        const feeConfigs = await raydium.api.getCpmmConfigs();

        // Adjust config IDs for devnet
        if (raydium.cluster === 'devnet') {
          feeConfigs.forEach((config) => {
            config.id = getCpmmPdaAmmConfigId(
              DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
              config.index
            ).publicKey.toBase58();
          });
        }

        if (feeConfigs.length === 0) {
          throw new Error('No fee configs found');
        }

        const feeConfig = feeConfigs[0];

        // Calculate amounts
        // Use initial liquidity (e.g., 1000 tokens) and price of 0.001 SOL per token
        const tokenAAmountRaw = Number(initialLiquidity);
        const tokenBAmountRaw = Math.floor(0.001 * tokenAAmountRaw); // 0.001 SOL per token

        console.log('[useIssuanceRequests.createRaydiumPool] Pool amounts:', {
          tokenAAmountRaw,
          tokenBAmountRaw,
          price: tokenBAmountRaw / tokenAAmountRaw,
        });

        const mintA = {
          address: tokenMint.toBase58(),
          programId: programA.toBase58(),
          decimals: mintADecimals,
        };

        const mintB = {
          address: WSOL_MINT.toBase58(),
          programId: programB.toBase58(),
          decimals: mintBDecimals,
        };

        const poolParams = {
          programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
          poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,
          mintA,
          mintB,
          mintAAmount: new BN(tokenAAmountRaw),
          mintBAmount: new BN(tokenBAmountRaw),
          startTime: new BN(Math.floor(Date.now() / 1000)),
          associatedOnly: false,
          feeConfig: {
            id: new PublicKey(feeConfig.id),
            index: feeConfig.index,
            protocolFeeRate: feeConfig.protocolFeeRate,
            tradeFeeRate: feeConfig.tradeFeeRate,
            fundFeeRate: feeConfig.fundFeeRate,
            createPoolFee: new BN(feeConfig.createPoolFee),
          },
          ownerInfo: {
            feePayer: wallet.publicKey,
            useSOLBalance: true,
          },
          txVersion: TxVersion.V0,
        };

        console.log('[useIssuanceRequests.createRaydiumPool] Creating pool with params...');
        const { execute, extInfo } = await raydium.cpmm.createPool(poolParams);

        // Log ALL available addresses from extInfo
        console.log('[useIssuanceRequests.createRaydiumPool] Pool creation prepared');
        console.log('[useIssuanceRequests.createRaydiumPool] Full extInfo.address:', extInfo.address);

        // Try to extract all possible PublicKeys
        const addressKeys = Object.keys(extInfo.address);
        console.log('[useIssuanceRequests.createRaydiumPool] Available address keys:', addressKeys);

        addressKeys.forEach(key => {
          const value = (extInfo.address as any)[key];
          if (value && typeof value === 'object' && value.toBase58) {
            console.log(`[useIssuanceRequests.createRaydiumPool] ${key}:`, value.toBase58());
          } else {
            console.log(`[useIssuanceRequests.createRaydiumPool] ${key}:`, value);
          }
        });

        console.log('[useIssuanceRequests.createRaydiumPool] Executing transaction...');
        const { txId } = await execute({ sendAndConfirm: true });

        console.log('[useIssuanceRequests.createRaydiumPool] Pool created! TxId:', txId);

        // Wait for transaction to be confirmed and indexed
        console.log('[useIssuanceRequests.createRaydiumPool] Waiting for transaction to be indexed...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Fetch the transaction to get the actual pool account
        console.log('[useIssuanceRequests.createRaydiumPool] Fetching transaction to find pool address...');
        const txInfo = await connection.getTransaction(txId, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed',
        });

        console.log('[useIssuanceRequests.createRaydiumPool] Transaction info received');

        // Extract all writable accounts from the transaction
        let poolId: string | null = null;

        if (txInfo?.transaction) {
          const message = txInfo.transaction.message;
          const accountKeys = message.staticAccountKeys || [];

          console.log('[useIssuanceRequests.createRaydiumPool] Transaction has', accountKeys.length, 'accounts');

          // The pool account is typically one of the first writable accounts
          // created by the program. Let's test them.
          for (const accountKey of accountKeys) {
            const address = accountKey.toBase58();

            // Skip known accounts (program IDs, system program, token program, etc.)
            if (
              address === 'DRaycpLY18LhpbydsBWbVJtxpNv9oXPgjRSfpF2bWpYb' || // CPMM program
              address === 'So11111111111111111111111111111111111111112' || // WSOL
              address === wallet.publicKey?.toBase58() ||
              address === '11111111111111111111111111111111' || // System program
              address === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' || // Token program
              address === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' || // Token-2022 program
              address === tokenMint.toBase58() || // Token A mint
              address === extInfo.address.configId?.toBase58() ||
              address === extInfo.address.authority?.toBase58() ||
              address === extInfo.address.lpMint?.toBase58() ||
              address === extInfo.address.vaultA?.toBase58() ||
              address === extInfo.address.vaultB?.toBase58() ||
              address === extInfo.address.observationId?.toBase58() ||
              address === extInfo.address.poolFeeAccount?.toBase58()
            ) {
              continue;
            }

            try {
              console.log(`[useIssuanceRequests.createRaydiumPool] Testing account: ${address}`);
              const testPoolData = await raydium.cpmm.getPoolInfoFromRpc(address);
              console.log(`[useIssuanceRequests.createRaydiumPool] ✅ FOUND VALID POOL! Address: ${address}`);
              poolId = address;
              console.log('[useIssuanceRequests.createRaydiumPool] Pool info:', {
                poolId: address,
                mintA: testPoolData.poolInfo.mintA.address,
                mintB: testPoolData.poolInfo.mintB.address,
              });
              break;
            } catch (testError: any) {
              console.log(`[useIssuanceRequests.createRaydiumPool] ❌ ${address} is not the pool`);
            }
          }
        }

        if (!poolId) {
          console.error('[useIssuanceRequests.createRaydiumPool] ⚠️ Could not find pool address in transaction accounts!');
          console.error('[useIssuanceRequests.createRaydiumPool] Using poolId from extInfo as fallback');
          poolId = extInfo.address.poolId?.toBase58();
        }

        return {
          poolId,
          signature: txId,
        };
      } catch (error: any) {
        console.error('[useIssuanceRequests.createRaydiumPool] Failed to create Raydium pool:', error);
        throw error;
      }
    },
    [wallet?.publicKey, walletAdapter, connection]
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

    // Create transaction
    const tx = new Transaction().add(ix);

    try {
      const signature = await sendWithWallet(tx, { preflightCommitment: 'confirmed' });
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
  }, [wallet?.publicKey, programs?.srwaFactory, refresh, sendWithWallet]);

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

    let signature: string;
    try {
      signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      console.log('[useIssuanceRequests.approveSrwa] Transaction sent:', signature);
    } catch (sendError: any) {
      // If error is "already processed", the transaction went through but RPC returned error
      if (sendError?.message?.includes('already been processed')) {
        console.warn('[useIssuanceRequests.approveSrwa] Transaction already processed, checking recent transactions...');
        // Wait a bit for transaction to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get recent signatures for this wallet
        const signatures = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 5 });
        if (signatures && signatures.length > 0) {
          signature = signatures[0].signature;
          console.log('[useIssuanceRequests.approveSrwa] Found recent signature:', signature);
        } else {
          throw new Error('Transaction was processed but signature not found');
        }
      } else {
        throw sendError;
      }
    }

    // Confirm transaction
    try {
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );
      console.log('[useIssuanceRequests.approveSrwa] Approval transaction confirmed:', signature);
    } catch (confirmError: any) {
      // If confirmation fails, check if transaction actually succeeded
      console.warn('[useIssuanceRequests.approveSrwa] Confirmation error, checking transaction status...');
      const status = await connection.getSignatureStatus(signature);
      if (status?.value?.confirmationStatus === 'confirmed' || status?.value?.confirmationStatus === 'finalized') {
        console.log('[useIssuanceRequests.approveSrwa] Transaction was actually confirmed:', signature);
      } else {
        throw confirmError;
      }
    }

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
              TOKEN_2022_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
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

        // Show instructions for creating liquidity pool
        console.log('[useIssuanceRequests.approveSrwa] ========================================');
        console.log('[useIssuanceRequests.approveSrwa] ✅ SRWA TOKEN APPROVED SUCCESSFULLY!');
        console.log('[useIssuanceRequests.approveSrwa] ========================================');
        console.log('[useIssuanceRequests.approveSrwa] Token Mint:', mint.toBase58());
        console.log('[useIssuanceRequests.approveSrwa] Symbol:', request.account.symbol);
        console.log('[useIssuanceRequests.approveSrwa] Supply:', mintAmount.toString());
        console.log('[useIssuanceRequests.approveSrwa] ');
        console.log('[useIssuanceRequests.approveSrwa] 📌 NEXT STEPS - Create Liquidity Pool:');
        console.log('[useIssuanceRequests.approveSrwa] ');
        console.log('[useIssuanceRequests.approveSrwa] ⚠️  IMPORTANT: Raydium CPMM does NOT support Token-2022 on devnet.');
        console.log('[useIssuanceRequests.approveSrwa] ');
        console.log('[useIssuanceRequests.approveSrwa] Option 1 - Orca Whirlpools (Supports Token-2022):');
        console.log('[useIssuanceRequests.approveSrwa]   1. Visit: https://www.orca.so/');
        console.log('[useIssuanceRequests.approveSrwa]   2. Connect your wallet (devnet mode)');
        console.log('[useIssuanceRequests.approveSrwa]   3. Create a Whirlpool with:');
        console.log('[useIssuanceRequests.approveSrwa]      - Token A:', mint.toBase58());
        console.log('[useIssuanceRequests.approveSrwa]      - Token B: So11111111111111111111111111111111111111112 (wSOL)');
        console.log('[useIssuanceRequests.approveSrwa]      - Initial Price: ~0.001 SOL');
        console.log('[useIssuanceRequests.approveSrwa]   4. Add initial liquidity');
        console.log('[useIssuanceRequests.approveSrwa]   5. Copy the Pool Address');
        console.log('[useIssuanceRequests.approveSrwa]   6. Register the pool in Admin Panel > Pool Management');
        console.log('[useIssuanceRequests.approveSrwa] ');
        console.log('[useIssuanceRequests.approveSrwa] Option 2 - Use the RaydiumPoolCreator component:');
        console.log('[useIssuanceRequests.approveSrwa]   - Available in Admin Panel');
        console.log('[useIssuanceRequests.approveSrwa]   - Note: May fail if token uses Token-2022 extensions');
        console.log('[useIssuanceRequests.approveSrwa] ');
        console.log('[useIssuanceRequests.approveSrwa] ========================================');
      }
    } catch (mintError) {
      console.error('[useIssuanceRequests.approveSrwa] Failed to mint initial supply to admin wallet', mintError);
      if ((mintError as any)?.logs) {
        console.error('[useIssuanceRequests.approveSrwa] Mint transaction logs', (mintError as any).logs);
      }
    }

    await refresh();
  }, [wallet?.publicKey, programs?.srwaFactory, refresh, walletAdapter, getEffectiveMintKey, connection, sendWithWallet, createRaydiumPool]);

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

    const adminAta = await getAssociatedTokenAddress(mint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
    let adminAccount: Account;
    try {
      adminAccount = await getAccount(connection, adminAta, 'confirmed', TOKEN_2022_PROGRAM_ID);
    } catch (err: any) {
      if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
        throw new Error('Admin token account not found. Approve this request to mint the initial supply before sending.');
      }
      throw err;
    }

    const issuerAta = await getAssociatedTokenAddress(mint, issuer, true, TOKEN_2022_PROGRAM_ID);

    const instructions: TransactionInstruction[] = [];

    const issuerAtaInfo = await connection.getAccountInfo(issuerAta);
    if (!issuerAtaInfo) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          issuerAta,
          issuer,
          mint,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
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
        decimals,
        [],
        TOKEN_2022_PROGRAM_ID
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

    const adminAta = await getAssociatedTokenAddress(mint, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
    const investorAta = await getAssociatedTokenAddress(mint, investor, false, TOKEN_2022_PROGRAM_ID);
    const instructions: TransactionInstruction[] = [];

    // Verificar saldo do admin
    let adminAccount: Account;
    try {
      adminAccount = await getAccount(connection, adminAta, 'confirmed', TOKEN_2022_PROGRAM_ID);
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
          mint,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
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
        decimals,
        [],
        TOKEN_2022_PROGRAM_ID
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
