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
  });

  /**
   * Verifica o KYC status do usuário conectado
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
      });
      return;
    }

    setKycStatus((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // SRWA Factory Program ID (User Registry é parte do SRWA Factory, não Compliance)
      const SRWA_FACTORY_PROGRAM_ID = new PublicKey('DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY');

      // Derive User Registry PDA
      const [userRegistryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_registry'), wallet.publicKey.toBuffer()],
        SRWA_FACTORY_PROGRAM_ID
      );

      console.log('[useKYCStatus] Checking User Registry:', userRegistryPDA.toBase58());

      // Buscar account info
      const accountInfo = await connection.getAccountInfo(userRegistryPDA);

      if (!accountInfo) {
        console.log('[useKYCStatus] User Registry não encontrado - usuário não tem KYC');
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
        });
        return;
      }

      console.log('[useKYCStatus] User Registry encontrado, raw data length:', accountInfo.data.length);

      // Usar Anchor para decodificar (mesma lógica do useUserRegistry)
      // Precisamos criar um programa Anchor temporário para usar o IDL
      // Por simplicidade, vamos fazer parse manual compatível com a estrutura do Anchor

      // Estrutura do User Registry (via Anchor IDL):
      // - 8 bytes: discriminator
      // - 32 bytes: user pubkey
      // - 1 byte: role (enum)
      // - 8 bytes: registered_at (i64)
      // - 1 byte: kyc_completed (bool)
      // - 1 byte: is_active (bool)
      // - 1 byte: bump
      const data = accountInfo.data;

      if (data.length < 52) {
        throw new Error(`Account data inválido: tamanho ${data.length} bytes (esperado >= 52)`);
      }

      // Offset após discriminator (8) + user pubkey (32) + role (1) + registered_at (8) = 49
      const kycCompleted = data[49] === 1;
      const isActive = data[50] === 1;

      console.log('[useKYCStatus] Parsed User Registry:', {
        kycCompleted,
        isActive,
        dataLength: data.length,
      });

      // No SRWA Factory, o KYC é um boolean simples (kyc_completed)
      // Não há bitmap de topics como no Compliance program
      const hasKYC = isActive && kycCompleted;

      setKycStatus({
        hasKYC: hasKYC,
        loading: false,
        error: null,
        topics: {
          kyc: kycCompleted,
          aml: false, // User Registry não tem topics detalhados
          accredited: false,
          residency: false,
        },
      });

      console.log('[useKYCStatus] KYC Status:', {
        hasKYC,
        kycCompleted,
        isActive,
      });
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
      });
    }
  }, [wallet.publicKey, connection]);

  // Auto-check quando wallet conectar
  useEffect(() => {
    checkKYCStatus();
  }, [checkKYCStatus]);

  /**
   * Verifica KYC de outro endereço (usado pelo admin)
   */
  const checkKYCForAddress = useCallback(
    async (address: PublicKey): Promise<KYCStatus> => {
      try {
        const SRWA_FACTORY_PROGRAM_ID = new PublicKey('DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY');

        const [userRegistryPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_registry'), address.toBuffer()],
          SRWA_FACTORY_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(userRegistryPDA);

        if (!accountInfo) {
          return {
            hasKYC: false,
            loading: false,
            error: null,
            topics: {
              kyc: false,
              aml: false,
              accredited: false,
              residency: false,
            },
          };
        }

        const data = accountInfo.data;

        // Parse User Registry structure
        const kycCompleted = data[49] === 1;
        const isActive = data[50] === 1;
        const hasKYC = isActive && kycCompleted;

        return {
          hasKYC,
          loading: false,
          error: null,
          topics: {
            kyc: kycCompleted,
            aml: false,
            accredited: false,
            residency: false,
          },
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
