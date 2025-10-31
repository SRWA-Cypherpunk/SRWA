import { useState } from 'react';
import { UserRole } from '@/types/srwa-contracts';
import { useUserRegistry } from '@/hooks/solana';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, TrendingUp, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Logo from '@/assets/logo.png';

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
    description: 'Create and manage tokens and asset pools',
    icon: <Building2 className="w-12 h-12" />,
    features: [
      'Create SRWA tokens',
      'Manage investment pools',
      'Issuance dashboard',
      'Configure KYC and compliance',
    ],
    color: 'from-[hsl(var(--brand-500))] to-[hsl(var(--brand-600))]',
  },
  {
    role: UserRole.Investor,
    title: 'Investor',
    description: 'Invest in tokens and available pools',
    icon: <TrendingUp className="w-12 h-12" />,
    features: [
      'View available pools',
      'Invest in tokens',
      'Investment dashboard',
      'Track returns',
    ],
    color: 'from-[hsl(var(--accent-green-500))] to-[hsl(var(--accent-green-400))]',
  },
  {
    role: UserRole.Admin,
    title: 'Admin',
    description: 'Manage platform and approve token requests',
    icon: <Shield className="w-12 h-12" />,
    features: [
      'Approve token requests',
      'Manage admin allowlist',
      'View market analytics',
      'Platform administration',
    ],
    color: 'from-orange-500 to-red-600',
  },
];

export function RegistrationWizard() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasAttemptedRegistration, setHasAttemptedRegistration] = useState(false);
  const { registerUser } = useUserRegistry();
  const wallet = useWallet();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!selectedRole) {
      toast.error('Please select a user type');
      return;
    }

    // Check if wallet is connected
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Prevent multiple clicks
    if (isRegistering || hasAttemptedRegistration) {
      console.log('[RegistrationWizard] Already registering or attempted, ignoring click');
      return;
    }

    setIsRegistering(true);
    setHasAttemptedRegistration(true);

    try {
      const result = await registerUser(selectedRole);

      toast.success('Registration successful!', {
        description: `You have been registered as ${selectedRole}`,
      });

      // Redirect based on role
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
      console.error('Registration error:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      console.error('Error stack:', error?.stack);

      // Check if transaction already processed (user already registered)
      const errorMessage = error?.message || error?.transactionMessage || '';
      if (
        errorMessage.includes('already registered') ||
        errorMessage.includes('já está registrado') ||
        errorMessage.includes('already been processed') ||
        error?.transactionMessage?.includes('already been processed')
      ) {
        toast.info('You are already registered!', {
          description: 'Refreshing your profile...',
        });

        // Force refetch user registry
        window.location.reload();
        return;
      }

      toast.error('Registration error', {
        description: error?.message || error?.transactionMessage || error?.toString() || 'Please try again',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12 animate-fade-in">
        {/* Logo with glow effect */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow effect behind logo */}
            <motion.div
              className="absolute -inset-4 rounded-full blur-2xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: 'radial-gradient(circle, rgba(153, 69, 255, 0.4), rgba(255, 107, 53, 0.3))',
              }}
            />
            <img
              src={Logo}
              alt="SRWA Protocol"
              className="relative h-20 w-auto drop-shadow-[0_0_25px_rgba(153,69,255,0.5)]"
            />
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-purple-500 to-orange-500 bg-clip-text text-transparent bg-[length:200%_auto]"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            backgroundImage: 'linear-gradient(to right, rgb(192, 132, 252), rgb(168, 85, 247), rgb(255, 107, 53))',
          }}
        >
          Welcome to SRWA Protocol
        </motion.h1>
        <p className="text-lg text-muted-foreground">
          Select the account type that best suits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch max-w-6xl mx-auto">
        {ROLE_OPTIONS.map((option, idx) => {
          const isSelected = selectedRole === option.role;

          return (
            <motion.div
              key={option.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole(option.role)}
              className="cursor-pointer relative group h-full"
            >
              <Card
                className={`relative overflow-hidden h-full min-h-[420px] md:min-h-[450px] flex flex-col transition-all duration-300 backdrop-blur-xl bg-black/60 border shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${
                  isSelected
                    ? 'ring-2 ring-purple-500/60 border-purple-400/50 bg-gradient-to-br from-purple-600/20 via-purple-500/15 to-orange-500/10 group-hover:from-purple-600/50 group-hover:via-purple-500/40 group-hover:to-orange-500/30 group-hover:shadow-[0_0_40px_rgba(153,69,255,0.8),0_0_80px_rgba(153,69,255,0.5)]'
                    : option.role === UserRole.Issuer
                    ? 'border-white/15 group-hover:bg-gradient-to-br group-hover:from-purple-600/40 group-hover:via-purple-500/30 group-hover:to-orange-500/25 group-hover:border-purple-400/60 group-hover:shadow-[0_0_40px_rgba(153,69,255,0.8),0_0_80px_rgba(153,69,255,0.5),0_0_60px_rgba(255,107,53,0.4)]'
                    : option.role === UserRole.Investor
                    ? 'border-white/15 group-hover:bg-gradient-to-br group-hover:from-purple-600/40 group-hover:via-orange-500/30 group-hover:to-purple-500/35 group-hover:border-orange-400/60 group-hover:shadow-[0_0_40px_rgba(153,69,255,0.7),0_0_60px_rgba(255,107,53,0.6),0_0_80px_rgba(153,69,255,0.4)]'
                    : 'border-white/15 group-hover:bg-gradient-to-br group-hover:from-purple-600/40 group-hover:via-orange-500/30 group-hover:to-purple-700/40 group-hover:border-orange-400/60 group-hover:shadow-[0_0_40px_rgba(153,69,255,0.6),0_0_60px_rgba(255,107,53,0.7)]'
                }`}
              >
                {/* Internal animated gradient pulse (similar to title) */}
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.15), rgba(255, 107, 53, 0.1))',
                    backgroundSize: '200% 200%',
                    opacity: isSelected ? 0.15 : 0.08,
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    opacity: isSelected ? [0.15, 0.25, 0.15] : [0.08, 0.15, 0.08],
                  }}
                  transition={{
                    backgroundPosition: {
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                    opacity: {
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                />

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-200%' }}
                    whileHover={{ x: '200%' }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                </div>
                <CardHeader>
                  <motion.div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center text-white mb-4 shadow-lg relative`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Pulsing glow behind icon */}
                    <motion.div
                      className="absolute inset-0 rounded-lg blur-md"
                      style={{
                        background: `linear-gradient(135deg, ${option.color})`,
                      }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative z-10">{option.icon}</span>
                  </motion.div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{option.title}</CardTitle>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <CheckCircle className="w-6 h-6 text-[hsl(var(--brand-500))]" />
                      </motion.div>
                    )}
                  </div>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                      Features:
                    </p>
                    {option.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + index * 0.05 }}
                      >
                        <Badge variant="secondary" className="mt-0.5 h-1.5 w-1.5 rounded-full p-0" />
                        <p className="text-sm">{feature}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            size="lg"
            onClick={handleRegister}
            disabled={!selectedRole || isRegistering || !wallet.connected}
            className="min-w-[200px] bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 hover:from-purple-500 hover:via-orange-500 hover:to-orange-400 shadow-lg shadow-purple-500/30 hover:shadow-orange-500/50 hover:shadow-2xl border-2 border-purple-500/30 transition-all duration-300 text-white font-bold"
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : !wallet.connected ? (
              'Connect Your Wallet'
            ) : !selectedRole ? (
              'Select Account Type'
            ) : (
              'Confirm Registration'
            )}
          </Button>
        </motion.div>
      </div>

      {selectedRole && !isRegistering && (
        <motion.div
          className="mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative group"
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-black/60 border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-600/25 group-hover:via-orange-500/20 group-hover:to-purple-600/25 group-hover:border-purple-400/50 group-hover:shadow-[0_0_30px_rgba(153,69,255,0.6),0_0_50px_rgba(255,107,53,0.4)]">
              {/* Internal animated gradient pulse */}
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none opacity-[0.06]"
                style={{
                  background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.12), rgba(255, 107, 53, 0.08))',
                  backgroundSize: '200% 200%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  opacity: [0.06, 0.12, 0.06],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  opacity: {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              />
              <CardHeader>
                <CardTitle className="text-lg">Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  • Your account type will determine the available features
                </p>
                <p>
                  • You will need to complete the KYC process to access all features
                </p>
                <p>
                  • Registration is done on the blockchain and cannot be easily changed
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
