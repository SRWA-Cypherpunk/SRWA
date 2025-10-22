import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import fs from "fs";

// Load IDL
const idl = JSON.parse(
  fs.readFileSync("./target/idl/srwa_factory.json", "utf-8")
);

async function main() {
  console.log("🚀 Starting SRWA Token Creation Test...\n");

  // Setup connection
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // Load wallet from filesystem
  const keypairPath = process.env.HOME + "/.config/solana/id.json";
  let walletKeypair: Keypair;

  try {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, "utf-8"));
    walletKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    // Try temp keypair if id.json doesn't exist
    const tempKeypairPath = process.env.HOME + "/.config/solana/temp-keypair.json";
    const keypairData = JSON.parse(fs.readFileSync(tempKeypairPath, "utf-8"));
    walletKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  }

  console.log("📍 Wallet:", walletKeypair.publicKey.toBase58());

  // Check balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log("💰 Balance:", balance / 1e9, "SOL\n");

  // Setup provider
  const wallet = new Wallet(walletKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  // Load program
  const programId = new PublicKey("G2TVaEY5pxLZbdBUq28Q7ZPGxQaxTxZzaSRTAEMh3z2A");
  const program = new Program(idl as any, provider);

  // Debug: Check if types are loaded
  console.log("📊 IDL Types:", Object.keys(idl.types || {}).length);
  console.log("📊 IDL Instructions:", idl.instructions.map((i: any) => i.name));

  console.log("📦 Program ID:", programId.toBase58());
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
      issuer_admin: walletKeypair.publicKey,
      compliance_officer: walletKeypair.publicKey,
      transfer_agent: walletKeypair.publicKey,
    },
    required_topics: [1],
    metadata_uri: "https://example.com/metadata.json",
    default_frozen: false,
    permanent_delegate: walletKeypair.publicKey,
  };

  // Prepare offering init - using simple numbers where possible
  const now = Math.floor(Date.now() / 1000);
  const offeringInit = {
    window: {
      start_ts: now,
      end_ts: now + 30 * 24 * 60 * 60,
    },
    target: {
      soft_cap: 100000,
      hard_cap: 1000000,
    },
    pricing: {
      model: { Fixed: {} },
      unit_price: 100,
      currency: { USD: {} },
    },
    rules: {
      min_ticket: 100,
      per_investor_cap: 100000,
      max_investors: 1000,
      eligibility: {
        jurisdictions_allow: [],
        investor_types: [{ Accredited: {} }],
      },
    },
    oversub_policy: { ProRata: {} },
    fees_bps: {
      origination_bps: 100,
      platform_bps: 50,
      success_bps: 200,
    },
    issuer_treasury: walletKeypair.publicKey,
    fee_treasury: walletKeypair.publicKey,
  };

  console.log("📝 Config Init:", JSON.stringify(configInit, null, 2));
  console.log("\n📝 Offering Init:", JSON.stringify({
    ...offeringInit,
    window: {
      start_ts: offeringInit.window.start_ts.toString(),
      end_ts: offeringInit.window.end_ts.toString(),
    },
    target: {
      soft_cap: offeringInit.target.soft_cap.toString(),
      hard_cap: offeringInit.target.hard_cap.toString(),
    },
    pricing: {
      ...offeringInit.pricing,
      unit_price: offeringInit.pricing.unit_price.toString(),
    },
  }, null, 2));
  console.log();

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
  } catch (error) {
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
