import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {  PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { PoolDistribution } from "../target/types/pool_distribution";
import { assert } from "chai";

describe("pool_distribution", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PoolDistribution as Program<PoolDistribution>;

  const admin = provider.wallet;
  const issuer = Keypair.generate();
  const poolVault = Keypair.generate();
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  let configPDA: PublicKey;
  let configBump: number;

  before("Setup", async () => {
    // Derive config PDA
    [configPDA, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("distribution_config"), mint.toBuffer()],
      program.programId
    );

    console.log("\n=== Setup ===");
    console.log("Program ID:", program.programId.toBase58());
    console.log("Admin:", admin.publicKey.toBase58());
    console.log("Issuer:", issuer.publicKey.toBase58());
    console.log("Pool Vault:", poolVault.publicKey.toBase58());
    console.log("Mint:", mint.toBase58());
    console.log("Config PDA:", configPDA.toBase58());

    // Airdrop to issuer
    const airdropSig = await provider.connection.requestAirdrop(
      issuer.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);
  });

  it("Initializes distribution config", async () => {
    const threshold = new BN(100 * anchor.web3.LAMPORTS_PER_SOL); // 100 SOL

    const tx = await program.methods
      .initialize(threshold, issuer.publicKey)
      .accounts({
        authority: admin.publicKey,
        mint,
        poolVault: poolVault.publicKey,
        distributionConfig: configPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Initialize TX:", tx);

    // Fetch config
    const config = await program.account.distributionConfig.fetch(configPDA);

    assert.equal(config.authority.toBase58(), admin.publicKey.toBase58());
    assert.equal(config.mint.toBase58(), mint.toBase58());
    assert.equal(config.poolVault.toBase58(), poolVault.publicKey.toBase58());
    assert.equal(config.issuer.toBase58(), issuer.publicKey.toBase58());
    assert.equal(config.threshold.toString(), threshold.toString());
    assert.equal(config.distributionCount.toNumber(), 0);
    assert.equal(config.totalDistributed.toNumber(), 0);

    console.log("Config:", {
      threshold: `${config.threshold.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`,
      issuer: config.issuer.toBase58(),
      distributionCount: config.distributionCount.toNumber(),
    });
  });

  it("Fails to distribute when threshold not met", async () => {
    try {
      await program.methods
        .distributeToIssuer()
        .accounts({
          caller: admin.publicKey,
          distributionConfig: configPDA,
          poolVault: poolVault.publicKey,
          issuer: issuer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([poolVault])
        .rpc();

      assert.fail("Should have failed - pool vault is empty");
    } catch (error: any) {
      console.log("\n✅ Expected error:", error.message || error);
      assert.ok(error, "Error should be thrown");
    }
  });

  it("Distributes to issuer when threshold is met", async () => {
    // Fund pool vault with 150 SOL (more than threshold of 100 SOL)
    const fundAmount = 150 * anchor.web3.LAMPORTS_PER_SOL;

    const fundTx = await provider.connection.requestAirdrop(
      poolVault.publicKey,
      fundAmount
    );
    await provider.connection.confirmTransaction(fundTx);

    console.log("\n💰 Pool vault funded with 150 SOL");

    // Check issuer balance before
    const issuerBalanceBefore = await provider.connection.getBalance(issuer.publicKey);
    console.log(`Issuer balance before: ${issuerBalanceBefore / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    // Distribute (poolVault must sign)
    const tx = await program.methods
      .distributeToIssuer()
      .accounts({
        caller: admin.publicKey,
        distributionConfig: configPDA,
        poolVault: poolVault.publicKey,
        issuer: issuer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([poolVault])
      .rpc();

    console.log("✅ Distribute TX:", tx);

    // Check balances after
    const issuerBalanceAfter = await provider.connection.getBalance(issuer.publicKey);
    const poolVaultBalanceAfter = await provider.connection.getBalance(poolVault.publicKey);

    console.log(`Issuer balance after: ${issuerBalanceAfter / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    console.log(`Pool vault balance after: ${poolVaultBalanceAfter / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    // Verify distribution
    const config = await program.account.distributionConfig.fetch(configPDA);

    assert.equal(config.distributionCount.toNumber(), 1);
    assert.equal(config.totalDistributed.toNumber(), fundAmount);
    assert.equal(poolVaultBalanceAfter, 0); // All SOL transferred
    assert.equal(issuerBalanceAfter, issuerBalanceBefore + fundAmount);

    console.log("Distribution stats:", {
      count: config.distributionCount.toNumber(),
      totalDistributed: `${config.totalDistributed.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`,
    });
  });

  it("Updates threshold", async () => {
    const newThreshold = new BN(200 * anchor.web3.LAMPORTS_PER_SOL); // 200 SOL

    const tx = await program.methods
      .updateThreshold(newThreshold)
      .accounts({
        authority: admin.publicKey,
        distributionConfig: configPDA,
      })
      .rpc();

    console.log("\n✅ Update threshold TX:", tx);

    const config = await program.account.distributionConfig.fetch(configPDA);
    assert.equal(config.threshold.toString(), newThreshold.toString());

    console.log(`New threshold: ${config.threshold.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  });

  it("Updates issuer", async () => {
    const newIssuer = Keypair.generate();

    const tx = await program.methods
      .updateIssuer(newIssuer.publicKey)
      .accounts({
        authority: admin.publicKey,
        distributionConfig: configPDA,
      })
      .rpc();

    console.log("\n✅ Update issuer TX:", tx);

    const config = await program.account.distributionConfig.fetch(configPDA);
    assert.equal(config.issuer.toBase58(), newIssuer.publicKey.toBase58());

    console.log("New issuer:", config.issuer.toBase58());
  });
});
