import { useCallback, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export interface KYCStatus {
  hasKYC: boolean;
  loading: boolean;
  error: string | null;
  topics: {
    kyc: boolean;
    aml: boolean;
    accredited: boolean;
    residency: boolean;
  };
  // Novos campos para diferenciar os 2 sistemas
  hasFactoryKYC: boolean;
  hasControllerKYC: boolean;
}

/**
 * Hook para verificar o status de KYC de um usuário
 *
 * Verifica se o usuário possui User Registry na blockchain com KYC válido
 * Isso é necessário para poder receber tokens SRWA (Transfer Hook valida isso)
 */
export function useKYCStatus() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    hasKYC: false,
    loading: false,
    error: null,
    topics: {
      kyc: false,
      aml: false,
      accredited: false,
      residency: false,
    },
    hasFactoryKYC: false,
    hasControllerKYC: false,
  });

  /**
   * Verifica o KYC status do usuário conectado
   * Agora verifica AMBOS: Factory (User Registry) e Controller (KYC Registry)
   */
  const checkKYCStatus = useCallback(async () => {
    if (!wallet.publicKey) {
      setKycStatus({
        hasKYC: false,
        loading: false,
        error: null,
        topics: {
          kyc: false,
          aml: false,
          accredited: false,
          residency: false,
        },
        hasFactoryKYC: false,
        hasControllerKYC: false,
      });
      return;
    }

    setKycStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const SRWA_FACTORY_PROGRAM_ID = new PublicKey('CfNjE6Lp6ddtrnTZQci2pPVkDsqB83hsBELwF9KR7n8b');
      const SRWA_CONTROLLER_PROGRAM_ID = new PublicKey('A6JtsR3Zw1GB1gTJuqdpFiBijarm9pQRTgqVkZaEdBs3');

      // 1. Verificar Factory User Registry
      const [userRegistryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_registry'), wallet.publicKey.toBuffer()],
        SRWA_FACTORY_PROGRAM_ID
      );

      const factoryAccountInfo = await connection.getAccountInfo(userRegistryPDA);
      let hasFactoryKYC = false;

      if (factoryAccountInfo && factoryAccountInfo.data.length >= 52) {
        const data = factoryAccountInfo.data;
        const kycCompleted = data[49] === 1;
        const isActive = data[50] === 1;
        hasFactoryKYC = isActive && kycCompleted;
        console.log('[useKYCStatus] Factory KYC:', hasFactoryKYC);
      }

      // 2. Verificar Controller KYC Registry
      const [kycRegistryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('kyc'), wallet.publicKey.toBuffer()],
        SRWA_CONTROLLER_PROGRAM_ID
      );

      const controllerAccountInfo = await connection.getAccountInfo(kycRegistryPDA);
      let hasControllerKYC = false;

      if (controllerAccountInfo && controllerAccountInfo.data.length >= 8 + 43) {
        const data = controllerAccountInfo.data;
        // Estrutura KYC Registry: discriminator (8) + user (32) + kyc_completed (1) + is_active (1) + ...
        const kycCompleted = data[8 + 32] === 1;
        const isActive = data[8 + 32 + 1] === 1;
        hasControllerKYC = isActive && kycCompleted;
        console.log('[useKYCStatus] Controller KYC:', hasControllerKYC);
      }

      // Para ter KYC completo, precisa ter AMBOS
      const hasKYC = hasFactoryKYC && hasControllerKYC;

      console.log('[useKYCStatus] ===== KYC Status Check =====');
      console.log('[useKYCStatus] Factory KYC:', hasFactoryKYC);
      console.log('[useKYCStatus] Controller KYC:', hasControllerKYC);
      console.log('[useKYCStatus] Has Complete KYC:', hasKYC);
      console.log('[useKYCStatus] Factory PDA:', userRegistryPDA.toBase58());
      console.log('[useKYCStatus] Controller PDA:', kycRegistryPDA.toBase58());

      setKycStatus({
        hasKYC,
        loading: false,
        error: null,
        topics: {
          kyc: hasFactoryKYC,
          aml: false,
          accredited: false,
          residency: false,
        },
        hasFactoryKYC,
        hasControllerKYC,
      });

      console.log('[useKYCStatus] Updated state with hasKYC:', hasKYC);
    } catch (error: any) {
      console.error('[useKYCStatus] Error checking KYC:', error);
      setKycStatus({
        hasKYC: false,
        loading: false,
        error: error.message,
        topics: {
          kyc: false,
          aml: false,
          accredited: false,
          residency: false,
        },
        hasFactoryKYC: false,
        hasControllerKYC: false,
      });
    }
  }, [wallet.publicKey, connection]);

  // Auto-check quando wallet conectar
  useEffect(() => {
    checkKYCStatus();
  }, [checkKYCStatus]);

  /**
   * Verifica KYC de outro endereço (usado pelo admin)
   * Agora verifica AMBOS os sistemas
   */
  const checkKYCForAddress = useCallback(
    async (address: PublicKey): Promise<KYCStatus> => {
      try {
        const SRWA_FACTORY_PROGRAM_ID = new PublicKey('CfNjE6Lp6ddtrnTZQci2pPVkDsqB83hsBELwF9KR7n8b');
        const SRWA_CONTROLLER_PROGRAM_ID = new PublicKey('A6JtsR3Zw1GB1gTJuqdpFiBijarm9pQRTgqVkZaEdBs3');

        // 1. Factory User Registry
        const [userRegistryPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_registry'), address.toBuffer()],
          SRWA_FACTORY_PROGRAM_ID
        );

        const factoryAccountInfo = await connection.getAccountInfo(userRegistryPDA);
        let hasFactoryKYC = false;

        if (factoryAccountInfo && factoryAccountInfo.data.length >= 52) {
          const data = factoryAccountInfo.data;
          const kycCompleted = data[49] === 1;
          const isActive = data[50] === 1;
          hasFactoryKYC = isActive && kycCompleted;
        }

        // 2. Controller KYC Registry
        const [kycRegistryPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('kyc'), address.toBuffer()],
          SRWA_CONTROLLER_PROGRAM_ID
        );

        const controllerAccountInfo = await connection.getAccountInfo(kycRegistryPDA);
        let hasControllerKYC = false;

        if (controllerAccountInfo && controllerAccountInfo.data.length >= 8 + 43) {
          const data = controllerAccountInfo.data;
          const kycCompleted = data[8 + 32] === 1;
          const isActive = data[8 + 32 + 1] === 1;
          hasControllerKYC = isActive && kycCompleted;
        }

        const hasKYC = hasFactoryKYC && hasControllerKYC;

        return {
          hasKYC,
          loading: false,
          error: null,
          topics: {
            kyc: hasFactoryKYC,
            aml: false,
            accredited: false,
            residency: false,
          },
          hasFactoryKYC,
          hasControllerKYC,
        };
      } catch (error: any) {
        return {
          hasKYC: false,
          loading: false,
          error: error.message,
          topics: {
            kyc: false,
            aml: false,
            accredited: false,
            residency: false,
          },
          hasFactoryKYC: false,
          hasControllerKYC: false,
        };
      }
    },
    [connection]
  );

  return {
    kycStatus,
    checkKYCStatus,
    checkKYCForAddress,
  };
}
