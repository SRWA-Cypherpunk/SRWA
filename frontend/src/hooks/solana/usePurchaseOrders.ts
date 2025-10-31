import { useEffect, useState, useCallback, useRef } from 'react';
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN, AnchorProvider } from '@coral-xyz/anchor';
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  addExtraAccountMetasForExecute,
  resolveExtraAccountMeta,
} from '@solana/spl-token';
import { useProgramsSafe } from '@/contexts';
import { PROGRAM_IDS } from '@/lib/solana/anchor';
import { toast } from 'sonner';
import { getConfig, MarginfiClient } from '@mrgnlabs/marginfi-client-v2';

const PURCHASE_ORDER_SEED = 'purchase_order';
const PROGRAM_ID = new PublicKey('EdyLMn3iUrF16Z4VPyTfv9hC9G7eqxsHQVxnsNcsAT3Z');
const WSOL_MINT_DEVNET = new PublicKey('So11111111111111111111111111111111111111112');

export interface PurchaseOrderAccount {
  publicKey: PublicKey;
  account: {
    bump: number;
    investor: PublicKey;
    mint: PublicKey;
    quantity: BN;
    pricePerTokenLamports: BN;
    totalLamports: BN;
    status: { pending: {} } | { approved: {} } | { rejected: {} } | { cancelled: {} };
    createdAt: BN;
    updatedAt: BN;
    processedBy: PublicKey | null;
    approvalTx: number[] | null;
    rejectReason: string | null;
  };
}

export type PurchaseOrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export function usePurchaseOrders() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { programs } = useProgramsSafe();
  const [orders, setOrders] = useState<PurchaseOrderAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent double-click/double-submission
  const isCreatingOrder = useRef(false);
  const isApprovingOrder = useRef(false);

  const program = programs.purchaseOrder;

  // Fetch all purchase orders
  const fetchOrders = useCallback(async () => {
    if (!program) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allOrders = await program.account.purchaseOrder.all();
      setOrders(allOrders as PurchaseOrderAccount[]);
    } catch (err: any) {
      console.error('[usePurchaseOrders] Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [program]);

  // Auto-fetch on mount and when program changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Create a new purchase order
  const createOrder = useCallback(
    async (params: {
      mint: PublicKey;
      quantity: number;
      pricePerTokenLamports: number;
      adminVault: PublicKey;
    }) => {
      if (!publicKey || !signTransaction || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      // Prevent double-click/double-submission
      if (isCreatingOrder.current) {
        console.log('[usePurchaseOrders] Already creating order, skipping...');
        throw new Error('Já existe uma ordem sendo processada. Aguarde...');
      }

      try {
        isCreatingOrder.current = true;

        const { mint, quantity, pricePerTokenLamports, adminVault } = params;

        console.log('[usePurchaseOrders] Checking program provider:', {
          hasProgram: !!program,
          hasProvider: !!program?.provider,
          providerWallet: program?.provider?.wallet?.publicKey?.toBase58(),
          currentWallet: publicKey?.toBase58(),
          walletsMatch: program?.provider?.wallet?.publicKey?.equals(publicKey),
        });


        const nowMs = Date.now(); // milliseconds since epoch
        const nowMicros = nowMs * 1000; // convert to microseconds

        // Add sub-millisecond precision from performance.now()
        const perfMs = performance.now();
        const subMicrosPrecision = Math.floor((perfMs % 1) * 1000); // 0-999 microseconds

        // Add random component for extra uniqueness (0-999)
        const randomSuffix = Math.floor(Math.random() * 1000);

        // Final timestamp in microseconds with uniqueness
        const timestamp = nowMicros + subMicrosPrecision + randomSuffix;

        // Validate it fits in i64
        const MAX_I64 = Number.MAX_SAFE_INTEGER; // 9007199254740991
        if (timestamp > MAX_I64) {
          throw new Error(`Timestamp ${timestamp} exceeds safe integer value`);
        }

        console.log('[usePurchaseOrders] Creating order with timestamp:', timestamp);

        // Derive PDA
        const [purchaseOrderPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from(PURCHASE_ORDER_SEED),
            mint.toBuffer(),
            publicKey.toBuffer(),
            Buffer.from(new BN(timestamp).toArray('le', 8)),
          ],
          program.programId
        );

        console.log('[usePurchaseOrders] PDA:', purchaseOrderPda.toBase58());

        let signature: string;

        try {
          signature = await program.methods
            .createPurchaseOrder(new BN(quantity), new BN(pricePerTokenLamports), new BN(timestamp))
            .accounts({
              investor: publicKey,
              mint,
              purchaseOrder: purchaseOrderPda,
              adminVault,
              systemProgram: SystemProgram.programId,
            })
            .rpc({
              skipPreflight: false,
              commitment: 'confirmed',
            });

          console.log('[usePurchaseOrders] Order created:', signature);
        } catch (rpcError: any) {
          // If error is "already processed", the transaction succeeded but RPC returned error
          const errorMsg = rpcError?.message || rpcError?.toString() || '';

          if (errorMsg.includes('already been processed') || errorMsg.includes('already processed')) {
            console.warn('[usePurchaseOrders] Transaction already processed, checking if account was created...');

            // Wait a bit for account to be indexed
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if the purchase order account was actually created
            const accountInfo = await connection.getAccountInfo(purchaseOrderPda);
            if (accountInfo) {
              console.log('[usePurchaseOrders] Purchase order account exists! Transaction succeeded despite error.');

              // Try to find the signature from recent transactions
              const recentSigs = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
              signature = recentSigs[0]?.signature || 'PROCESSED_NO_SIG';

              console.log('[usePurchaseOrders] Using signature:', signature);
            } else {
              console.error('[usePurchaseOrders] Account was not created. Real error.');
              throw rpcError;
            }
          } else {
            throw rpcError;
          }
        }

        // Refresh orders asynchronously (don't block on this)
        fetchOrders().catch(err => console.error('[usePurchaseOrders] Error refreshing orders:', err));

        return { signature, purchaseOrderPda };
      } catch (err: any) {
        console.error('[usePurchaseOrders] Error creating order:', err);
        throw err;
      } finally {
        // Always reset the flag
        isCreatingOrder.current = false;
      }
    },
    [publicKey, signTransaction, program, fetchOrders]
  );

  // Admin approves purchase order
  const approveOrder = useCallback(
    async (params: {
      purchaseOrderPda: PublicKey;
      mint: PublicKey;
      investor: PublicKey;
      adminTokenAccount: PublicKey;
    }) => {
      if (!publicKey || !signTransaction || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      // Prevent double-click/double-submission
      if (isApprovingOrder.current) {
        console.log('[usePurchaseOrders] Already approving order, skipping...');
        throw new Error('Já existe uma aprovação sendo processada. Aguarde...');
      }

      try {
        isApprovingOrder.current = true;
        const { purchaseOrderPda, mint, investor, adminTokenAccount } = params;

        // Check if admin's token account exists and has enough tokens
        const adminAccountInfo = await connection.getAccountInfo(adminTokenAccount);
        if (!adminAccountInfo) {
          throw new Error(
            `Admin não possui token account para este token (${mint.toBase58().slice(0, 8)}...). ` +
            `Por favor, crie tokens SRWA primeiro usando o Token Wizard.`
          );
        }

        // Get purchase order to check quantity needed
        const orderAccount = await program.account.purchaseOrder.fetch(purchaseOrderPda);

        // Check if order is still pending
        const currentStatus = orderAccount.status;
        if (!('pending' in currentStatus)) {
          throw new Error('Esta purchase order já foi processada e não pode ser aprovada novamente.');
        }

        // Decode admin token account to check balance
        const adminTokenAccountData = await connection.getTokenAccountBalance(adminTokenAccount);
        const adminBalance = BigInt(adminTokenAccountData.value.amount);
        const quantityNeeded = BigInt(orderAccount.quantity.toString());

        if (adminBalance < quantityNeeded) {
          throw new Error(
            `Admin não possui tokens suficientes. ` +
            `Necessário: ${quantityNeeded.toString()}, Disponível: ${adminBalance.toString()}`
          );
        }

        // Get investor's token account
        const investorTokenAccount = await getAssociatedTokenAddress(mint, investor, false, TOKEN_2022_PROGRAM_ID);

        // Check if investor's token account exists
        const accountInfo = await connection.getAccountInfo(investorTokenAccount);

        console.log('[usePurchaseOrders] Mint:', mint.toBase58());
        console.log('[usePurchaseOrders] Admin token account:', adminTokenAccount.toBase58());
        console.log('[usePurchaseOrders] Investor token account:', investorTokenAccount.toBase58());

        // Build the approve instruction
        const approveIx = await program.methods
          .approvePurchaseOrder()
          .accounts({
            admin: publicKey,
            purchaseOrder: purchaseOrderPda,
            mint,
            adminTokenAccount,
            investorTokenAccount,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
          })
          .instruction();

        console.log('[usePurchaseOrders] Approve instruction created, keys:', approveIx.keys.length);

        // Manually add Transfer Hook extra accounts (KYC registries)
        // The Transfer Hook expects 2 extra accounts: sender_kyc and recipient_kyc
        const CONTROLLER_PROGRAM_ID = new PublicKey(PROGRAM_IDS.srwaController);

        // Derive admin KYC PDA
        const [adminKycPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('kyc'), publicKey.toBuffer()],
          CONTROLLER_PROGRAM_ID
        );

        // Derive investor KYC PDA
        const [investorKycPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('kyc'), investor.toBuffer()],
          CONTROLLER_PROGRAM_ID
        );

        console.log('[usePurchaseOrders] Admin KYC PDA:', adminKycPda.toBase58());
        console.log('[usePurchaseOrders] Investor KYC PDA:', investorKycPda.toBase58());

        // Add the KYC accounts as remaining accounts for the Transfer Hook
        approveIx.keys.push(
          { pubkey: adminKycPda, isSigner: false, isWritable: false },
          { pubkey: investorKycPda, isSigner: false, isWritable: false }
        );

        console.log('[usePurchaseOrders] After adding KYC accounts, keys:', approveIx.keys.length);

        // Build transaction
        const transaction = new Transaction();

        if (!accountInfo) {
          // Need to create the investor's token account first
          console.log('[usePurchaseOrders] Creating investor token account:', investorTokenAccount.toBase58());

          const createAtaIx = createAssociatedTokenAccountInstruction(
            publicKey, // payer
            investorTokenAccount, // ata
            investor, // owner
            mint, // mint
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );

          transaction.add(createAtaIx);
        }

        transaction.add(approveIx);

        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        // Sign and send using wallet adapter
        if (!signTransaction) {
          throw new Error('Wallet does not support signing transactions');
        }

        const signedTx = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: true,
        });

        // Wait for confirmation
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        }, 'confirmed');

        console.log('[usePurchaseOrders] Order approved:', signature);
        const tx = signature;

        // After approval, deposit SOL received into MarginFi
        try {
          toast.info('Depositando SOL recebido no MarginFi...');

          // Calculate SOL amount received (in lamports)
          const solAmountLamports = orderAccount.totalLamports.toNumber();
          const solAmount = solAmountLamports / 1e9; // Convert lamports to SOL

          console.log(`[usePurchaseOrders] Depositing ${solAmount} SOL to MarginFi`);

          // Initialize MarginFi client
          const config = getConfig('dev');

          // Create wallet adapter for MarginFi
          const walletAdapter = {
            publicKey,
            signTransaction,
            signAllTransactions: signAllTransactions || (async (txs: any[]) => {
              if (!signTransaction) throw new Error('Wallet cannot sign transactions');
              return Promise.all(txs.map(tx => signTransaction(tx)));
            }),
          };

          const marginfiClient = await MarginfiClient.fetch(config, walletAdapter as any, connection);

          // Get or create MarginFi account
          const accounts = await marginfiClient.getMarginfiAccountsForAuthority(publicKey);
          let marginfiAccount;

          if (accounts.length > 0) {
            marginfiAccount = accounts[0];
            console.log('[usePurchaseOrders] Using existing MarginFi account');
          } else {
            marginfiAccount = await marginfiClient.createMarginfiAccount();
            console.log('[usePurchaseOrders] Created new MarginFi account');
          }

          // Find wSOL bank
          const banks = marginfiClient.banks;
          const solBank = Array.from(banks.values()).find(
            (bank) => bank.mint.equals(WSOL_MINT_DEVNET)
          );

          if (!solBank) {
            throw new Error('Banco wSOL não encontrado no MarginFi');
          }

          // Deposit SOL to MarginFi
          await marginfiAccount.deposit(solAmount, solBank.address);

          console.log('[usePurchaseOrders] SOL deposited to MarginFi successfully');
          toast.success(`${solAmount.toFixed(4)} SOL depositado no MarginFi!`);
        } catch (marginfiError: any) {
          console.error('[usePurchaseOrders] Error depositing to MarginFi:', marginfiError);
          toast.error(`Compra aprovada, mas falha ao depositar no MarginFi: ${marginfiError.message}`);
          // Don't throw - the purchase was already approved successfully
        }

        // Refresh immediately and again after 2 seconds for good measure
        fetchOrders().catch(err => console.error('[usePurchaseOrders] Error refreshing orders (immediate):', err));

        setTimeout(() => {
          fetchOrders().catch(err => console.error('[usePurchaseOrders] Error refreshing orders (delayed):', err));
        }, 2000);

        return tx;
      } catch (err: any) {
        console.error('[usePurchaseOrders] Error approving order:', err);
        throw err;
      } finally {
        // Always reset the flag
        isApprovingOrder.current = false;
      }
    },
    [publicKey, signTransaction, program, fetchOrders, connection]
  );

  // Admin rejects purchase order
  const rejectOrder = useCallback(
    async (params: {
      purchaseOrderPda: PublicKey;
      investor: PublicKey;
      adminVault: PublicKey;
      reason: string;
    }) => {
      if (!publicKey || !signTransaction || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      try {
        const { purchaseOrderPda, investor, adminVault, reason } = params;

        const tx = await program.methods
          .rejectPurchaseOrder(reason)
          .accounts({
            admin: publicKey,
            purchaseOrder: purchaseOrderPda,
            adminVault,
            investor,
            systemProgram: SystemProgram.programId,
          })
          .rpc({
            skipPreflight: false,
            commitment: 'confirmed',
          });

        console.log('[usePurchaseOrders] Order rejected:', tx);

        // Refresh orders asynchronously (don't block on this)
        fetchOrders().catch(err => console.error('[usePurchaseOrders] Error refreshing orders:', err));

        return tx;
      } catch (err: any) {
        console.error('[usePurchaseOrders] Error rejecting order:', err);
        throw err;
      }
    },
    [publicKey, signTransaction, program, fetchOrders]
  );

  // Investor cancels purchase order
  const cancelOrder = useCallback(
    async (params: {
      purchaseOrderPda: PublicKey;
      adminVault: PublicKey;
    }) => {
      if (!publicKey || !signTransaction || !program) {
        throw new Error('Wallet not connected or program not loaded');
      }

      try {
        const { purchaseOrderPda, adminVault } = params;

        const tx = await program.methods
          .cancelPurchaseOrder()
          .accounts({
            investor: publicKey,
            purchaseOrder: purchaseOrderPda,
            adminVault,
            systemProgram: SystemProgram.programId,
          })
          .rpc({
            skipPreflight: false,
            commitment: 'confirmed',
          });

        console.log('[usePurchaseOrders] Order cancelled:', tx);

        // Refresh orders asynchronously (don't block on this)
        fetchOrders().catch(err => console.error('[usePurchaseOrders] Error refreshing orders:', err));

        return tx;
      } catch (err: any) {
        console.error('[usePurchaseOrders] Error cancelling order:', err);
        throw err;
      }
    },
    [publicKey, signTransaction, program, fetchOrders]
  );

  // Helper to get status string
  const getStatus = (order: PurchaseOrderAccount): PurchaseOrderStatus => {
    const status = order.account.status;
    if ('pending' in status) return 'pending';
    if ('approved' in status) return 'approved';
    if ('rejected' in status) return 'rejected';
    if ('cancelled' in status) return 'cancelled';
    return 'pending';
  };

  // Filter orders by status
  const getPendingOrders = useCallback(() => {
    const pending = orders.filter(order => getStatus(order) === 'pending');
    console.log('[usePurchaseOrders.getPendingOrders]', {
      totalOrders: orders.length,
      pendingCount: pending.length,
      pending: pending.map(o => ({
        investor: o.account.investor.toBase58(),
        status: o.account.status,
        quantity: o.account.quantity.toString(),
      })),
    });
    return pending;
  }, [orders, getStatus]);

  const getOrdersByInvestor = useCallback((investor: PublicKey) => {
    return orders.filter(order => order.account.investor.equals(investor));
  }, [orders]);

  return {
    orders,
    loading,
    error,
    createOrder,
    approveOrder,
    rejectOrder,
    cancelOrder,
    fetchOrders,
    getPendingOrders,
    getOrdersByInvestor,
    getStatus,
  };
}
