/**
 * Script para adicionar um Platform Admin ao registry
 *
 * Usage:
 *   ts-node scripts/add-admin.ts <ADMIN_WALLET_ADDRESS>
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

  console.log("🔧 Adding Platform Admin...");
  console.log("Program ID:", program.programId.toBase58());
  console.log("Super Admin (current wallet):", provider.wallet.publicKey.toBase58());
  console.log("");

  // Get admin address from command line or use default
  const adminAddress = process.argv[2] || "8PVnHCHipXPmjr8eTdQHpS5AW31XDzMtC82XPAojG246";

  let newAdmin: PublicKey;
  try {
    newAdmin = new PublicKey(adminAddress);
  } catch (err) {
    console.error("❌ Invalid wallet address:", adminAddress);
    process.exit(1);
  }

  console.log("New Platform Admin:", newAdmin.toBase58());
  console.log("");

  // Calculate Admin Registry PDA
  const [adminRegistryPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("admin_registry")],
    program.programId
  );

  console.log("Admin Registry PDA:", adminRegistryPda.toBase58());
  console.log("");

  // Check if Admin Registry exists
  try {
    const registry = await program.account.platformAdminRegistry.fetch(adminRegistryPda);
    console.log("📊 Current Admin Registry State:");
    console.log("  Super Admin:", registry.superAdmin.toBase58());
    console.log("  Authorized Admins:", registry.authorizedAdmins.length);
    registry.authorizedAdmins.forEach((admin, i) => {
      console.log(`    ${i + 1}. ${admin.toBase58()}`);
    });
    console.log("");

    // Check if admin already exists
    if (registry.authorizedAdmins.some(admin => admin.equals(newAdmin))) {
      console.log("⚠️  Admin already exists in the registry!");
      console.log("");
      process.exit(0);
    }

    // Verify current wallet is super admin
    if (!registry.superAdmin.equals(provider.wallet.publicKey)) {
      console.error("❌ Error: Current wallet is not the super admin");
      console.error("   Super Admin:", registry.superAdmin.toBase58());
      console.error("   Your wallet:", provider.wallet.publicKey.toBase58());
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Admin Registry not found. Please run initialize-admin-registry.ts first");
    process.exit(1);
  }

  // Add platform admin
  console.log("📝 Adding admin to registry...");
  try {
    const tx = await program.methods
      .addPlatformAdmin(newAdmin)
      .accountsPartial({
        superAdmin: provider.wallet.publicKey,
      })
      .rpc();

    console.log("✅ Admin added successfully!");
    console.log("Transaction:", tx);
    console.log("");
  } catch (err: any) {
    console.error("❌ Failed to add admin:", err.message);
    if (err.logs) {
      console.error("Logs:", err.logs);
    }
    throw err;
  }

  // Fetch and display updated state
  console.log("📊 Updated Admin Registry State:");
  const registry = await program.account.platformAdminRegistry.fetch(adminRegistryPda);
  console.log("  Super Admin:", registry.superAdmin.toBase58());
  console.log("  Authorized Admins:", registry.authorizedAdmins.length);
  registry.authorizedAdmins.forEach((admin, i) => {
    const isNew = admin.equals(newAdmin);
    console.log(`    ${i + 1}. ${admin.toBase58()} ${isNew ? "← NEW" : ""}`);
  });
  console.log("");

  console.log("🎉 Success! Admin can now:");
  console.log("  1. Login to frontend with this wallet");
  console.log("  2. Access Admin dashboard");
  console.log("  3. Approve SRWA token requests");
  console.log("");
  console.log("Frontend Admin Address:", newAdmin.toBase58());
  console.log("");
}

main()
  .then(() => {
    console.log("✅ Complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
