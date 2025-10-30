import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { Loader2, DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getConfig, MarginfiClient, MarginfiAccountWrapper } from '@mrgnlabs/marginfi-client-v2';

// HARDCODED: wSOL (Wrapped SOL) para testes na devnet
const WSOL_MINT_DEVNET = new PublicKey('So11111111111111111111111111111111111111112');

type AccountInfo = {
  deposits: string;
  borrows: string;
  availableToBorrow: string;
  healthFactor: string;
};

export function MarginFiLendingManager() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [marginfiClient, setMarginfiClient] = useState<MarginfiClient | null>(null);
  const [marginfiAccount, setMarginfiAccount] = useState<MarginfiAccountWrapper | null>(null);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Initialize MarginFi Client
  useEffect(() => {
    if (!wallet.publicKey) return;

    const initClient = async () => {
      try {
        console.log('[MarginFi] Initializing client for devnet...');

        const config = getConfig('dev');
        const client = await MarginfiClient.fetch(config, wallet as any, connection);

        setMarginfiClient(client);
        console.log('[MarginFi] Client initialized:', client);

        // Log available banks
        console.log('[MarginFi] Available banks:');
        const banks = Array.from(client.banks.values());
        banks.forEach((bank) => {
          console.log(`  - ${bank.mint.toBase58()} (${bank.tokenSymbol || 'Unknown'})`);
        });

        // Try to load existing account
        await loadMarginfiAccount(client);
      } catch (error) {
        console.error('[MarginFi] Error initializing client:', error);
        toast.error('Error connecting to MarginFi');
      }
    };

    initClient();
  }, [wallet.publicKey, connection]);

  const loadMarginfiAccount = async (client: MarginfiClient) => {
    if (!wallet.publicKey) return;

    setLoadingAccount(true);
    try {
      const accounts = await client.getMarginfiAccountsForAuthority(wallet.publicKey);

      if (accounts.length > 0) {
        const account = accounts[0];
        setMarginfiAccount(account);
        console.log('[MarginFi] Account loaded:', account);

        await loadAccountInfo(account);
        toast.success('Conta MarginFi carregada!');
      } else {
        console.log('[MarginFi] No account found');
        setMarginfiAccount(null);
        setAccountInfo(null);
      }
    } catch (error) {
      console.error('[MarginFi] Error loading account:', error);
      setMarginfiAccount(null);
      setAccountInfo(null);
    } finally {
      setLoadingAccount(false);
    }
  };

  const loadAccountInfo = async (account: MarginfiAccountWrapper) => {
    try {
      // Get account balances
      const balances = account.balances;

      let totalDeposits = 0;
      let totalBorrows = 0;

      balances.forEach((balance) => {
        const depositValue = Number(balance.active ? balance.assetShares.toString() : '0') / 1e9;
        const borrowValue = Number(balance.active ? balance.liabilityShares.toString() : '0') / 1e9;

        totalDeposits += depositValue;
        totalBorrows += borrowValue;
      });

      // Calculate health factor (simplified)
      const healthFactor = totalBorrows > 0 ? (totalDeposits / totalBorrows * 100).toFixed(2) : '∞';
      const availableToBorrow = (totalDeposits * 0.75 - totalBorrows).toFixed(4);

      setAccountInfo({
        deposits: totalDeposits.toFixed(4),
        borrows: totalBorrows.toFixed(4),
        availableToBorrow: availableToBorrow,
        healthFactor: healthFactor,
      });
    } catch (error) {
      console.error('[MarginFi] Error loading account info:', error);
    }
  };

  const handleCreateAccount = async () => {
    if (!marginfiClient || !wallet.publicKey) {
      toast.error('Connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      toast.info('Creating MarginFi account...');

      const account = await marginfiClient.createMarginfiAccount();
      setMarginfiAccount(account);

      toast.success('Conta MarginFi criada com sucesso!');
      console.log('[MarginFi] Account created:', account);

      await loadAccountInfo(account);
    } catch (error: any) {
      console.error('[MarginFi] Error creating account:', error);

      // Check if account already exists
      if (error.message?.includes('already been processed')) {
        toast.info('Account already exists! Trying to load...');
        await loadMarginfiAccount(marginfiClient);
      } else {
        toast.error('Error creating account: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!marginfiAccount || !wallet.publicKey) {
      toast.error('Crie uma conta MarginFi primeiro');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Enter a valid amount to deposit');
      return;
    }

    setLoading(true);
    try {
      toast.info('Depositando no MarginFi...');

      // Get the bank for wSOL
      const banks = marginfiClient?.banks;
      const solBank = Array.from(banks?.values() || []).find(
        (bank) => bank.mint.equals(WSOL_MINT_DEVNET)
      );

      if (!solBank) {
        throw new Error('wSOL bank not found in MarginFi');
      }

      const amount = parseFloat(depositAmount);
      await marginfiAccount.deposit(amount, solBank.address);

      toast.success(`${amount} SOL depositado com sucesso!`);
      console.log('[MarginFi] Deposit successful');

      // Reload account info
      await loadAccountInfo(marginfiAccount);
      setDepositAmount('');
    } catch (error: any) {
      console.error('[MarginFi] Deposit error:', error);

      // Parse error messages
      let errorMsg = 'Error depositing';

      if (error.message?.includes('User rejected')) {
        errorMsg = 'Transação cancelada pelo usuário';
      } else if (error.message?.includes('insufficient')) {
        errorMsg = 'Saldo insuficiente na wallet';
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!marginfiAccount || !wallet.publicKey) {
      toast.error('Crie uma conta MarginFi primeiro');
      return;
    }

    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast.error('Enter a valid amount to borrow');
      return;
    }

    // Check if user has deposits
    if (!accountInfo || parseFloat(accountInfo.deposits) === 0) {
      toast.error('You need to deposit SOL first to use as collateral!');
      return;
    }

    const amount = parseFloat(borrowAmount);
    const maxBorrow = parseFloat(accountInfo.availableToBorrow);

    if (amount > maxBorrow) {
      toast.error(`You can only borrow up to ${maxBorrow.toFixed(4)} SOL (75% of your deposit)`);
      return;
    }

    setLoading(true);
    try {
      toast.info('Borrowing...');

      // Get the bank for wSOL
      const banks = marginfiClient?.banks;
      const solBank = Array.from(banks?.values() || []).find(
        (bank) => bank.mint.equals(WSOL_MINT_DEVNET)
      );

      if (!solBank) {
        throw new Error('wSOL bank not found in MarginFi');
      }

      console.log(`[MarginFi] Borrowing ${amount} SOL (max: ${maxBorrow})`);
      console.log('[MarginFi] SOL Bank details:', {
        address: solBank.address.toBase58(),
        mint: solBank.mint.toBase58(),
        symbol: solBank.tokenSymbol,
        assetWeightInit: solBank.config.assetWeightInit.toString(),
        assetWeightMaint: solBank.config.assetWeightMaint.toString(),
        liabilityWeightInit: solBank.config.liabilityWeightInit.toString(),
        liabilityWeightMaint: solBank.config.liabilityWeightMaint.toString(),
        borrowLimit: solBank.config.borrowLimit.toString(),
      });

      await marginfiAccount.borrow(amount, solBank.address);

      toast.success(`${amount} SOL emprestado com sucesso!`);
      console.log('[MarginFi] Borrow successful');

      // Reload account info
      await loadAccountInfo(marginfiAccount);
      setBorrowAmount('');
    } catch (error: any) {
      console.error('[MarginFi] Borrow error:', error);

      // Parse MarginFi error codes
      let errorMsg = 'Error borrowing';

      if (error.message?.includes('Custom":2000')) {
        errorMsg = 'Collateral insuficiente! Deposite mais SOL primeiro.';
      } else if (error.message?.includes('User rejected')) {
        errorMsg = 'Transação cancelada pelo usuário';
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!marginfiAccount || !wallet.publicKey) {
      toast.error('Crie uma conta MarginFi primeiro');
      return;
    }

    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      toast.error('Enter a valid amount to repay');
      return;
    }

    // Check if user has active borrows
    if (!accountInfo || parseFloat(accountInfo.borrows) === 0) {
      toast.error('You have no active loans to repay!');
      return;
    }

    const amount = parseFloat(repayAmount);
    const totalBorrows = parseFloat(accountInfo.borrows);

    if (amount > totalBorrows) {
      toast.error(`You only owe ${totalBorrows.toFixed(4)} SOL. Cannot repay more than that.`);
      return;
    }

    setLoading(true);
    try {
      toast.info('Repaying loan...');

      // Get the bank for wSOL
      const banks = marginfiClient?.banks;
      const solBank = Array.from(banks?.values() || []).find(
        (bank) => bank.mint.equals(WSOL_MINT_DEVNET)
      );

      if (!solBank) {
        throw new Error('wSOL bank not found in MarginFi');
      }

      const amount = parseFloat(repayAmount);
      await marginfiAccount.repay(amount, solBank.address);

      toast.success(`${amount} SOL pago com sucesso!`);
      console.log('[MarginFi] Repay successful');

      // Reload account info
      await loadAccountInfo(marginfiAccount);
      setRepayAmount('');
    } catch (error: any) {
      console.error('[MarginFi] Repay error:', error);

      // Parse error messages
      let errorMsg = 'Error repaying';

      if (error.message?.includes('Custom":6024')) {
        errorMsg = 'Você não tem empréstimos ativos! Faça um borrow primeiro.';
      } else if (error.message?.includes('User rejected')) {
        errorMsg = 'Transação cancelada pelo usuário';
      } else if (error.message?.includes('insufficient')) {
        errorMsg = 'Saldo insuficiente para pagar o empréstimo';
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!marginfiAccount || !wallet.publicKey) {
      toast.error('Crie uma conta MarginFi primeiro');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Enter a valid amount to withdraw');
      return;
    }

    // Check if user has deposits
    if (!accountInfo || parseFloat(accountInfo.deposits) === 0) {
      toast.error('You have no deposits to withdraw!');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const totalDeposits = parseFloat(accountInfo.deposits);
    const totalBorrows = parseFloat(accountInfo.borrows);

    if (amount > totalDeposits) {
      toast.error(`You only have ${totalDeposits.toFixed(4)} SOL deposited.`);
      return;
    }

    // Check if withdrawal would break health factor
    if (totalBorrows > 0) {
      const remainingDeposits = totalDeposits - amount;
      const newHealthFactor = (remainingDeposits / totalBorrows) * 100;

      if (newHealthFactor < 120) { // Safe margin above 100%
        toast.error(`Withdrawal blocked! Health factor would be ${newHealthFactor.toFixed(0)}% (minimum: 120%). Repay your loans first.`);
        return;
      }
    }

    setLoading(true);
    try {
      toast.info('Retirando do MarginFi...');

      // Get the bank for wSOL
      const banks = marginfiClient?.banks;
      const solBank = Array.from(banks?.values() || []).find(
        (bank) => bank.mint.equals(WSOL_MINT_DEVNET)
      );

      if (!solBank) {
        throw new Error('wSOL bank not found in MarginFi');
      }

      const amount = parseFloat(withdrawAmount);
      await marginfiAccount.withdraw(amount, solBank.address);

      toast.success(`${amount} SOL retirado com sucesso!`);
      console.log('[MarginFi] Withdraw successful');

      // Reload account info
      await loadAccountInfo(marginfiAccount);
      setWithdrawAmount('');
    } catch (error: any) {
      console.error('[MarginFi] Withdraw error:', error);

      // Parse MarginFi error codes
      let errorMsg = 'Error withdrawing';

      if (error.message?.includes('Custom":2000')) {
        errorMsg = 'Não é possível retirar! Você tem empréstimos ativos ou saldo insuficiente.';
      } else if (error.message?.includes('User rejected')) {
        errorMsg = 'Transação cancelada pelo usuário';
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = marginfiAccount ? 'bg-green-400' : 'bg-amber-400';
  const statusLabel = marginfiAccount ? 'Active' : 'Setup';

  const formatSol = (value: string) => {
    const parsed = parseFloat(value || '0');
    if (!Number.isFinite(parsed)) return '0.0000 SOL';
    return `${parsed.toFixed(4)} SOL`;
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/20 transition-all hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-400/10">
      <CardContent className="space-y-6 p-6">
        <div>
          <div className="mb-3 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-400">
                <DollarSign className="h-4 w-4" />
                <span>MarginFi</span>
              </div>
              <h3 className="text-lg font-semibold leading-tight text-foreground">
                MarginFi Lending & Borrowing
              </h3>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Devnet</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${statusColor}`} />
              <span className="text-xs uppercase text-muted-foreground">{statusLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs">Official</Badge>
            <Badge variant="secondary" className="text-xs">MarginFi</Badge>
            <Badge variant="outline" className="text-xs">Lending</Badge>
          </div>
        </div>

        {loadingAccount ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
          </div>
        ) : marginfiAccount ? (
          <>
            {accountInfo ? (
              <div className="grid gap-4 rounded-xl border border-border/40 bg-background/40 p-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Deposits</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatSol(accountInfo.deposits)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Borrows</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatSol(accountInfo.borrows)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Available to Borrow
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {formatSol(accountInfo.availableToBorrow)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Health Factor</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {accountInfo.healthFactor}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
                Carregando posição MarginFi...
              </div>
            )}

            <div className="space-y-4 rounded-xl border border-border/40 bg-background/40 p-4">
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/40">
                  <TabsTrigger value="deposit" className="text-xs uppercase">
                    <ArrowDownCircle className="mr-2 h-4 w-4" />
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="text-xs uppercase">
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                    Withdraw
                  </TabsTrigger>
                  <TabsTrigger value="borrow" className="text-xs uppercase">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Borrow
                  </TabsTrigger>
                  <TabsTrigger value="repay" className="text-xs uppercase">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Repay
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="pt-4">
                  <div className="space-y-4 rounded-xl bg-muted/20 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="depositAmount">Quantidade (SOL)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="any"
                        placeholder="0.1"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Deposite SOL para usar como collateral
                      </p>
                    </div>
                    <Button
                      onClick={handleDeposit}
                      disabled={loading || !wallet.connected}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Depositando...
                        </>
                      ) : (
                        'Depositar SOL'
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="pt-4">
                  <div className="space-y-4 rounded-xl bg-muted/20 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdrawAmount">Quantidade (SOL)</Label>
                      <Input
                        id="withdrawAmount"
                        type="number"
                        step="any"
                        placeholder="0.05"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Retire seus depósitos (respeitando health factor)
                      </p>
                    </div>
                    <Button
                      onClick={handleWithdraw}
                      disabled={loading || !wallet.connected}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Retirando...
                        </>
                      ) : (
                        'Retirar SOL'
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="borrow" className="pt-4">
                  <div className="space-y-4 rounded-xl bg-muted/20 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="borrowAmount">Quantidade (SOL)</Label>
                      <Input
                        id="borrowAmount"
                        type="number"
                        step="any"
                        placeholder="0.01"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Tome emprestado SOL usando seu depósito como collateral
                      </p>
                    </div>
                    <Button
                      onClick={handleBorrow}
                      disabled={loading || !wallet.connected}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Tomando Empréstimo...
                        </>
                      ) : (
                        'Tomar Empréstimo'
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="repay" className="pt-4">
                  <div className="space-y-4 rounded-xl bg-muted/20 p-4">
                    <div className="space-y-2">
                      <Label htmlFor="repayAmount">Quantidade (SOL)</Label>
                      <Input
                        id="repayAmount"
                        type="number"
                        step="any"
                        placeholder="0.01"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Pague seu empréstimo para melhorar o health factor
                      </p>
                    </div>
                    <Button
                      onClick={handleRepay}
                      disabled={loading || !wallet.connected}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Pagando...
                        </>
                      ) : (
                        'Pagar Empréstimo'
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="space-y-4 rounded-xl border border-dashed border-brand-400/40 bg-brand-400/10 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Crie sua conta MarginFi para visualizar métricas e operar diretamente deste painel.
            </p>
            <Button
              onClick={handleCreateAccount}
              disabled={loading || !wallet.connected}
              className="w-full justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Criar Conta MarginFi'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
