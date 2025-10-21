import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export interface KYCProviderInfo {
  providerPubkey: PublicKey;
  name: string;
  metadataUri: string;
  active: boolean;
  addedAt: number;
}

export interface IssuerKYCConfig {
  mint: PublicKey;
  issuer: PublicKey;
  approvedProviders: PublicKey[];
  requiredClaimTopics: number[];
  requireKyc: boolean;
}

export interface KYCProviderService {
  initializeKYCRegistry(): Promise<string>;
  addKYCProvider(
    providerPubkey: PublicKey,
    name: string,
    metadataUri: string
  ): Promise<string>;
  getKYCProviders(): Promise<KYCProviderInfo[]>;
  configureIssuerKYC(
    mint: PublicKey,
    approvedProviders: PublicKey[],
    requiredClaimTopics: number[],
    requireKyc: boolean
  ): Promise<string>;
  getIssuerKYCConfig(mint: PublicKey): Promise<IssuerKYCConfig | null>;
  verifyInvestorKYC(mint: PublicKey): Promise<boolean>;
}

export class KYCProviderServiceImpl implements KYCProviderService {
  constructor(
    private program: Program,
    private provider: AnchorProvider
  ) {}

  async initializeKYCRegistry(): Promise<string> {
    const [kycRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("kyc_registry")],
      this.program.programId
    );

    const tx = await this.program.methods
      .initializeKycRegistry()
      .accounts({
        authority: this.provider.wallet.publicKey,
        kycRegistry,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async addKYCProvider(
    providerPubkey: PublicKey,
    name: string,
    metadataUri: string
  ): Promise<string> {
    const [kycRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("kyc_registry")],
      this.program.programId
    );

    const tx = await this.program.methods
      .addKycProvider(providerPubkey, name, metadataUri)
      .accounts({
        authority: this.provider.wallet.publicKey,
        kycRegistry,
      })
      .rpc();

    return tx;
  }

  async getKYCProviders(): Promise<KYCProviderInfo[]> {
    const [kycRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("kyc_registry")],
      this.program.programId
    );

    try {
      const accountInfo = await this.provider.connection.getAccountInfo(kycRegistry);

      if (!accountInfo) {
        return [];
      }

      const account = this.program.coder.accounts.decode(
        "KYCProviderRegistry",
        accountInfo.data
      );

      return account.providers as KYCProviderInfo[];
    } catch (error) {
      console.error("KYC registry not initialized:", error);
      return [];
    }
  }

  async configureIssuerKYC(
    mint: PublicKey,
    approvedProviders: PublicKey[],
    requiredClaimTopics: number[],
    requireKyc: boolean
  ): Promise<string> {
    const [kycRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from("kyc_registry")],
      this.program.programId
    );

    const [issuerKycConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("issuer_kyc"), mint.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .configureIssuerKyc(
        mint,
        approvedProviders,
        requiredClaimTopics,
        requireKyc
      )
      .accounts({
        issuer: this.provider.wallet.publicKey,
        kycRegistry,
        issuerKycConfig,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async getIssuerKYCConfig(mint: PublicKey): Promise<IssuerKYCConfig | null> {
    const [issuerKycConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("issuer_kyc"), mint.toBuffer()],
      this.program.programId
    );

    try {
      const accountInfo = await this.provider.connection.getAccountInfo(issuerKycConfig);

      if (!accountInfo) {
        return null;
      }

      const account = this.program.coder.accounts.decode(
        "IssuerKYCConfig",
        accountInfo.data
      );

      return account as IssuerKYCConfig;
    } catch (error) {
      console.error("Issuer KYC config not found:", error);
      return null;
    }
  }

  async verifyInvestorKYC(mint: PublicKey): Promise<boolean> {
    const [issuerKycConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("issuer_kyc"), mint.toBuffer()],
      this.program.programId
    );

    // TODO: Get identity claims program and investor identity account
    const identityClaimsProgram = new PublicKey(
      "Hr4S5caMKqLZFPRuJXu4rCktC9UfR3VxEDkU9JiQiCzv"
    );

    // Placeholder for investor identity - should be derived from investor wallet
    const [investorIdentity] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("identity"),
        this.provider.wallet.publicKey.toBuffer(),
      ],
      identityClaimsProgram
    );

    try {
      const result = await this.program.methods
        .verifyInvestorKyc(mint)
        .accounts({
          investor: this.provider.wallet.publicKey,
          issuerKycConfig,
          investorIdentity,
          identityClaimsProgram,
        })
        .view();

      return result as boolean;
    } catch (error) {
      console.error("Error verifying investor KYC:", error);
      return false;
    }
  }
}
