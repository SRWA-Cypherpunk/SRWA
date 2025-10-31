import { useProgramsSafe } from '@/contexts/ProgramContext';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { UserRole, UserRegistry } from '@/types/srwa-contracts';
import { useQuery } from '@tanstack/react-query';

export function useUserRegistry() {
  const { programs } = useProgramsSafe();
  const wallet = useAnchorWallet();

  // Função para derivar o PDA do user registry
  const getUserRegistryPDA = (userPubkey: PublicKey) => {
    if (!programs.srwaFactory) throw new Error('SRWA Factory program not loaded');

    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_registry'), userPubkey.toBuffer()],
      programs.srwaFactory.programId
    );
    return { pda, bump };
  };

  // Registrar um novo usuário com um role específico
  const registerUser = async (role: UserRole) => {
    console.log('[useUserRegistry.registerUser] Starting registration', {
      hasWallet: !!wallet,
      walletPubkey: wallet?.publicKey?.toBase58(),
      hasProgram: !!programs.srwaFactory,
      programProvider: programs.srwaFactory?.provider?.wallet?.publicKey?.toBase58(),
    });

    if (!wallet?.publicKey) throw new Error('Wallet not connected');
    if (!programs.srwaFactory) throw new Error('SRWA Factory program not loaded');

    const { pda: userRegistryPda } = getUserRegistryPDA(wallet.publicKey);

    // Verificar se o usuário já está registrado
    const existingRegistry = await fetchUserRegistry(wallet.publicKey);
    if (existingRegistry) {
      throw new Error(`Você já está registrado como ${existingRegistry.role}. Não é necessário registrar-se novamente.`);
    }

    // Mapear o enum TypeScript para o enum Rust
    const roleEnum = role === UserRole.Issuer
      ? { issuer: {} }
      : role === UserRole.Investor
      ? { investor: {} }
      : { admin: {} };

    const tx = await programs.srwaFactory.methods
      .registerUser(roleEnum)
      .accounts({
        user: wallet.publicKey,
        userRegistry: userRegistryPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, userRegistryPda };
  };

  // Buscar informações do usuário registrado
  const fetchUserRegistry = async (userPubkey?: PublicKey): Promise<UserRegistry | null> => {
    if (!programs.srwaFactory) return null;

    const pubkey = userPubkey || wallet?.publicKey;
    if (!pubkey) return null;

    const { pda } = getUserRegistryPDA(pubkey);

    try {
      const accountInfo = await programs.srwaFactory.account.userRegistry.fetch(pda);

      // Converter o role do formato Rust para TypeScript
      let role: UserRole;
      if ('issuer' in accountInfo.role) {
        role = UserRole.Issuer;
      } else if ('investor' in accountInfo.role) {
        role = UserRole.Investor;
      } else {
        role = UserRole.Admin;
      }

      return {
        user: accountInfo.user.toBase58(),
        role,
        registered_at: accountInfo.registeredAt.toNumber(),
        kyc_completed: accountInfo.kycCompleted,
        is_active: accountInfo.isActive,
        bump: accountInfo.bump,
      };
    } catch (error: any) {
      // Se o erro é "Account does not exist", o usuário não está registrado
      if (error?.message?.includes('Account does not exist')) {
        console.log('[useUserRegistry] User not registered:', pubkey.toBase58());
        return null;
      }

      // Se for outro tipo de erro, tentar buscar diretamente da RPC
      console.warn('[useUserRegistry] Error fetching user registry, retrying with getAccountInfo:', error?.message);
      try {
        const accountInfo = await programs.srwaFactory.provider.connection.getAccountInfo(pda);
        if (!accountInfo) {
          console.log('[useUserRegistry] User not registered (no account info):', pubkey.toBase58());
          return null;
        }

        // Conta existe, mas talvez o fetch do Anchor falhou
        console.log('[useUserRegistry] Account exists but Anchor fetch failed. Retrying...');
        const retry = await programs.srwaFactory.account.userRegistry.fetch(pda);

        let role: UserRole;
        if ('issuer' in retry.role) {
          role = UserRole.Issuer;
        } else if ('investor' in retry.role) {
          role = UserRole.Investor;
        } else {
          role = UserRole.Admin;
        }

        return {
          user: retry.user.toBase58(),
          role,
          registered_at: retry.registeredAt.toNumber(),
          kyc_completed: retry.kycCompleted,
          is_active: retry.isActive,
          bump: retry.bump,
        };
      } catch (retryError: any) {
        console.error('[useUserRegistry] Failed to fetch user registry after retry:', retryError);
        return null;
      }
    }
  };

  // Hook React Query para buscar o user registry
  const { data: userRegistry, isLoading, error, refetch } = useQuery({
    queryKey: ['userRegistry', wallet?.publicKey?.toBase58()],
    queryFn: () => fetchUserRegistry(),
    enabled: !!wallet?.publicKey && !!programs.srwaFactory,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Verificar se o usuário está registrado
  const isRegistered = !!userRegistry;

  // Verificar se o usuário tem um role específico
  const hasRole = (role: UserRole) => userRegistry?.role === role;

  // Verificar se o usuário é admin
  const isAdmin = hasRole(UserRole.Admin);

  // Verificar se o usuário é issuer
  const isIssuer = hasRole(UserRole.Issuer);

  // Verificar se o usuário é investor
  const isInvestor = hasRole(UserRole.Investor);

  // Completar KYC do usuário
  const completeKYC = async () => {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');
    if (!programs.srwaFactory) throw new Error('SRWA Factory program not loaded');
    if (!programs.srwaController) throw new Error('SRWA Controller program not loaded');

    const { pda: userRegistryPda } = getUserRegistryPDA(wallet.publicKey);

    let tx1: string | null = null;

    // 1. Completar KYC no Factory (User Registry) - se ainda não foi feito
    try {
      const factoryAccount = await programs.srwaFactory.provider.connection.getAccountInfo(userRegistryPda);
      if (factoryAccount) {
        // Parse the data to check if KYC is already completed
        const data = factoryAccount.data;
        if (data.length >= 52) {
          const kycCompleted = data[49] === 1;
          if (!kycCompleted) {
            tx1 = await programs.srwaFactory.methods
              .completeKyc()
              .accounts({
                user: wallet.publicKey,
                userRegistry: userRegistryPda,
              })
              .rpc();
            console.log('[useUserRegistry] Factory KYC completed:', tx1);
          } else {
            console.log('[useUserRegistry] Factory KYC already completed');
          }
        }
      }
    } catch (error: any) {
      if (error?.message?.includes('already been processed')) {
        console.log('[useUserRegistry] Factory KYC already completed');
      } else {
        console.error('[useUserRegistry] Error completing Factory KYC:', error);
        throw error;
      }
    }

    // 2. Criar KYC Registry no Controller (para Transfer Hook)
    const [kycRegistryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('kyc'), wallet.publicKey.toBuffer()],
      programs.srwaController.programId
    );

    try {
      // Check if Controller KYC Registry already exists
      const controllerAccount = await programs.srwaController.provider.connection.getAccountInfo(kycRegistryPda);

      if (!controllerAccount) {
        const tx2 = await programs.srwaController.methods
          .initializeKycRegistry(true, true) // kyc_completed, is_active
          .accounts({
            authority: wallet.publicKey,
            user: wallet.publicKey,
            kycRegistry: kycRegistryPda,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        console.log('[useUserRegistry] Controller KYC Registry created:', tx2);
      } else {
        console.log('[useUserRegistry] Controller KYC Registry already exists');
      }
    } catch (error: any) {
      // Se a conta já existe, não é erro fatal
      if (error?.message?.includes('already in use') || error?.message?.includes('already been processed')) {
        console.log('[useUserRegistry] Controller KYC Registry already exists');
      } else {
        console.error('[useUserRegistry] Error creating Controller KYC Registry:', error);
        // Não falhar se o Controller KYC falhar, o Factory KYC já foi feito
      }
    }

    // Atualizar o cache
    await refetch();

    return { signature: tx1 || 'no-transaction-needed' };
  };

  return {
    registerUser,
    completeKYC,
    fetchUserRegistry,
    userRegistry,
    isLoading,
    error,
    refetch,
    isRegistered,
    hasRole,
    isAdmin,
    isIssuer,
    isInvestor,
    getUserRegistryPDA,
  };
}
