import * as anchor from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Program IDs (deployed on localhost)
export const PROGRAM_IDS = {
  srwaFactory: "G2TVaEY5pxLZbdBUq28Q7ZPGxQaxTxZzaSRTAEMh3z2A",
  srwaController: "csSqPv1tnopH9XkRuCakGjkunz5aKECfYBU1SwrZbFR",
  identityClaims: "Hr4S5caMKqLZFPRuJXu4rCktC9UfR3VxEDkU9JiQiCzv",
  complianceModules: "Gz7tDtXsPtAKVhNQEky5kybzguEcwUoyzWKYFDUr6D75",
  offeringPool: "GShjrSQhcZJLP2xRGAvpoLyU2ndZN1k8A8fwPPqxm73W",
  yieldAdapter: "8xBNucLz1R72p8TMCzXGH1W1L65E9jHPKEXwSwC1jCot",
  valuationOracle: "B9vVuDnzj5RE7HpSJ9am7Ld1iP2D8V7eVgzsej7kppPz",
  cashflowEngine: "85UaZex7aRX647Dn3N8kYNxZNbZcHxB97nwGnkfD5JfQ",
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

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, "confirmed");
    this.provider = null;
    this.programs = null;
    this.walletFundingPromise = null;
  }

  private async ensureWalletFunded(provider: anchor.AnchorProvider) {
    if (this.walletFundingPromise) {
      return this.walletFundingPromise;
    }

    const publicKey = provider.wallet?.publicKey;
    if (!publicKey) {
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
    const response = await fetch(`${LOCAL_IDL_BASE_PATH}/${idlFile}.json`);

    if (!response.ok) {
      throw new Error(`Falha ao buscar IDL local (${idlFile}.json): HTTP ${response.status}`);
    }

    return (await response.json()) as Idl;
  }

  public setProvider(provider: anchor.AnchorProvider) {
    console.log("🔧 Setting provider with wallet:", provider.wallet.publicKey.toString());
    this.provider = provider;
    // Não usar anchor.setProvider() - causa problemas com o publicKey
  }

  public async loadPrograms() {
    if (this.programs) {
      return this.programs;
    }

    if (!this.provider) {
      throw new Error("Provider not set. Call setProvider() first.");
    }

    const provider = this.provider as anchor.AnchorProvider;

    try {
      await this.ensureWalletFunded(provider);

      console.log("🔄 Carregando programas diretamente da blockchain (como CLI)...");

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
      ];

      for (const config of programConfigs) {
        console.log(`🔧 Carregando programa ${config.name} da blockchain...`);

        if (!config.programId) {
          console.error(`❌ Program ID ausente para ${config.name}`);
          continue;
        }

        const programIdPubkey = new PublicKey(config.programId);
        let program: anchor.Program | null = null;
        let loadSource: 'chain' | 'local' = 'chain';

        try {
          // Usar Program.at() para carregar IDL da blockchain (mesma abordagem do CLI)
          program = await anchor.Program.at(programIdPubkey, provider);
        } catch (programError: any) {
          console.warn(`⚠️ Falha ao carregar IDL on-chain para ${config.name}:`, programError.message);

          try {
            const fallbackIdl = await this.fetchLocalIdl(config.idlFile);

            if (fallbackIdl.address && fallbackIdl.address !== config.programId) {
              console.warn(`⚠️ IDL local para ${config.name} possui address ${fallbackIdl.address}, diferente do esperado ${config.programId}`);
            }

            program = new anchor.Program(fallbackIdl, provider);
            loadSource = 'local';
            console.log(`🧩 ${config.name} carregado usando IDL local (${config.idlFile}.json)`);
          } catch (fallbackError: any) {
            console.error(`❌ Erro ao carregar programa ${config.name} via fallback local:`, fallbackError.message);

            if (config.required) {
              throw new Error(`Falha ao carregar o programa obrigatório ${config.name}: ${fallbackError.message}`);
            }

            console.warn(`⚠️ Programa ${config.name} marcado como opcional - continuando mesmo com erro.`);
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

export function getProvider(wallet: any) {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");

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
