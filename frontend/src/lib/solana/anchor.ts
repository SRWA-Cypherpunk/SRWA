import * as anchor from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Program IDs (deployed on devnet) - Must match Anchor.toml [programs.devnet]
export const PROGRAM_IDS = {
  srwaFactory: "CfNjE6Lp6ddtrnTZQci2pPVkDsqB83hsBELwF9KR7n8b",
  srwaController: "A6JtsR3Zw1GB1gTJuqdpFiBijarm9pQRTgqVkZaEdBs3",
  identityClaims: "AuUzmKAAVyvR6NvDdd56SDjXHSE8dUePEnC5moECw9mE",
  complianceModules: "GD3ArP1GPKN9sWYPxiPia2i3iAKKsnbXxpcoB1gQK5D",
  offeringPool: "4D54H4NBA9Q7WtsAy2yaFs9BjEdT8DcdmXekKsf7n6KP",
  yieldAdapter: "4RrVh2CZKUiU3g7uD2qVtVMYbXSvMQ1oSz2S8RnuHpEv",
  valuationOracle: "C4sJ1phqCh2MxFJJqVHZuddXbp6hWfvz29N4CkscPpaW",
  cashflowEngine: "4ySjU9NzSwg457oxWCVgaH3fqqrhh7iDQco7Db1Zq4Di",
  purchaseOrder: "BaExU2Svqwieyia551irUjfE34hoRnitrdcjKkvdpJdL",
};

export const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || 'http://127.0.0.1:8899';

const LOCAL_IDL_BASE_PATH = "/idl";

type ProgramName = keyof typeof PROGRAM_IDS;

interface ProgramConfig {
  name: ProgramName;
  programId: string;
  required: boolean;
  idlFile: string;
}

export class SRWAClient {
  public programs: any;
  public connection: Connection;
  public provider: anchor.AnchorProvider | null;
  private walletFundingPromise: Promise<void> | null;
  private cachedWalletPubkey: string | null;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, "confirmed");
    this.provider = null;
    this.programs = null;
    this.walletFundingPromise = null;
    this.cachedWalletPubkey = null;
  }

  private async ensureWalletFunded(provider: anchor.AnchorProvider) {
    if (this.walletFundingPromise) {
      return this.walletFundingPromise;
    }

    const publicKey = provider.wallet?.publicKey;
    if (!publicKey) {
      return;
    }

    // Skip wallet funding for read-only mode (dummy wallet)
    if (publicKey.equals(PublicKey.default)) {
      console.log("🔒 Read-only mode detected, skipping wallet funding");
      return;
    }

    const endpoint = provider.connection.rpcEndpoint || "";
    const isLocalEndpoint =
      endpoint.includes("127.0.0.1") ||
      endpoint.includes("localhost") ||
      endpoint.includes("0.0.0.0");

    if (!isLocalEndpoint) {
      return;
    }

    const MIN_BALANCE = 0.5 * LAMPORTS_PER_SOL;
    const TOP_UP_AMOUNT = 2 * LAMPORTS_PER_SOL;

    this.walletFundingPromise = (async () => {
      try {
        const currentBalance = await provider.connection.getBalance(publicKey);
        if (currentBalance >= MIN_BALANCE) {
          return;
        }

        console.log("💸 Wallet balance baixo, solicitando airdrop local...", {
          currentBalance,
          required: MIN_BALANCE,
        });

        const signature = await provider.connection.requestAirdrop(publicKey, TOP_UP_AMOUNT);
        const latestBlockhash = await provider.connection.getLatestBlockhash();
        await provider.connection.confirmTransaction(
          {
            signature,
            ...latestBlockhash,
          },
          "confirmed"
        );

        const newBalance = await provider.connection.getBalance(publicKey);
        console.log("✅ Airdrop concluído", { newBalance });
      } catch (error) {
        console.warn("⚠️ Não foi possível completar o airdrop automático:", (error as Error).message);
      } finally {
        this.walletFundingPromise = null;
      }
    })();

    return this.walletFundingPromise;
  }

  private async fetchLocalIdl(idlFile: string): Promise<Idl> {
    // Add cache buster to force fresh IDL load
    const cacheBuster = Date.now();
    const response = await fetch(`${LOCAL_IDL_BASE_PATH}/${idlFile}.json?v=${cacheBuster}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao buscar IDL local (${idlFile}.json): HTTP ${response.status}`);
    }

    const idl = (await response.json()) as Idl;
    console.log(`📄 Loaded IDL for ${idlFile}:`, {
      instructions: idl.instructions?.length || 0,
      instructionNames: idl.instructions?.map(i => i.name) || []
    });
    return idl;
  }

  public setProvider(provider: anchor.AnchorProvider) {
    console.log("🔧 Setting provider with wallet:", provider.wallet.publicKey.toString());
    this.provider = provider;
    // Não usar anchor.setProvider() - causa problemas com o publicKey
  }

  public async loadPrograms() {
    if (!this.provider) {
      throw new Error("Provider not set. Call setProvider() first.");
    }

    const provider = this.provider as anchor.AnchorProvider;
    const currentWalletPubkey = provider.wallet?.publicKey?.toString() || null;

    // Invalidate cache if wallet has changed
    if (this.programs && this.cachedWalletPubkey !== currentWalletPubkey) {
      console.log("🔄 Wallet mudou, invalidando cache de programas", {
        antigo: this.cachedWalletPubkey,
        novo: currentWalletPubkey,
      });
      this.programs = null;
      this.cachedWalletPubkey = null;
    }

    // Check if srwaController has the required method, if not force reload
    if (this.programs?.srwaController) {
      const hasRequiredMethod = this.programs.srwaController.methods?.initializeExtraAccountMetaList;
      if (!hasRequiredMethod) {
        console.warn("⚠️ srwaController IDL está desatualizado, forçando reload");
        this.programs = null;
        this.cachedWalletPubkey = null;
      }
    }

    if (this.programs) {
      console.log("✅ Programas já carregados, retornando cache", {
        wallet: currentWalletPubkey,
      });
      return this.programs;
    }

    try {
      await this.ensureWalletFunded(provider);

      const endpoint = provider.connection.rpcEndpoint || "";
      const isDevnet = endpoint.includes("devnet");

      console.log("🔄 Carregando programas...", {
        endpoint,
        isDevnet,
        strategy: isDevnet ? 'local IDL only (devnet)' : 'blockchain first, then local fallback'
      });

      // Criar programas carregando IDL da blockchain (mesma abordagem do CLI que funciona)
      this.programs = {};

      const programConfigs: ProgramConfig[] = [
        { name: 'srwaFactory', programId: PROGRAM_IDS.srwaFactory, required: true, idlFile: 'srwa_factory' },
        { name: 'srwaController', programId: PROGRAM_IDS.srwaController, required: true, idlFile: 'srwa_controller' },
        { name: 'identityClaims', programId: PROGRAM_IDS.identityClaims, required: true, idlFile: 'identity_claims' },
        { name: 'complianceModules', programId: PROGRAM_IDS.complianceModules, required: true, idlFile: 'compliance_modules' },
        { name: 'offeringPool', programId: PROGRAM_IDS.offeringPool, required: true, idlFile: 'offering_pool' },
        { name: 'yieldAdapter', programId: PROGRAM_IDS.yieldAdapter, required: true, idlFile: 'yield_adapter' },
        { name: 'valuationOracle', programId: PROGRAM_IDS.valuationOracle, required: true, idlFile: 'valuation_oracle' },
        { name: 'cashflowEngine', programId: PROGRAM_IDS.cashflowEngine, required: true, idlFile: 'cashflow_engine' },
        { name: 'purchaseOrder', programId: PROGRAM_IDS.purchaseOrder, required: false, idlFile: 'purchase_order' },
      ];

      for (const config of programConfigs) {
        if (!config.programId) {
          console.error(`❌ Program ID ausente para ${config.name}`);
          continue;
        }

        const programIdPubkey = new PublicKey(config.programId);
        let program: anchor.Program | null = null;
        let loadSource: 'chain' | 'local' = 'local';

        // Se estiver em devnet, pular direto para IDL local (programas não estão deployados na devnet)
        if (isDevnet) {
          console.log(`🔧 Carregando ${config.name} via IDL local (devnet mode)...`);
          try {
            const localIdl = await this.fetchLocalIdl(config.idlFile);
            // Override the address field in the IDL with the correct program ID
            const correctedIdl = { ...localIdl, address: config.programId };
            program = new anchor.Program(correctedIdl, provider);
            loadSource = 'local';
            console.log(`✅ ${config.name} carregado com sucesso via IDL local com program ID: ${config.programId}`);
          } catch (localError: any) {
            console.error(`❌ Erro ao carregar ${config.name} via IDL local:`, localError.message);

            if (config.required) {
              throw new Error(`Falha ao carregar o programa obrigatório ${config.name}: ${localError.message}`);
            }

            console.warn(`⚠️ Programa ${config.name} marcado como opcional - continuando.`);
          }
        } else {
          // Para localhost, tentar carregar da blockchain primeiro
          console.log(`🔧 Carregando ${config.name} da blockchain (localhost)...`);

          try {
            program = await anchor.Program.at(programIdPubkey, provider);
            loadSource = 'chain';
          } catch (programError: any) {
            console.warn(`⚠️ Falha ao carregar IDL on-chain para ${config.name}:`, programError.message);

            try {
              const fallbackIdl = await this.fetchLocalIdl(config.idlFile);
              // Override the address field in the IDL with the correct program ID
              const correctedIdl = { ...fallbackIdl, address: config.programId };
              program = new anchor.Program(correctedIdl, provider);
              loadSource = 'local';
              console.log(`🧩 ${config.name} carregado usando IDL local (fallback) com program ID: ${config.programId}`);
            } catch (fallbackError: any) {
              console.error(`❌ Erro ao carregar ${config.name} via fallback:`, fallbackError.message);

              if (config.required) {
                throw new Error(`Falha ao carregar o programa obrigatório ${config.name}: ${fallbackError.message}`);
              }

              console.warn(`⚠️ Programa ${config.name} marcado como opcional - continuando.`);
            }
          }
        }

        if (!program) {
          continue;
        }

        const effectiveProgramId = program.programId.toBase58();

        if (effectiveProgramId !== config.programId) {
          console.warn(`⚠️ Program ID carregado (${effectiveProgramId}) difere do configurado (${config.programId}) para ${config.name}`);
        }

        console.log(`✅ ${config.name} carregado com sucesso (${loadSource === 'chain' ? 'IDL on-chain' : 'IDL local'}):`, {
          programId: effectiveProgramId,
          hasIdl: !!program.idl,
          hasCoder: !!program.coder,
          instructionsCount: program.idl?.instructions?.length || 0
        });

        this.programs[config.name] = program;
      }

      const loadedPrograms = Object.keys(this.programs);
      console.log(`✅ Programas carregados com sucesso: ${loadedPrograms.join(', ')}`);
      console.log(`📊 Total de programas carregados: ${loadedPrograms.length}`);

      // Save wallet pubkey to cache
      this.cachedWalletPubkey = currentWalletPubkey;
      console.log(`💾 Cache salvo para wallet: ${currentWalletPubkey}`);

      return this.programs;
    } catch (error) {
      console.error("❌ Erro ao carregar programas:", error);
      console.error("Detalhes do erro:", error);
      throw error;
    }
  }
}

// Instância global do cliente
export const srwaClient = new SRWAClient();

// Exportar connection para uso em outros arquivos
export const connection = srwaClient.connection;

export function getProvider(wallet?: any) {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");

  // Se não há wallet, criar um provider read-only com wallet dummy
  if (!wallet) {
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async () => { throw new Error('Read-only mode: Cannot sign transactions'); },
      signAllTransactions: async () => { throw new Error('Read-only mode: Cannot sign transactions'); },
    };

    console.log("🔧 Creating read-only provider (no wallet connected):", {
      mode: 'read-only',
      rpcEndpoint: RPC_ENDPOINT
    });

    return new anchor.AnchorProvider(connection, dummyWallet as any, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });
  }

  // O wallet do @solana/wallet-adapter-react precisa ser encapsulado corretamente
  // para que o Anchor reconheça a propriedade publicKey
  // CRITICAL FIX: Criar um objeto que garante que publicKey é uma propriedade, não um método
  const walletWrapper = {
    // Garantir que publicKey é uma propriedade acessível
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };

  console.log("🔧 Creating provider with wallet:", {
    publicKey: walletWrapper.publicKey?.toString(),
    hasPublicKey: !!walletWrapper.publicKey,
    publicKeyType: typeof walletWrapper.publicKey,
    rpcEndpoint: RPC_ENDPOINT
  });

  return new anchor.AnchorProvider(connection, walletWrapper as any, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed'
  });
}

export async function loadPrograms(provider: anchor.AnchorProvider) {
  srwaClient.setProvider(provider);
  return await srwaClient.loadPrograms();
}

export type Programs = Awaited<ReturnType<typeof loadPrograms>>;
