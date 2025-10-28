import { useState, useMemo } from 'react';
import { UserRole } from '@/types/srwa-contracts';
import { useUserRegistry } from '@/hooks/solana';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, TrendingUp, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useIsAuthorizedAdmin } from '@/hooks/useIsAuthorizedAdmin';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  gradient: string;
  glowColor: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: UserRole.Issuer,
    title: 'Issuer',
    description: 'Create and manage tokens and asset pools',
    icon: <Building2 className="w-10 h-10" />,
    features: [
      'Create SRWA tokens',
      'Manage investment pools',
      'Issuance dashboard',
      'Configure KYC and compliance',
    ],
    gradient: 'from-purple-500/20 via-orange-500/10 to-transparent',
    glowColor: 'rgba(153, 69, 255, 0.4)',
  },
  {
    role: UserRole.Investor,
    title: 'Investor',
    description: 'Invest in available tokens and pools',
    icon: <TrendingUp className="w-10 h-10" />,
    features: [
      'View available pools',
      'Invest in tokens',
      'Investment dashboard',
      'Track yields',
    ],
    gradient: 'from-orange-500/20 via-purple-500/10 to-transparent',
    glowColor: 'rgba(255, 107, 53, 0.4)',
  },
  {
    role: UserRole.Admin,
    title: 'Admin',
    description: 'Manage and approve all operations',
    icon: <Shield className="w-10 h-10" />,
    features: [
      'Approve token creation',
      'Manage users',
      'Full system access',
      'Monitor compliance',
    ],
    gradient: 'from-purple-500/20 via-orange-500/10 to-purple-500/5',
    glowColor: 'rgba(153, 69, 255, 0.5)',
  },
];

export function RegistrationWizard() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { registerUser } = useUserRegistry();
  const navigate = useNavigate();
  const isAuthorizedAdmin = useIsAuthorizedAdmin();

  // Filter available roles based on admin authorization
  const availableRoles = useMemo(() => {
    // Only show Admin role if wallet is authorized on-chain
    return ROLE_OPTIONS.filter(
      (option) => option.role !== UserRole.Admin || isAuthorizedAdmin
    );
  }, [isAuthorizedAdmin]);

  const handleRegister = async () => {
    if (!selectedRole) {
      toast.error('Select a user type');
      return;
    }

    setIsRegistering(true);

    try {
      await registerUser(selectedRole);

      toast.success('Registration successful!', {
        description: `You have been registered as ${selectedRole}`,
      });


      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dashboard Background (blurred) */}
      <div className="fixed inset-0">
        {/* Background showing dashboard page */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary">
          {/* Simulated dashboard content in background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 right-10 grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/5 rounded-lg" />
              ))}
            </div>
            <div className="absolute top-60 left-10 right-10 grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-white/5 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Animated Gradient Mesh */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>
        </div>

        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-bg-primary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-orange-400 bg-clip-text text-transparent animate-fade-in">
            Welcome to SRWA Protocol
          </h1>
          <p className="text-xl text-fg-secondary max-w-2xl mx-auto">
            Select the account type that best fits your needs
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {ROLE_OPTIONS.map((option, index) => (
            <div
              key={option.role}
              className={`group relative cursor-pointer transition-all duration-300 ${
                selectedRole === option.role ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedRole(option.role)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glass Card */}
              <div
                className={`relative h-full rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                  selectedRole === option.role
                    ? 'bg-white/10 border-white/30 shadow-2xl'
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
                style={{
                  boxShadow: selectedRole === option.role
                    ? `0 0 40px ${option.glowColor}`
                    : 'none',
                }}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.gradient} opacity-50`} />

                {/* Content */}
                <div className="relative p-8 space-y-6">
                  {/* Icon & Title */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
                        {option.icon}
                      </div>
                      {selectedRole === option.role && (
                        <CheckCircle className="w-8 h-8 text-green-400 animate-scale-in" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-fg-primary mb-2">
                        {option.title}
                      </h3>
                      <p className="text-fg-secondary text-sm leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  {/* Features List */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-fg-tertiary uppercase tracking-wider">
                      Features
                    </p>
                    {option.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
                        <p className="text-sm text-fg-secondary group-hover/item:text-fg-primary transition-colors">
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Indicator Bar */}
                {selectedRole === option.role && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 rounded-b-2xl" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-12">
          <Button
            size="lg"
            onClick={handleRegister}
            disabled={!selectedRole || isRegistering}
            className="relative group px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-500 hover:via-orange-500 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl"
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Confirm Registration
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        {selectedRole && !isRegistering && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />

              <div className="relative space-y-4">
                <h3 className="text-xl font-bold text-fg-primary mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Important Information
                </h3>
                <div className="space-y-3 text-sm text-fg-secondary">
                  <p className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
                    Your account type will determine available features
                  </p>
                  <p className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
                    You will need to complete the KYC process to access all features
                  </p>
                  <p className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
                    Registration is recorded on the blockchain and cannot be easily changed
                  </p>
                  {selectedRole === UserRole.Admin && (
                    <p className="flex items-start gap-2 text-amber-400 font-semibold mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span>⚠️</span>
                      Admin type requires special approval and elevated permissions
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
