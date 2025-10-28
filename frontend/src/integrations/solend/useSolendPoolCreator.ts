import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ACCOUNT_SIZE,
  MINT_SIZE,
  createApproveInstruction,
  createRevokeInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from '@solana/spl-token';
import BN from 'bn.js';
import { toast } from 'sonner';
import {
  CreateSolendPoolInput,
  CreateSolendPoolResult,
  CreatedReserveAccounts,
  SolendReserveRiskConfigInput,
} from './types';
import {
  SOLEND_DEVNET_PROGRAM_ID,
  PYTH_DEVNET_PROGRAM_ID,
  SWITCHBOARD_DEVNET_PROGRAM_ID,
  NULL_ORACLE,
} from './constants';
import {
  decimalToBN,
  parsePublicKey,
  stringToBN,
  toQuoteCurrencyBuffer,
  U64_MAX,
} from './utils';
import {
  initLendingMarketIx,
  initReserveIx,
  LENDING_MARKET_SIZE,
  RESERVE_SIZE,
  ReserveConfigEncoded,
} from './instructions';

const CONFIRMATION = 'confirmed';
const MOCK_SOLEND = import.meta.env.VITE_SOLEND_USE_MOCK === 'true';

interface SendTxParams {
  transaction: Transaction;
  signers?: Keypair[];
}

function describeInstruction(ix: Transaction['instructions'][number]) {
  return {
    programId: ix.programId.toBase58(),
    dataLen: ix.data.length,
    dataBase64: Buffer.from(ix.data).toString('base64'),
    accounts: ix.keys.map((meta, idx) => ({
      index: idx,
      pubkey: meta.pubkey.toBase58(),
      isSigner: meta.isSigner,
      isWritable: meta.isWritable,
    })),
  };
}

export function useSolendPoolCreator() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CreateSolendPoolResult | null>(null);

  const send = useCallback(
    async ({ transaction, signers = [] }: SendTxParams): Promise<TransactionSignature> => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      console.group('[useSolendPoolCreator.send]');
      let simulationTx: Transaction | null = null;

      transaction.feePayer = wallet.publicKey;
      const latestBlockhash = await connection.getLatestBlockhash(CONFIRMATION);
      transaction.recentBlockhash = latestBlockhash.blockhash;

      if (signers.length > 0) {
        transaction.partialSign(...signers);
      }

      simulationTx = Transaction.from(
        transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
      );

      console.log('[useSolendPoolCreator.send] Prepared transaction', {
        feePayer: transaction.feePayer.toBase58(),
        signers: signers.map((s) => s.publicKey.toBase58()),
        instructions: transaction.instructions.map((ix, index) => ({
          index,
          ...describeInstruction(ix),
        })),
      });

      try {
        const signature = await wallet.sendTransaction(transaction, connection, {
          signers,
          preflightCommitment: CONFIRMATION,
        });
        console.log('[useSolendPoolCreator.send] Signature sent', signature);

        await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          CONFIRMATION
        );

        console.groupEnd();
        return signature;
      } catch (error) {
        let transformedError: unknown = error;
        try {
          const simulation = await connection.simulateTransaction(
            simulationTx ?? transaction
          );
          const logs = simulation.value.logs ?? [];
          console.error(
            '[useSolendPoolCreator.send] Simulation logs\n' + logs.map((log) => `  • ${log}`).join('\n')
          );
          console.error('[useSolendPoolCreator.send] Simulation error', simulation.value.err);
          if (logs.some((log) => log.includes('Liquidation threshold must be in range [LTV, 100]'))) {
            transformedError = new Error(
              'A Solend rejeitou a configuração: a liquidation threshold precisa ser maior ou igual ao Loan to Value (LTV).'
            );
          }
          if (logs.some((log) => log.includes('Pyth oracle price is stale'))) {
            transformedError = new Error(
              'O preço da Pyth está desatualizado na devnet. Atualize o feed manualmente (pyth push) ou use um feed Switchboard ativo.'
            );
          }
          if (logs.some((log) => log.includes('Null oracle config'))) {
            transformedError = new Error(
              'Nenhum oráculo válido foi aceito. Verifique se a conta Pyth está ativa ou forneça um feed Switchboard válido.'
            );
          }
          if (logs.some((log) => log.includes('Pyth product account provided is not a valid Pyth product account'))) {
            transformedError = new Error(
              'A conta de produto da Pyth informada não é válida para o programa selecionado. Confira se está usando o endereço correto na devnet.'
            );
          }
        } catch (simulationError) {
          console.error('[useSolendPoolCreator.send] Simulation failed', simulationError);
          if (simulationError instanceof Error) {
            transformedError = simulationError;
          }
        }
        console.error('[useSolendPoolCreator.send] Failed to send transaction', {
          error,
          name: (error as any)?.name,
          message: (error as any)?.message,
          logs: (error as any)?.logs,
          code: (error as any)?.code,
        });
        console.groupEnd();
        throw transformedError;
      }
    },
    [wallet, connection]
  );

  const ensureWalletCapabilities = useCallback(() => {
    if (MOCK_SOLEND) {
      return;
    }
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Conecte uma carteira de administrador antes de criar pools Solend');
    }
    if (!wallet.sendTransaction) {
      throw new Error('A carteira selecionada não suporta envio de transações');
    }
    if (!wallet.signTransaction) {
      throw new Error('A carteira selecionada não suporta assinatura de transações');
    }
  }, [wallet]);

  const buildReserveConfig = useCallback(
    (
      input: SolendReserveRiskConfigInput,
      feeReceiver: PublicKey
    ): ReserveConfigEncoded => ({
      optimalUtilizationRate: input.optimalUtilizationRate,
      maxUtilizationRate: input.maxUtilizationRate,
      loanToValueRatio: input.loanToValueRatio,
      liquidationBonus: input.liquidationBonus,
      maxLiquidationBonus: input.maxLiquidationBonus,
      liquidationThreshold: input.liquidationThreshold,
      maxLiquidationThreshold: input.maxLiquidationThreshold,
      minBorrowRate: input.minBorrowRate,
      optimalBorrowRate: input.optimalBorrowRate,
      maxBorrowRate: input.maxBorrowRate,
      superMaxBorrowRate: stringToBN(input.superMaxBorrowRate.toString()),
      fees: {
        borrowFeeWad: stringToBN('0'),
        flashLoanFeeWad: stringToBN('0'),
        hostFeePercentage: 0,
      },
      depositLimit: stringToBN(input.depositLimit, U64_MAX),
      borrowLimit: stringToBN(input.borrowLimit, U64_MAX),
      feeReceiver,
      protocolLiquidationFee: input.protocolLiquidationFee,
      protocolTakeRate: input.protocolTakeRate,
      addedBorrowWeightBPS: stringToBN(input.addedBorrowWeightBps, new BN(0)),
      reserveType: 0,
      scaledPriceOffsetBPS: stringToBN(input.scaledPriceOffsetBps, new BN(0)),
      extraOracle: input.extraOracle ? new PublicKey(input.extraOracle) : undefined,
      attributedBorrowLimitOpen: stringToBN(input.attributedBorrowLimitOpen, new BN(0)),
      attributedBorrowLimitClose: stringToBN(input.attributedBorrowLimitClose, new BN(0)),
    }),
    []
  );

  const createLendingMarket = useCallback(
    async (
      quoteCurrency: string,
      oracleProgram: string,
      switchboardProgram: string
    ): Promise<{
      market: PublicKey;
      authority: PublicKey;
      signature: string;
    }> => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      console.group('[useSolendPoolCreator.createLendingMarket]');
      console.log('[useSolendPoolCreator.createLendingMarket] Inputs', {
        quoteCurrency,
        oracleProgram,
        switchboardProgram,
      });

      const programId = SOLEND_DEVNET_PROGRAM_ID;
      const oracleProgramId = oracleProgram
        ? new PublicKey(oracleProgram)
        : PYTH_DEVNET_PROGRAM_ID;
      const switchboardProgramId = switchboardProgram
        ? new PublicKey(switchboardProgram)
        : SWITCHBOARD_DEVNET_PROGRAM_ID;

      const marketKeypair = Keypair.generate();
      const lamports = await connection.getMinimumBalanceForRentExemption(LENDING_MARKET_SIZE);
      console.log('[useSolendPoolCreator.createLendingMarket] Derived values', {
        programId: programId.toBase58(),
        oracleProgramId: oracleProgramId.toBase58(),
        switchboardProgramId: switchboardProgramId.toBase58(),
        marketKeypair: marketKeypair.publicKey.toBase58(),
        rentLamports: lamports,
      });

      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: marketKeypair.publicKey,
        space: LENDING_MARKET_SIZE,
        lamports,
        programId,
      });

      const initMarketIx = initLendingMarketIx(
        wallet.publicKey,
        toQuoteCurrencyBuffer(quoteCurrency),
        marketKeypair.publicKey,
        programId,
        oracleProgramId,
        switchboardProgramId
      );

      const tx = new Transaction().add(createAccountIx, initMarketIx);
      const signature = await send({ transaction: tx, signers: [marketKeypair] });
      const [authority] = await PublicKey.findProgramAddress(
        [marketKeypair.publicKey.toBuffer()],
        programId
      );

      const result = { market: marketKeypair.publicKey, authority, signature };
      console.log('[useSolendPoolCreator.createLendingMarket] Result', result);
      console.groupEnd();
      return result;
    },
    [wallet.publicKey, connection, send]
  );

  const createReserve = useCallback(
    async (
      market: PublicKey,
      marketAuthority: PublicKey,
      oracleProgramId: PublicKey,
      input: SolendReserveRiskConfigInput,
      reserveInput: CreateSolendPoolInput['reserve']
    ): Promise<{
      reservePubkey: PublicKey;
      accounts: CreatedReserveAccounts;
      signatures: string[];
    }> => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      console.group('[useSolendPoolCreator.createReserve]');

      try {
        console.log('[useSolendPoolCreator.createReserve] Args', {
          market: market.toBase58(),
          marketAuthority: marketAuthority.toBase58(),
          reserveInput,
        });

        const programId = SOLEND_DEVNET_PROGRAM_ID;
        const liquidityMint = new PublicKey(reserveInput.liquidityMint);
        const pythProductAccount = parsePublicKey(reserveInput.pythProductAccount);
        const pythPriceAccount = parsePublicKey(reserveInput.pythPriceAccount);
        const switchboardFeed = parsePublicKey(reserveInput.switchboardFeed, NULL_ORACLE);

        // Pular validação de oráculos se estiver usando NULL_ORACLE (modo teste)
        const isUsingNullOracle = pythProductAccount.equals(NULL_ORACLE) && pythPriceAccount.equals(NULL_ORACLE);

        if (!isUsingNullOracle) {
          const [pythProductInfo, pythPriceInfo] = await Promise.all([
            connection.getAccountInfo(pythProductAccount),
            connection.getAccountInfo(pythPriceAccount),
          ]);

          if (!pythProductInfo) {
            throw new Error('Conta de produto da Pyth não encontrada no cluster selecionado.');
          }
          if (!pythPriceInfo) {
            throw new Error('Conta de preço da Pyth não encontrada no cluster selecionado.');
          }

          if (!pythProductInfo.owner.equals(oracleProgramId)) {
            throw new Error('Conta de produto informada não pertence ao programa Pyth selecionado.');
          }
          if (!pythPriceInfo.owner.equals(oracleProgramId)) {
            throw new Error('Conta de preço informada não pertence ao programa Pyth selecionado.');
          }
        } else {
          console.warn('[useSolendPoolCreator] ⚠️ Modo teste ativo - usando NULL_ORACLE (validações de oráculo desabilitadas)');
        }

      // Verificar se o mint existe
      let mintInfo;
      try {
        mintInfo = await getMint(connection, liquidityMint);
      } catch (error) {
        throw new Error(`Mint inválido ou não encontrado: ${liquidityMint.toBase58()}. Certifique-se de que o token foi criado na devnet.`);
      }

      const liquidityAmount = decimalToBN(reserveInput.initialLiquidity, mintInfo.decimals);

      // Verificar se a ATA existe e tem saldo
      const sourceLiquidity = await getAssociatedTokenAddress(liquidityMint, wallet.publicKey, true);

      let sourceAccount;
      try {
        sourceAccount = await getAccount(connection, sourceLiquidity);
      } catch (error) {
        throw new Error(
          `Você não possui uma conta de token para ${liquidityMint.toBase58()}. ` +
          `Crie uma ATA (Associated Token Account) e deposite pelo menos ${reserveInput.initialLiquidity} tokens antes de criar o pool. ` +
          `Use: spl-token create-account ${liquidityMint.toBase58()} && spl-token mint ${liquidityMint.toBase58()} ${reserveInput.initialLiquidity}`
        );
      }

      if (sourceAccount.amount < BigInt(liquidityAmount.toString())) {
        throw new Error(
          `Saldo insuficiente. Você tem ${sourceAccount.amount.toString()} tokens mas precisa de ${liquidityAmount.toString()} para provisionar o pool. ` +
          `Deposite mais tokens na sua conta: ${sourceLiquidity.toBase58()}`
        );
      }

        const liquidityFeeReceiver = reserveInput.feeReceiver
          ? new PublicKey(reserveInput.feeReceiver)
          : sourceLiquidity;
        if (reserveInput.feeReceiver) {
          const feeReceiverInfo = await connection.getAccountInfo(liquidityFeeReceiver);
          if (!feeReceiverInfo) {
            throw new Error('Conta SPL informada como fee receiver não existe no cluster');
          }
        }

      const reserveKeypair = Keypair.generate();
      const collateralMintKeypair = Keypair.generate();
      const collateralSupplyKeypair = Keypair.generate();
      const liquiditySupplyKeypair = Keypair.generate();
      const userCollateralKeypair = Keypair.generate();
      const transferAuthority = Keypair.generate();

        const reserveRent = await connection.getMinimumBalanceForRentExemption(RESERVE_SIZE);
        const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
        const tokenAccountRent = await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);

      const reserveAccounts: CreatedReserveAccounts = {
        reserve: reserveKeypair.publicKey,
        collateralMint: collateralMintKeypair.publicKey,
        collateralSupply: collateralSupplyKeypair.publicKey,
        liquiditySupply: liquiditySupplyKeypair.publicKey,
        liquidityFeeReceiver,
        userCollateral: userCollateralKeypair.publicKey,
      };
        console.log('[useSolendPoolCreator.createReserve] Derived accounts', {
          programId: programId.toBase58(),
          liquidityMint: liquidityMint.toBase58(),
          liquidityDecimals: mintInfo.decimals,
          liquidityAmount: liquidityAmount.toString(),
        sourceLiquidity: sourceLiquidity.toBase58(),
        liquidityFeeReceiver: liquidityFeeReceiver.toBase58(),
        rent: {
          reserveRent,
          mintRent,
          tokenAccountRent,
        },
        reserveAccounts: Object.fromEntries(
          Object.entries(reserveAccounts).map(([key, value]) => [key, value.toBase58()])
        ),
      });

        const txCreateAccountsA = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: reserveKeypair.publicKey,
            space: RESERVE_SIZE,
            lamports: reserveRent,
            programId,
          }),
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: collateralMintKeypair.publicKey,
            space: MINT_SIZE,
            lamports: mintRent,
            programId: TOKEN_PROGRAM_ID,
          }),
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: collateralSupplyKeypair.publicKey,
            space: ACCOUNT_SIZE,
            lamports: tokenAccountRent,
            programId: TOKEN_PROGRAM_ID,
          }),
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: userCollateralKeypair.publicKey,
            space: ACCOUNT_SIZE,
            lamports: tokenAccountRent,
            programId: TOKEN_PROGRAM_ID,
          })
        );

        const txCreateAccountsB = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: liquiditySupplyKeypair.publicKey,
            space: ACCOUNT_SIZE,
            lamports: tokenAccountRent,
            programId: TOKEN_PROGRAM_ID,
          })
        );

        const reserveConfig = buildReserveConfig(input, liquidityFeeReceiver);

        const approveIx = createApproveInstruction(
          sourceLiquidity,
          transferAuthority.publicKey,
          wallet.publicKey,
          BigInt(liquidityAmount.toString())
        );

        console.log('[useSolendPoolCreator.createReserve] InitReserve params:', {
          market: market.toBase58(),
          marketAuthority: marketAuthority.toBase58(),
          marketOwner: wallet.publicKey.toBase58(),
          transferAuthority: transferAuthority.publicKey.toBase58(),
        });

        const initReserveInstruction = initReserveIx(
          liquidityAmount,
          reserveConfig,
          sourceLiquidity,
          userCollateralKeypair.publicKey,
          reserveKeypair.publicKey,
          liquidityMint,
          liquiditySupplyKeypair.publicKey,
          liquidityFeeReceiver,
          collateralMintKeypair.publicKey,
          collateralSupplyKeypair.publicKey,
          pythProductAccount,
          pythPriceAccount,
          switchboardFeed,
          market,
          marketAuthority,
          wallet.publicKey,
          transferAuthority.publicKey,
          programId
        );

        const revokeIx = createRevokeInstruction(sourceLiquidity, wallet.publicKey);

        const txInitReserve = new Transaction().add(approveIx, initReserveInstruction, revokeIx);

        const signatures: string[] = [];
        signatures.push(
          await send({ transaction: txCreateAccountsA, signers: [reserveKeypair, collateralMintKeypair, collateralSupplyKeypair, userCollateralKeypair] })
        );
        signatures.push(
          await send({ transaction: txCreateAccountsB, signers: [liquiditySupplyKeypair] })
        );
        signatures.push(
          await send({ transaction: txInitReserve, signers: [transferAuthority] })
        );

        const result = { reservePubkey: reserveKeypair.publicKey, accounts: reserveAccounts, signatures };
        console.log('[useSolendPoolCreator.createReserve] Result', result);
        return result;
      } catch (error) {
        console.error('[useSolendPoolCreator.createReserve] Failed', error);
        throw error;
      } finally {
        console.groupEnd();
      }
    },
    [wallet.publicKey, connection, send, buildReserveConfig]
  );

  const createPool = useCallback(
    async (input: CreateSolendPoolInput): Promise<CreateSolendPoolResult> => {
      console.group('[useSolendPoolCreator.createPool]');
      console.log('[useSolendPoolCreator.createPool] Payload', input);
      ensureWalletCapabilities();
      setLoading(true);

      try {
        if (MOCK_SOLEND) {
          console.warn('[useSolendPoolCreator.createPool] Mock mode ativo - nenhuma transação será enviada');
          const marketKey = Keypair.generate().publicKey;
          const authority = Keypair.generate().publicKey;
          const reserveKey = Keypair.generate().publicKey;
          const collateralMint = Keypair.generate().publicKey;
          const collateralSupply = Keypair.generate().publicKey;
          const liquiditySupply = Keypair.generate().publicKey;
          const feeReceiver = Keypair.generate().publicKey;
          const userCollateral = Keypair.generate().publicKey;

          const result: CreateSolendPoolResult = {
            marketPubkey: marketKey,
            marketAuthority: authority,
            reservePubkey: reserveKey,
            reserveAccounts: {
              reserve: reserveKey,
              collateralMint,
              collateralSupply,
              liquiditySupply,
              liquidityFeeReceiver: feeReceiver,
              userCollateral,
            },
            signatures: [`mock-${Date.now()}`],
          };

          setLastResult(result);
          console.log('[useSolendPoolCreator.createPool] Mock result', result);
          toast.success('Mock Solend pool criado com sucesso (modo simulação)');
          console.groupEnd();
          return result;
        }

        let marketPubkey: PublicKey;
        let marketAuthority: PublicKey;
        const collectedSignatures: string[] = [];

        const oracleProgramPk = new PublicKey(
          input.market.oracleProgramId || PYTH_DEVNET_PROGRAM_ID.toBase58()
        );
        if (input.market.createNewMarket) {
          const { market, authority, signature } = await createLendingMarket(
            input.market.quoteCurrency,
            oracleProgramPk.toBase58(),
            input.market.switchboardProgramId || SWITCHBOARD_DEVNET_PROGRAM_ID.toBase58()
          );
          marketPubkey = market;
          marketAuthority = authority;
          collectedSignatures.push(signature);
        } else {
          if (!input.market.existingMarket) {
            throw new Error('Informe o endereço do lending market Solend que deseja utilizar');
          }
          marketPubkey = new PublicKey(input.market.existingMarket);
          [marketAuthority] = await PublicKey.findProgramAddress(
            [marketPubkey.toBuffer()],
            SOLEND_DEVNET_PROGRAM_ID
          );
        }

        const { reservePubkey, accounts, signatures } = await createReserve(
          marketPubkey,
          marketAuthority,
          oracleProgramPk,
          input.reserve.riskConfig,
          input.reserve
        );
        collectedSignatures.push(...signatures);

        const result: CreateSolendPoolResult = {
          marketPubkey,
          marketAuthority,
          reservePubkey,
          reserveAccounts: accounts,
          signatures: collectedSignatures,
        };

        setLastResult(result);
        console.log('[useSolendPoolCreator.createPool] Result', result);
        console.groupEnd();
        return result;
      } catch (error: any) {
        console.error('[useSolendPoolCreator.createPool] Failed', error);
        console.groupEnd();
        toast.error(error.message ?? 'Falha ao criar pool Solend');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [ensureWalletCapabilities, createLendingMarket, createReserve]
  );

  return {
    loading,
    lastResult,
    createPool,
  };
}
