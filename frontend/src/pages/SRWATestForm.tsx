import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Wallet, Copy, ExternalLink } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useProvider } from '@/hooks/useProvider';
import { toast } from 'sonner';

// Contract IDs - using working IDs from useProvider
const CONTRACT_IDS = {
  tokenFactory: "CAHRDR3I4NT5TVHEOS22UMS7SSHCU3CDTMXGBW4R7FNDEHCO5AZLOCOA", // ✅ CLI Working
  complianceCore: "CDMM3DRN7IRDTBQUHCS5CARLFBLECC4XPPYOTMHERHCVJBSHTTUO75FA", // ✅ CLI Working
  identityRegistry: "CBJSAOFZWWDNWJI5QEFBHYLEIBHXOHN4B5DDI6DJBSYRQ6ROU3YXJ36E", // ✅ CLI Working
  claimTopicsRegistry: "CADQZX6IIPAVVOJ6SVZFGXK374UE5KXDFKBB6VRVVCSFPS2OLTRHS3NT",
  trustedIssuersRegistry: "CDTBD2II6JGXHPDGMFWAQE2SRYXOCENGIE2Z5WHWNM6UG34BX5SQTDRN",
  complianceModules: "CC3PYCRZ5ULYSFYI4L5FFZQL2K6VKVUDKUYXWZEPNFLEWGQ35UDN6QY3",
  integrations: "CC3PXDZGOPJ6PJTRBEWRPFXRHFKJOFTK2CEAACR4KQQT7A6IB6YGUJUY", // ✅ CLI Working
  srwaToken: "CCJGETMTUTETF3QV7EKVE6EIKD45TL2JWYF4VUCCXO3EVPPRRAMPAJ4O", // ✅ CLI Working
  newSrwaToken: "CC6SV375E33YP33UP5SPANV2RDJ2ZDXNLVEZCYYSDNISSWIIBP56UJJJ", // ✅ NOVO TOKEN
};

export default function SRWATestForm() {
  const { wallet, connect, isConnected } = useWallet();
  const { contract, signAndSend } = useProvider();
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    // Token creation
    name: '',
    symbol: '',
    decimals: '',
    admin: '',
    complianceContract: '',
    
    // Token operations
    tokenAddress: '',
    mintTo: '',
    mintAmount: '',
    
    // Transfer
    transferFrom: '',
    transferTo: '',
    transferAmount: '',
    
    // Identity
    identityAddress: '',
    identityName: '',
    topicId: '',
    claimData: '',
    validUntil: '',
    
    // Token selection
    useNewToken: false,
  });

  // All fields will be filled manually by the user

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: field === 'useNewToken' ? value === 'true' : value 
    }));
  };

  const handleOperation = async (operationName: string, operation: () => Promise<any>) => {
    if (!isConnected || !wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🔗 [SRWA Test] Starting ${operationName}`, {
        publicKey: wallet.publicKey,
        isConnected,
        timestamp: new Date().toISOString()
      });

      const result = await operation();
      setResult(result);
      
      console.log(`🔗 [SRWA Test] Successfully completed ${operationName}`, result);
      toast.success(`${operationName} completed successfully!`);
      
    } catch (err) {
      console.error(`🔗 [SRWA Test] Failed ${operationName}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`${operationName} failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Operations
  const createToken = async () => {
    await handleOperation("Create Token", async () => {
      // Use the selected token contract
      const tokenContractId = formData.useNewToken ? CONTRACT_IDS.newSrwaToken : CONTRACT_IDS.srwaToken;
      const tokenContract = contract(tokenContractId, wallet.publicKey);
      
      // Initialize the token directly (like CLI approach)
      const tx = await tokenContract.initialize({
        name: formData.name,
        symbol: formData.symbol,
        decimals: parseInt(formData.decimals) || 0,
        admin: formData.admin,
        compliance_contract: formData.complianceContract,
      });

      const hash = await signAndSend(tx, wallet);
      
      // Update form data with the token address that was just initialized
      setFormData(prev => ({ ...prev, tokenAddress: tokenContractId }));
      
      return { success: true, transactionHash: hash, operation: 'createToken', tokenAddress: tokenContractId };
    });
  };

  const mintTokens = async () => {
    await handleOperation("Mint Tokens", async () => {
      const tokenContract = contract(formData.tokenAddress, wallet.publicKey);
      
      const tx = await tokenContract.mint({
        to: formData.mintTo,
        amount: formData.mintAmount,
      });

      const hash = await signAndSend(tx, wallet);
      return { success: true, transactionHash: hash, operation: 'mint' };
    });
  };

  const transferTokens = async () => {
    await handleOperation("Transfer Tokens", async () => {
      const tokenContract = contract(formData.tokenAddress, wallet.publicKey);
      
      const tx = await tokenContract.transfer({
        from: formData.transferFrom,
        to: formData.transferTo,
        amount: formData.transferAmount,
      });

      const hash = await signAndSend(tx, wallet);
      return { success: true, transactionHash: hash, operation: 'transfer' };
    });
  };

  const getBalance = async () => {
    await handleOperation("Get Balance", async () => {
      const tokenContract = contract(formData.tokenAddress, wallet.publicKey);
      
      const sim = await tokenContract.balance({
        id: formData.mintTo,
      });

      if (!sim.simulation?.result.retval) {
        throw new Error("No balance found");
      }

      const balance = sim.simulation.result.retval;
      return { success: true, balance, operation: 'balance' };
    });
  };

  const addClaim = async () => {
    await handleOperation("Add Claim", async () => {
      const identityContract = contract(CONTRACT_IDS.identityRegistry, wallet.publicKey);
      
      const tx = await identityContract.addClaim({
        subject: formData.identityAddress,
        issuer: formData.identityAddress,
        topicId: parseInt(formData.topicId) || 1,
        data: formData.claimData,
        validUntil: parseInt(formData.validUntil) || 0,
      });

      const hash = await signAndSend(tx, wallet);
      return { success: true, transactionHash: hash, operation: 'addClaim' };
    });
  };

  const addClaimTopic = async () => {
    await handleOperation("Add Claim Topic", async () => {
      const claimTopicsContract = contract(CONTRACT_IDS.claimTopicsRegistry, wallet.publicKey);
      
      const tx = await claimTopicsContract.addClaimTopic({
        topicId: parseInt(formData.topicId) || 1,
        topicName: "RWA Verification",
      });

      const hash = await signAndSend(tx, wallet);
      return { success: true, transactionHash: hash, operation: 'addClaimTopic' };
    });
  };

  const addTrustedIssuer = async () => {
    await handleOperation("Add Trusted Issuer", async () => {
      const trustedIssuersContract = contract(CONTRACT_IDS.trustedIssuersRegistry, wallet.publicKey);
      
      const tx = await trustedIssuersContract.addTrustedIssuer({
        issuer: formData.identityAddress,
        topicId: parseInt(formData.topicId) || 1,
      });

      const hash = await signAndSend(tx, wallet);
      return { success: true, transactionHash: hash, operation: 'addTrustedIssuer' };
    });
  };

  const bindToken = async () => {
    await handleOperation("Bind Token", async () => {
      const complianceContract = contract(CONTRACT_IDS.complianceCore, wallet.publicKey);
      
      const tx = await complianceContract.bindToken({
        token: formData.tokenAddress,
      });

      const hash = await signAndSend(tx, wallet);
      return { success: true, transactionHash: hash, operation: 'bindToken' };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="card-institutional bg-gradient-to-br from-bg-elev-1 to-bg-elev-2 border-brand-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-h2 text-fg-primary mb-2">SRWA Test Form</CardTitle>
            <p className="text-body-1 text-fg-secondary">
              Connect your wallet to test SRWA operations
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={connect}
              disabled={isLoading}
              className="btn-primary px-8 py-3 min-w-40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect Wallet
                  <Wallet className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-display-1 font-semibold text-fg-primary mb-4">
          SRWA Test Form
          <span className="block text-brand-400 text-h1 mt-2">
            🧪 CLI Operations via Frontend
          </span>
        </h1>
        <p className="text-body-1 text-fg-secondary max-w-2xl mx-auto mb-4">
          Test all SRWA operations from your CLI README via this frontend form
        </p>
        <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
          Wallet Connected: {wallet?.publicKey.slice(0, 8)}...
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Token Creation */}
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 text-fg-primary">1. Token Creation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Token Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter token name"
                />
              </div>
              <div>
                <Label>Symbol</Label>
                <Input
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="Enter token symbol"
                />
              </div>
              <div>
                <Label>Decimals</Label>
                <Input
                  type="number"
                  value={formData.decimals}
                  onChange={(e) => handleInputChange('decimals', e.target.value)}
                  placeholder="e.g., 7"
                />
              </div>
              <div>
                <Label>Admin Address</Label>
                <Input
                  value={formData.admin}
                  onChange={(e) => handleInputChange('admin', e.target.value)}
                  placeholder="Enter admin address"
                />
              </div>
              <div>
                <Label>Compliance Contract</Label>
                <Input
                  value={formData.complianceContract}
                  onChange={(e) => handleInputChange('complianceContract', e.target.value)}
                  placeholder="Enter compliance contract address"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useNewToken"
                  checked={formData.useNewToken}
                  onChange={(e) => handleInputChange('useNewToken', e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="useNewToken" className="text-sm">
                  Use New Token Contract
                </Label>
              </div>
              <div className="text-xs text-fg-muted">
                Selected: {formData.useNewToken ? 'newSrwaToken' : 'srwaToken'} - {formData.useNewToken ? CONTRACT_IDS.newSrwaToken : CONTRACT_IDS.srwaToken}
              </div>
              <Button
                onClick={createToken}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Token
              </Button>
            </CardContent>
          </Card>

          {/* Token Operations */}
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 text-fg-primary">2. Token Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Token Address</Label>
                <Input
                  value={formData.tokenAddress}
                  onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
                  placeholder="Enter token contract address"
                />
              </div>
              <div>
                <Label>Mint To</Label>
                <Input
                  value={formData.mintTo}
                  onChange={(e) => handleInputChange('mintTo', e.target.value)}
                  placeholder="Enter recipient address"
                />
              </div>
              <div>
                <Label>Mint Amount</Label>
                <Input
                  value={formData.mintAmount}
                  onChange={(e) => handleInputChange('mintAmount', e.target.value)}
                  placeholder="Enter amount to mint"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={mintTokens}
                  disabled={isLoading}
                  variant="outline"
                >
                  Mint Tokens
                </Button>
                <Button
                  onClick={getBalance}
                  disabled={isLoading}
                  variant="outline"
                >
                  Get Balance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transfer */}
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 text-fg-primary">3. Transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>From</Label>
                <Input
                  value={formData.transferFrom}
                  onChange={(e) => handleInputChange('transferFrom', e.target.value)}
                  placeholder="Enter sender address"
                />
              </div>
              <div>
                <Label>To</Label>
                <Input
                  value={formData.transferTo}
                  onChange={(e) => handleInputChange('transferTo', e.target.value)}
                  placeholder="Enter recipient address"
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  value={formData.transferAmount}
                  onChange={(e) => handleInputChange('transferAmount', e.target.value)}
                  placeholder="Enter transfer amount"
                />
              </div>
              <Button
                onClick={transferTokens}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                Transfer Tokens
              </Button>
            </CardContent>
          </Card>

          {/* Identity & Compliance */}
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 text-fg-primary">4. Identity & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Identity Address</Label>
                <Input
                  value={formData.identityAddress}
                  onChange={(e) => handleInputChange('identityAddress', e.target.value)}
                  placeholder="Enter identity address"
                />
              </div>
              <div>
                <Label>Topic ID</Label>
                <Input
                  type="number"
                  value={formData.topicId}
                  onChange={(e) => handleInputChange('topicId', e.target.value)}
                  placeholder="Enter topic ID (e.g., 1)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={addClaimTopic}
                  disabled={isLoading}
                  variant="outline"
                >
                  Add Claim Topic
                </Button>
                <Button
                  onClick={addTrustedIssuer}
                  disabled={isLoading}
                  variant="outline"
                >
                  Add Trusted Issuer
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={addClaim}
                  disabled={isLoading}
                  variant="outline"
                >
                  Add Claim
                </Button>
                <Button
                  onClick={bindToken}
                  disabled={isLoading}
                  variant="outline"
                >
                  Bind Token
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Results */}
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 text-fg-primary">Results</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-semibold text-green-400">
                        {result.operation} completed successfully!
                      </span>
                    </div>
                    {result.transactionHash && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-fg-muted">Transaction Hash:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.transactionHash)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <code className="text-xs bg-bg-elev-3 p-2 rounded block break-all">
                          {result.transactionHash}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(
                            `https://stellar.expert/explorer/testnet/tx/${result.transactionHash}`,
                            '_blank'
                          )}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </Button>
                      </div>
                    )}
                    {result.balance && (
                      <div className="mt-2">
                        <span className="text-sm text-fg-muted">Balance: </span>
                        <span className="font-mono text-sm">{result.balance}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!result && !error && (
                <div className="text-center text-fg-muted py-8">
                  <p>No operations performed yet.</p>
                  <p className="text-sm">Use the forms on the left to test SRWA operations.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract IDs Reference */}
          <Card className="card-institutional">
            <CardHeader>
              <CardTitle className="text-h3 text-fg-primary">Contract IDs (CLI Working)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(CONTRACT_IDS).map(([name, id]) => (
                <div key={name} className="flex items-center justify-between p-2 bg-bg-elev-3 rounded">
                  <span className="text-sm font-medium">{name}:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs">{id.slice(0, 8)}...</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
