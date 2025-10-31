import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useProgramsSafe } from '@/contexts/ProgramContext';
import { getProvider } from '@/lib/solana/anchor';
import { AdminAllowlistServiceImpl } from '@/lib/solana/adminAllowlist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, UserPlus, UserMinus, Loader2, Crown, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useKYCStatus } from '@/hooks/solana/useKYCStatus';
import { useUserRegistry } from '@/hooks/solana/useUserRegistry';

export function AdminAllowlistPanel() {
  const wallet = useAnchorWallet();
  const { programs, hasPrograms } = useProgramsSafe();
  const [adminService, setAdminService] = useState<AdminAllowlistServiceImpl | null>(null);
  const [adminRegistry, setAdminRegistry] = useState<any>(null);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);

  // KYC hooks
  const { kycStatus, checkKYCStatus } = useKYCStatus();
  const { completeKYC } = useUserRegistry();

  useEffect(() => {
    if (wallet && hasPrograms && programs.srwaFactory) {
      const provider = getProvider(wallet);
      const service = new AdminAllowlistServiceImpl(programs.srwaFactory, provider);
      setAdminService(service);
      loadAdminRegistry(service);
    }
  }, [wallet, hasPrograms, programs]);

  const loadAdminRegistry = async (service: AdminAllowlistServiceImpl) => {
    try {
      const registry = await service.getAdminRegistry();
      setAdminRegistry(registry);
    } catch (error) {
      console.error('Error loading admin registry:', error);
    }
  };

  const handleInitializeRegistry = async () => {
    if (!adminService) return;

    setLoading(true);
    try {
      const tx = await adminService.initializeAdminRegistry();
      toast.success(`Registry initialized! TX: ${tx.slice(0, 8)}...`);
      await loadAdminRegistry(adminService);
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize registry');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminService || !newAdminAddress) return;

    setLoading(true);
    try {
      const adminPubkey = new PublicKey(newAdminAddress);
      const tx = await adminService.addPlatformAdmin(adminPubkey);
      toast.success(`Admin added! TX: ${tx.slice(0, 8)}...`);
      setNewAdminAddress('');
      await loadAdminRegistry(adminService);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminAddress: string) => {
    if (!adminService) return;

    setLoading(true);
    try {
      const adminPubkey = new PublicKey(adminAddress);
      const tx = await adminService.removePlatformAdmin(adminPubkey);
      toast.success(`Admin removed! TX: ${tx.slice(0, 8)}...`);
      await loadAdminRegistry(adminService);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove admin');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteKYC = async () => {
    setKycLoading(true);
    try {
      await completeKYC();
      toast.success('KYC completed successfully!');
      await checkKYCStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete KYC');
    } finally {
      setKycLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-h1 font-semibold text-fg-primary flex items-center gap-2">
          <Shield className="h-8 w-8 text-brand-400" />
          Platform Admin Allowlist
        </h2>
        <p className="text-body-1 text-fg-secondary mt-2">
          Manage authorized platform administrators
        </p>
      </div>

      {/* KYC Status Card */}
      {wallet && !kycStatus.loading && (
        <Card className={kycStatus.hasKYC ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/10'}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {kycStatus.hasKYC ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="font-semibold text-green-400">KYC Verified</p>
                      <p className="text-sm text-fg-secondary">
                        All required KYC registries are active
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="font-semibold text-amber-400">KYC Required</p>
                      <p className="text-sm text-fg-secondary">
                        {!kycStatus.hasFactoryKYC && !kycStatus.hasControllerKYC && 'Complete KYC to enable token transfers'}
                        {kycStatus.hasFactoryKYC && !kycStatus.hasControllerKYC && 'Controller KYC Registry missing - click to sync'}
                        {!kycStatus.hasFactoryKYC && kycStatus.hasControllerKYC && 'Factory User Registry missing - click to sync'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!kycStatus.hasKYC && (
                <Button
                  onClick={handleCompleteKYC}
                  disabled={kycLoading}
                  className="btn-primary"
                >
                  {kycLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete KYC'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!adminRegistry ? (
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <Shield className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200">
            <p className="mb-4">Admin registry not initialized yet.</p>
            <Button
              onClick={handleInitializeRegistry}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Initialize Admin Registry
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Super Admin
              </CardTitle>
              <CardDescription>Root administrator with full permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-bg-elev-2 rounded-lg">
                <p className="font-mono text-sm text-fg-primary break-all">
                  {adminRegistry.superAdmin.toString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-400" />
                Add New Admin
              </CardTitle>
              <CardDescription>Grant admin privileges to a new wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newAdminAddress}
                  onChange={(e) => setNewAdminAddress(e.target.value)}
                  placeholder="Enter admin public key (Solana address)"
                  className="flex-1"
                />
                <Button
                  onClick={handleAddAdmin}
                  disabled={loading || !newAdminAddress}
                  className="btn-primary"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Admin
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-400" />
                Authorized Admins
                <Badge variant="outline" className="ml-2">
                  {adminRegistry.authorizedAdmins.length}
                </Badge>
              </CardTitle>
              <CardDescription>List of all authorized platform administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adminRegistry.authorizedAdmins.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-fg-muted mx-auto mb-4 opacity-50" />
                    <p className="text-body-1 text-fg-muted">No admins added yet</p>
                  </div>
                ) : (
                  adminRegistry.authorizedAdmins.map((admin: PublicKey, index: number) => {
                    const isSuperAdmin = admin.toString() === adminRegistry.superAdmin.toString();
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-bg-elev-1 border border-border-subtle rounded-lg hover-lift"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isSuperAdmin ? (
                            <Crown className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                          ) : (
                            <Shield className="h-5 w-5 text-brand-400 flex-shrink-0" />
                          )}
                          <span className="font-mono text-sm text-fg-primary break-all">
                            {admin.toString()}
                          </span>
                          {isSuperAdmin && (
                            <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 bg-yellow-500/10">
                              Super Admin
                            </Badge>
                          )}
                        </div>
                        {!isSuperAdmin && (
                          <Button
                            onClick={() => handleRemoveAdmin(admin.toString())}
                            disabled={loading}
                            variant="destructive"
                            size="sm"
                            className="ml-4"
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
