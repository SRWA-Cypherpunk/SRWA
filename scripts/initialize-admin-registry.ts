/**
 * Script para inicializar Admin Registry após deploy
 *
 * Usage:
 *   ts-node scripts/initialize-admin-registry.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SrwaFactory } from "../target/types/srwa_factory";
import { PublicKey } from "@solana/web3.js";

async function main() {
  // Setup provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SrwaFactory as Program<SrwaFactory>;

  console.log("🚀 Initializing Admin Registry...");
  console.log("Program ID:", program.programId.toBase58());
  console.log("Super Admin:", provider.wallet.publicKey.toBase58());
  console.log("");

  // Calculate Admin Registry PDA
  const [adminRegistryPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("admin_registry")],
    program.programId
  );

  console.log("Admin Registry PDA:", adminRegistryPda.toBase58());
  console.log("Bump:", bump);
  console.log("");

  // Step 1: Initialize Admin Registry
  try {
    console.log("📝 Step 1: Initializing Admin Registry...");
    const tx = await program.methods
      .initializeAdminRegistry()
      .accountsPartial({
        superAdmin: provider.wallet.publicKey,
      })
      .rpc();

    console.log("✅ Admin Registry initialized!");
    console.log("Transaction:", tx);
    console.log("");
  } catch (err: any) {
    if (err.message?.includes("already in use")) {
      console.log("ℹ️  Admin Registry already exists");
      console.log("");
    } else {
      console.error("❌ Failed to initialize Admin Registry:", err.message);
      throw err;
    }
  }

  // Step 2: Add Super Admin to allowlist
  try {
    console.log("📝 Step 2: Adding Super Admin to platform admins...");
    const tx = await program.methods
      .addPlatformAdmin(provider.wallet.publicKey)
      .accountsPartial({
        superAdmin: provider.wallet.publicKey,
      })
      .rpc();

    console.log("✅ Super Admin added to platform admins!");
    console.log("Transaction:", tx);
    console.log("");
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("ℹ️  Super Admin already in allowlist");
      console.log("");
    } else {
      console.error("❌ Failed to add Super Admin:", err.message);
      // Don't throw - this is not critical
    }
  }

  // Step 3: Fetch and display Admin Registry state
  console.log("📊 Admin Registry State:");
  const registry = await program.account.platformAdminRegistry.fetch(
    adminRegistryPda
  );

  console.log("  Super Admin:", registry.superAdmin.toBase58());
  console.log("  Authorized Admins:", registry.authorizedAdmins.length);
  registry.authorizedAdmins.forEach((admin, i) => {
    console.log(`    ${i + 1}. ${admin.toBase58()}`);
  });
  console.log("");

  console.log("🎉 Initialization complete!");
  console.log("");
  console.log("Next steps:");
  console.log("  1. Add more platform admins (if needed):");
  console.log(`     anchor run add-admin -- <ADMIN_PUBKEY>`);
  console.log("");
  console.log("  2. Create your first SRWA token:");
  console.log("     Use the frontend wizard or run tests");
  console.log("");
}

main()
  .then(() => {
    console.log("✅ Success!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
