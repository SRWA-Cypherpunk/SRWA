import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "fs";

async function main() {
  console.log("🚀 Starting Simple SRWA Token Creation Test...\n");

  // Setup connection
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // Load wallet
  const keypairPath = process.env.HOME + "/.config/solana/temp-keypair.json";
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
  const walletKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

  console.log("📍 Wallet:", walletKeypair.publicKey.toBase58());

  // Setup provider
  const wallet = new Wallet(walletKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Load program using Anchor's Program.at() which fetches IDL from chain
  const programId = new PublicKey("G2TVaEY5pxLZbdBUq28Q7ZPGxQaxTxZzaSRTAEMh3z2A");

  console.log("📦 Loading program from chain...");
  const program = await Program.at(programId, provider);

  console.log("📋 Program loaded successfully\n");

  // Generate new mint keypair
  const mint = Keypair.generate();
  console.log("🔑 Mint:", mint.publicKey.toBase58());

  // Derive PDAs
  const [srwaConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("srwa_config"), mint.publicKey.toBuffer()],
    programId
  );

  const [offeringState] = PublicKey.findProgramAddressSync(
    [Buffer.from("offering"), mint.publicKey.toBuffer()],
    programId
  );

  const [valuationData] = PublicKey.findProgramAddressSync(
    [Buffer.from("valuation"), mint.publicKey.toBuffer()],
    programId
  );

  console.log("📍 SRWA Config PDA:", srwaConfig.toBase58());
  console.log("📍 Offering State PDA:", offeringState.toBase58());
  console.log("📍 Valuation Data PDA:", valuationData.toBase58());
  console.log();

  // Prepare config init
  const configInit = {
    roles: {
      issuerAdmin: walletKeypair.publicKey,
      complianceOfficer: walletKeypair.publicKey,
      transferAgent: walletKeypair.publicKey,
    },
    requiredTopics: [1],
    metadataUri: "https://example.com/metadata.json",
    defaultFrozen: false,
    permanentDelegate: walletKeypair.publicKey,
  };

  // Prepare offering init with BN for i64/u64 fields
  const now = Math.floor(Date.now() / 1000);
  const offeringInit = {
    window: {
      startTs: new anchor.BN(now),
      endTs: new anchor.BN(now + 30 * 24 * 60 * 60),
    },
    target: {
      softCap: new anchor.BN(100000),
      hardCap: new anchor.BN(1000000),
    },
    pricing: {
      model: { fixed: {} },
      unitPrice: new anchor.BN(100),
      currency: { usd: {} },
    },
    rules: {
      minTicket: new anchor.BN(100),
      perInvestorCap: new anchor.BN(100000),
      maxInvestors: 1000,
      eligibility: {
        jurisdictionsAllow: [],
        investorTypes: [{ accredited: {} }],
      },
    },
    oversubPolicy: { proRata: {} },
    feesBps: {
      originationBps: 100,
      platformBps: 50,
      successBps: 200,
    },
    issuerTreasury: walletKeypair.publicKey,
    feeTreasury: walletKeypair.publicKey,
  };

  try {
    console.log("🔄 Sending transaction...\n");

    const tx = await program.methods
      .createSrwa(configInit, offeringInit)
      .accounts({
        issuer: walletKeypair.publicKey,
        mint: mint.publicKey,
        srwaConfig: srwaConfig,
        offeringState: offeringState,
        valuationData: valuationData,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Transaction successful!");
    console.log("📝 Signature:", tx);
    console.log("\n🎉 SRWA Token created successfully!");
    console.log("🔑 Mint Address:", mint.publicKey.toBase58());
  } catch (error: any) {
    console.error("❌ Error creating SRWA token:");
    console.error(error);

    if (error.logs) {
      console.log("\n📋 Program Logs:");
      error.logs.forEach((log: string) => console.log(log));
    }

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
