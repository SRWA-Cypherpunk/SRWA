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
    if (!wallet?.publicKey) throw new Error('Wallet not connected');
    if (!programs.srwaFactory) throw new Error('SRWA Factory program not loaded');

    const { pda: userRegistryPda } = getUserRegistryPDA(wallet.publicKey);

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

    try {
      const { pda } = getUserRegistryPDA(pubkey);
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
    } catch (error) {
      // Usuário não registrado ainda
      console.log('User not registered:', error);
      return null;
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

    const { pda: userRegistryPda } = getUserRegistryPDA(wallet.publicKey);

    const tx = await programs.srwaFactory.methods
      .completeKyc()
      .accounts({
        user: wallet.publicKey,
        userRegistry: userRegistryPda,
      })
      .rpc();

    // Atualizar o cache
    await refetch();

    return { signature: tx };
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
