import { useProgramsSafe } from '../contexts/ProgramContext';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export interface KYCData {
  claimTopic: BN;
  claimData: Buffer;
  issuerSignature: Buffer;
}

export function useInvestor() {
  const { programs, hasPrograms } = useProgramsSafe();
  const wallet = useAnchorWallet();

  const registerIdentity = async () => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!hasPrograms || !programs.identityClaims) {
      console.error('Programs state:', { hasPrograms, programs, identityClaims: programs.identityClaims });
      throw new Error('Identity Claims program not loaded');
    }

    const [identity] = PublicKey.findProgramAddressSync(
      [Buffer.from('identity'), wallet.publicKey.toBuffer()],
      programs.identityClaims.programId
    );

    console.log('Registering identity for:', wallet.publicKey.toString());
    console.log('Identity PDA:', identity.toString());

    try {
      // Import Buffer if needed
      const { Buffer } = await import('buffer');

      const tx = await programs.identityClaims.methods
        .registerIdentity(Buffer.alloc(0))  // Empty Buffer for bytes type
        .accounts({
          user: wallet.publicKey,
          identity,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, identity };
    } catch (error: any) {
      console.error('Full error:', error);
      console.error('Error logs:', error.logs);
      throw error;
    }
  };

  const addClaim = async (topic: number, dataHash: number[], validUntil: number, issuerWallet: any) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.identityClaims) throw new Error('Identity Claims program not loaded');

    const holder = wallet.publicKey;

    const [identity] = PublicKey.findProgramAddressSync(
      [Buffer.from('identity'), holder.toBuffer()],
      programs.identityClaims.programId
    );

    const [claim] = PublicKey.findProgramAddressSync(
      [Buffer.from('claim'), holder.toBuffer(), Buffer.from([topic, 0, 0, 0])],
      programs.identityClaims.programId
    );

    const tx = await programs.identityClaims.methods
      .addClaim(topic, dataHash, validUntil)
      .accounts({
        issuer: issuerWallet.publicKey,
        holder,
        identity,
        claim,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  const isVerified = async () => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.identityClaims) throw new Error('Identity Claims program not loaded');

    const [identity] = PublicKey.findProgramAddressSync(
      [Buffer.from('identity'), wallet.publicKey.toBuffer()],
      programs.identityClaims.programId
    );

    try {
      // Try to fetch using standard method
      if (programs.identityClaims.account?.identity) {
        try {
          const identityAccount = await programs.identityClaims.account.identity.fetch(identity);
          return identityAccount.isVerified;
        } catch (e) {
          // Account doesn't exist or other error
          return false;
        }
      }

      // Fallback: check if account exists
      const accountInfo = await programs.identityClaims.provider.connection.getAccountInfo(identity);
      if (!accountInfo) {
        return false;
      }

      // Account exists, try to decode
      try {
        const identityAccount = programs.identityClaims.coder.accounts.decode('Identity', accountInfo.data);
        return identityAccount.isVerified || false;
      } catch (decodeError) {
        // If we can't decode, assume not verified
        return false;
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  };

  const subscribe = async (mint: PublicKey, amount: BN) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.offeringPool) throw new Error('Offering Pool program not loaded');

    const [subscription] = PublicKey.findProgramAddressSync(
      [Buffer.from('subscription'), mint.toBuffer(), wallet.publicKey.toBuffer()],
      programs.offeringPool.programId
    );

    const tx = await programs.offeringPool.methods
      .subscribe(amount)
      .accounts({
        user: wallet.publicKey,
        mint,
        subscription,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, subscription };
  };

  const getSubscription = async (mint: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.offeringPool) throw new Error('Offering Pool program not loaded');

    const [subscription] = PublicKey.findProgramAddressSync(
      [Buffer.from('subscription'), mint.toBuffer(), wallet.publicKey.toBuffer()],
      programs.offeringPool.programId
    );

    try {
      // Try standard fetch
      if (programs.offeringPool.account?.subscription) {
        try {
          const subscriptionAccount = await programs.offeringPool.account.subscription.fetch(subscription);
          return subscriptionAccount;
        } catch (e) {
          return null;
        }
      }

      // Fallback
      const accountInfo = await programs.offeringPool.provider.connection.getAccountInfo(subscription);
      if (!accountInfo) {
        return null;
      }

      const subscriptionAccount = programs.offeringPool.coder.accounts.decode('Subscription', accountInfo.data);
      return subscriptionAccount;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  };

  const claimTokens = async (mint: PublicKey) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!programs.offeringPool) throw new Error('Offering Pool program not loaded');

    const [subscription] = PublicKey.findProgramAddressSync(
      [Buffer.from('subscription'), mint.toBuffer(), wallet.publicKey.toBuffer()],
      programs.offeringPool.programId
    );

    const tx = await programs.offeringPool.methods
      .claim()
      .accounts({
        user: wallet.publicKey,
        mint,
        subscription,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx };
  };

  return {
    registerIdentity,
    addClaim,
    isVerified,
    subscribe,
    getSubscription,
    claimTokens,
  };
}
