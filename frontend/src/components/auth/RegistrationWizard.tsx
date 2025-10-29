import { useState } from 'react';
import { UserRole } from '@/types/srwa-contracts';
import { useUserRegistry } from '@/hooks/solana';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: UserRole.Issuer,
    title: 'Issuer',
    description: 'Crie e gerencie tokens e pools de ativos',
    icon: <Building2 className="w-12 h-12" />,
    features: [
      'Criar tokens SRWA',
      'Gerenciar pools de investimento',
      'Dashboard de emissão',
      'Configurar KYC e compliance',
    ],
    color: 'from-blue-500 to-blue-600',
  },
  {
    role: UserRole.Investor,
    title: 'Investor',
    description: 'Invista em tokens e pools disponíveis',
    icon: <TrendingUp className="w-12 h-12" />,
    features: [
      'Visualizar pools disponíveis',
      'Investir em tokens',
      'Dashboard de investimentos',
      'Acompanhar rendimentos',
    ],
    color: 'from-green-500 to-green-600',
  },
  {
    role: UserRole.Admin,
    title: 'Admin',
    description: 'Gerencie e aprove todas as operações',
    icon: <Shield className="w-12 h-12" />,
    features: [
      'Aprovar criação de tokens',
      'Gerenciar usuários',
      'Acesso completo ao sistema',
      'Monitorar compliance',
    ],
    color: 'from-purple-500 to-purple-600',
  },
];

export function RegistrationWizard() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { registerUser } = useUserRegistry();
  const wallet = useWallet();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!selectedRole) {
      toast.error('Selecione um tipo de usuário');
      return;
    }

    // Check if wallet is connected
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Conecte sua wallet primeiro');
      return;
    }

    setIsRegistering(true);

    try {
      const result = await registerUser(selectedRole);

      toast.success('Registro realizado com sucesso!', {
        description: `Você foi registrado como ${selectedRole}`,
      });

      // Redirecionar baseado no role
      setTimeout(() => {
        if (selectedRole === UserRole.Issuer) {
          navigate('/srwa-issuance');
        } else if (selectedRole === UserRole.Investor) {
          navigate('/investor');
        } else {
          navigate('/admin');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      console.error('Erro completo:', JSON.stringify(error, null, 2));
      console.error('Error stack:', error?.stack);

      // Se o erro indica que o usuário já está registrado, redirecionar
      if (error?.message?.includes('já está registrado')) {
        toast.info('Você já está registrado!', {
          description: error.message,
        });

        // Redirecionar após 1 segundo
        setTimeout(() => {
          if (selectedRole === UserRole.Issuer) {
            navigate('/srwa-issuance');
          } else if (selectedRole === UserRole.Investor) {
            navigate('/investor');
          } else {
            navigate('/admin');
          }
        }, 1000);
        return;
      }

      toast.error('Erro ao realizar registro', {
        description: error?.message || error?.toString() || 'Tente novamente',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao SRWA Protocol</h1>
        <p className="text-lg text-muted-foreground">
          Selecione o tipo de conta que melhor se adequa às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {ROLE_OPTIONS.map((option) => (
          <Card
            key={option.role}
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedRole === option.role
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedRole(option.role)}
          >
            <CardHeader>
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center text-white mb-4`}>
                {option.icon}
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{option.title}</CardTitle>
                {selectedRole === option.role && (
                  <CheckCircle className="w-6 h-6 text-primary" />
                )}
              </div>
              <CardDescription className="text-base">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground mb-2">
                  Funcionalidades:
                </p>
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5 h-1.5 w-1.5 rounded-full p-0" />
                    <p className="text-sm">{feature}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleRegister}
          disabled={!selectedRole || isRegistering || !wallet.connected}
          className="min-w-[200px]"
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : !wallet.connected ? (
            'Conecte sua Wallet'
          ) : !selectedRole ? (
            'Selecione um Tipo'
          ) : (
            'Confirmar Registro'
          )}
        </Button>
      </div>

      {selectedRole && !isRegistering && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                • Seu tipo de conta determinará as funcionalidades disponíveis
              </p>
              <p>
                • Você precisará completar o processo de KYC para acessar todas as funcionalidades
              </p>
              <p>
                • O registro é feito na blockchain e não pode ser alterado facilmente
              </p>
              {selectedRole === UserRole.Admin && (
                <p className="text-amber-600 dark:text-amber-400 font-semibold">
                  ⚠️ O tipo Admin requer aprovação especial e poderes elevados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
