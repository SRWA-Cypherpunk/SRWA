import { useProgramsSafe } from '../contexts/ProgramContext';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export function useAdmin() {
  const { programs } = useProgramsSafe();
  const wallet = useAnchorWallet();

  // Compliance Modules Management
  const addJurisdictionRule = async (
    mint: PublicKey,
    countryCode: number,
    allowed: boolean
  ) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.complianceModules) throw new Error('Compliance Modules program not loaded');

    const [jurisdictionModule] = PublicKey.findProgramAddressSync(
      [Buffer.from('jurisdiction'), mint.toBuffer()],
      programs.complianceModules.programId
    );

    const tx = await programs.complianceModules.methods
      .setJurisdiction(countryCode, allowed)
      .accounts({
        authority: wallet.publicKey,
        jurisdictionModule,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  const setMaxHolders = async (mint: PublicKey, maxHolders: BN) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.complianceModules) throw new Error('Compliance Modules program not loaded');

    const [maxHoldersModule] = PublicKey.findProgramAddressSync(
      [Buffer.from('max_holders'), mint.toBuffer()],
      programs.complianceModules.programId
    );

    const tx = await programs.complianceModules.methods
      .setMaxHolders(maxHolders)
      .accounts({
        authority: wallet.publicKey,
        maxHoldersModule,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  const setLockup = async (
    mint: PublicKey,
    investor: PublicKey,
    unlockTime: BN
  ) => {
    if (!wallet) throw new Error('Wallet not connected');

    const [lockupModule] = PublicKey.findProgramAddressSync(
      [Buffer.from('lockup'), mint.toBuffer(), investor.toBuffer()],
      programs.complianceModules.programId
    );

    const tx = await programs.complianceModules.methods
      .setLockup(investor, unlockTime)
      .accounts({
        authority: wallet.publicKey,
        lockupModule,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  const pauseToken = async (mint: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');

    const [pauseModule] = PublicKey.findProgramAddressSync(
      [Buffer.from('pause'), mint.toBuffer()],
      programs.complianceModules.programId
    );

    const tx = await programs.complianceModules.methods
      .pause()
      .accounts({
        authority: wallet.publicKey,
        pauseModule,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  const unpauseToken = async (mint: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');

    const [pauseModule] = PublicKey.findProgramAddressSync(
      [Buffer.from('pause'), mint.toBuffer()],
      programs.complianceModules.programId
    );

    const tx = await programs.complianceModules.methods
      .unpause()
      .accounts({
        authority: wallet.publicKey,
        pauseModule,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  // Claims Providers Management
  const addTrustedIssuer = async (issuer: PublicKey, claimTopics: BN[]) => {
    if (!wallet) throw new Error('Wallet not connected');

    // This would interact with a trusted issuers registry
    // Implementation depends on your contract structure
    console.log('Adding trusted issuer:', issuer.toBase58(), claimTopics);
  };

  const removeTrustedIssuer = async (issuer: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');

    console.log('Removing trusted issuer:', issuer.toBase58());
  };

  // Oracle Management
  const updatePrice = async (mint: PublicKey, price: BN, confidence: BN) => {
    if (!wallet) throw new Error('Wallet not connected');

    const [oracle] = PublicKey.findProgramAddressSync(
      [Buffer.from('oracle'), mint.toBuffer()],
      programs.valuationOracle.programId
    );

    const tx = await programs.valuationOracle.methods
      .updatePrice(price, confidence)
      .accounts({
        authority: wallet.publicKey,
        oracle,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  // Allowlist Management
  const addToAllowlist = async (mint: PublicKey, investor: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');

    const [srwaMetadata] = PublicKey.findProgramAddressSync(
      [Buffer.from('srwa'), mint.toBuffer()],
      programs.srwaFactory.programId
    );

    const tx = await programs.srwaFactory.methods
      .addToAllowlist(investor)
      .accounts({
        authority: wallet.publicKey,
        srwaMetadata,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  const removeFromAllowlist = async (mint: PublicKey, investor: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');

    const [srwaMetadata] = PublicKey.findProgramAddressSync(
      [Buffer.from('srwa'), mint.toBuffer()],
      programs.srwaFactory.programId
    );

    const tx = await programs.srwaFactory.methods
      .removeFromAllowlist(investor)
      .accounts({
        authority: wallet.publicKey,
        srwaMetadata,
        mint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  return {
    // Compliance
    addJurisdictionRule,
    setMaxHolders,
    setLockup,
    pauseToken,
    unpauseToken,
    // Claims
    addTrustedIssuer,
    removeTrustedIssuer,
    // Oracle
    updatePrice,
    // Allowlist
    addToAllowlist,
    removeFromAllowlist,
  };
}
