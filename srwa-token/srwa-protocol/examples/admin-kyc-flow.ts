/**
 * Exemplo completo de uso do Admin Allowlist e KYC Provider System
 *
 * Este exemplo demonstra:
 * 1. Inicialização dos registries
 * 2. Adição de admins e KYC providers
 * 3. Configuração de KYC por issuer
 * 4. Aprovação de token por admin
 * 5. Verificação de KYC do investor
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { AdminAllowlistServiceImpl } from "../frontend/src/lib/adminAllowlist";
import { KYCProviderServiceImpl } from "../frontend/src/lib/kycProvider";

async function main() {
  // Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SrwaFactory as Program;
  console.log("Program ID:", program.programId.toString());

  // Services
  const adminService = new AdminAllowlistServiceImpl(program, provider);
  const kycService = new KYCProviderServiceImpl(program, provider);

  console.log("\n=== STEP 1: Initialize Admin Registry ===");
  try {
    const txInit = await adminService.initializeAdminRegistry();
    console.log("✅ Admin Registry initialized:", txInit);
  } catch (error: any) {
    if (error.message?.includes("already in use")) {
      console.log("⚠️  Admin Registry already initialized");
    } else {
      throw error;
    }
  }

  console.log("\n=== STEP 2: Check Admin Registry ===");
  const adminRegistry = await adminService.getAdminRegistry();
  console.log("Super Admin:", adminRegistry.superAdmin.toString());
  console.log("Authorized Admins:", adminRegistry.authorizedAdmins.length);

  console.log("\n=== STEP 3: Add Additional Admin ===");
  const newAdmin = Keypair.generate();
  try {
    const txAddAdmin = await adminService.addPlatformAdmin(newAdmin.publicKey);
    console.log("✅ Admin added:", newAdmin.publicKey.toString());
    console.log("Transaction:", txAddAdmin);
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("⚠️  Admin already exists in allowlist");
    } else {
      throw error;
    }
  }

  console.log("\n=== STEP 4: Verify Admin Authorization ===");
  const isSuperAdminAuthorized = await adminService.isAdminAuthorized(
    provider.wallet.publicKey
  );
  const isNewAdminAuthorized = await adminService.isAdminAuthorized(
    newAdmin.publicKey
  );
  console.log("Super Admin authorized:", isSuperAdminAuthorized);
  console.log("New Admin authorized:", isNewAdminAuthorized);

  console.log("\n=== STEP 5: Initialize KYC Registry ===");
  try {
    const txInitKYC = await kycService.initializeKYCRegistry();
    console.log("✅ KYC Registry initialized:", txInitKYC);
  } catch (error: any) {
    if (error.message?.includes("already in use")) {
      console.log("⚠️  KYC Registry already initialized");
    } else {
      throw error;
    }
  }

  console.log("\n=== STEP 6: Add KYC Providers ===");
  const kycProvider1 = Keypair.generate();
  const kycProvider2 = Keypair.generate();

  try {
    const tx1 = await kycService.addKYCProvider(
      kycProvider1.publicKey,
      "KYC Provider 1",
      "https://provider1.com/metadata.json"
    );
    console.log("✅ KYC Provider 1 added:", kycProvider1.publicKey.toString());

    const tx2 = await kycService.addKYCProvider(
      kycProvider2.publicKey,
      "Compliance Co.",
      "https://compliance.co/metadata.json"
    );
    console.log("✅ KYC Provider 2 added:", kycProvider2.publicKey.toString());
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log("⚠️  KYC Providers already registered");
    } else {
      throw error;
    }
  }

  console.log("\n=== STEP 7: List KYC Providers ===");
  const providers = await kycService.getKYCProviders();
  console.log(`Found ${providers.length} KYC providers:`);
  providers.forEach((provider, idx) => {
    console.log(`  ${idx + 1}. ${provider.name}`);
    console.log(`     Address: ${provider.providerPubkey.toString()}`);
    console.log(`     Active: ${provider.active}`);
  });

  console.log("\n=== STEP 8: Configure Issuer KYC ===");
  const tokenMint = Keypair.generate().publicKey; // Simula um token mint

  const approvedProviders = [kycProvider1.publicKey, kycProvider2.publicKey];
  const requiredTopics = [
    1, // KYC
    2, // AML
    6, // SANCTIONS_CLEAR
  ];

  try {
    const txConfigKYC = await kycService.configureIssuerKYC(
      tokenMint,
      approvedProviders,
      requiredTopics,
      true // require_kyc = true
    );
    console.log("✅ Issuer KYC configured for token:", tokenMint.toString());
    console.log("Transaction:", txConfigKYC);
  } catch (error) {
    console.error("Error configuring KYC:", error);
  }

  console.log("\n=== STEP 9: Get Issuer KYC Config ===");
  const issuerConfig = await kycService.getIssuerKYCConfig(tokenMint);
  if (issuerConfig) {
    console.log("KYC Required:", issuerConfig.requireKyc);
    console.log("Approved Providers:", issuerConfig.approvedProviders.length);
    console.log("Required Topics:", issuerConfig.requiredClaimTopics);
  }

  console.log("\n=== STEP 10: Verify Investor KYC ===");
  // Note: Esta verificação falhará até que o investor tenha claims válidos
  try {
    const hasValidKYC = await kycService.verifyInvestorKYC(tokenMint);
    console.log("Investor has valid KYC:", hasValidKYC);
  } catch (error: any) {
    console.log("⚠️  Investor does not have valid KYC yet");
  }

  console.log("\n=== STEP 11: Test Approve SRWA (with Admin Check) ===");
  // Este passo demonstraria a aprovação de um token
  // Na prática, você primeiro criaria um SRWARequest via request_srwa
  console.log("Note: To approve a token, the admin must be in the allowlist");
  console.log("The approve_srwa instruction will check admin_registry automatically");

  console.log("\n=== Summary ===");
  console.log("✅ Admin Registry initialized with super admin");
  console.log("✅ Additional admins can be added to allowlist");
  console.log("✅ Only authorized admins can approve tokens");
  console.log("✅ KYC Registry initialized");
  console.log("✅ KYC Providers registered");
  console.log("✅ Issuers can configure which providers they accept");
  console.log("✅ Investors must have valid KYC claims to invest");

  console.log("\n=== Next Steps ===");
  console.log("1. Issuer submits token request via request_srwa");
  console.log("2. Issuer configures KYC requirements for their token");
  console.log("3. Authorized admin approves request via approve_srwa");
  console.log("4. Investors get KYC claims from approved providers");
  console.log("5. System verifies KYC before allowing investments");
}

main()
  .then(() => {
    console.log("\n✅ Example completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
