"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useSRWAOperations } from "@/hooks/useSRWAOperations";
import { toast } from "sonner";
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  Eye, 
  EyeOff, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  BarChart3, 
  Shield, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

type PageType = 'overview' | 'tokens' | 'compliance' | 'identity' | 'analytics';

export default function SRWAContractDemo() {
  const [currentPage, setCurrentPage] = useState<PageType>('overview');
  const [showDetails, setShowDetails] = useState(true);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  // Estados dos formulários
  const [tokenForm, setTokenForm] = useState({
    name: "My SRWA Token",
    symbol: "MSRWA",
    decimals: 7,
    admin: "",
    complianceContract: ""
  });

  const [complianceForm, setComplianceForm] = useState({
    tokenAddress: "",
    from: "",
    to: "",
    amount: "1000000"
  });

  const [identityForm, setIdentityForm] = useState({
    address: "",
    identity: "John Doe",
    kycData: { verified: true, country: "US", tier: "1" }
  });

  const { wallet, connect, isConnected, disconnect } = useWallet();
  const {
    createToken,
    getTokenFactoryConfig,
    getCreatedTokens,
    checkCompliance,
    setComplianceRules,
    getComplianceRules,
    registerIdentity,
    getIdentity,
    updateIdentity,
    verifyIdentity,
    getSystemStatus,
    isLoading,
    error
  } = useSRWAOperations();

  // Token Factory Operations
  const handleCreateToken = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!tokenForm.name || !tokenForm.symbol || !tokenForm.admin || !tokenForm.complianceContract) {
      return toast.error("Please fill in all required fields");
    }

    try {
      console.log("🔗 [SRWA Demo] Creating token with form data:", tokenForm);
      
      const result = await createToken({
        name: tokenForm.name,
        symbol: tokenForm.symbol,
        decimals: tokenForm.decimals,
        admin: tokenForm.admin,
        complianceContract: tokenForm.complianceContract
      });

      setResults(prev => ({ ...prev, createToken: result }));
      
      if (result.success) {
        toast.success("Token created successfully!");
      }
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to create token:", error);
    }
  };

  const handleGetTokenFactoryConfig = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    try {
      console.log("🔗 [SRWA Demo] Getting token factory config");
      
      const result = await getTokenFactoryConfig();
      setResults(prev => ({ ...prev, getTokenFactoryConfig: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to get token factory config:", error);
    }
  };

  const handleGetCreatedTokens = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    try {
      console.log("🔗 [SRWA Demo] Getting created tokens");
      
      const result = await getCreatedTokens();
      setResults(prev => ({ ...prev, getCreatedTokens: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to get created tokens:", error);
    }
  };

  // Compliance Operations
  const handleCheckCompliance = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!complianceForm.tokenAddress || !complianceForm.from || !complianceForm.to || !complianceForm.amount) {
      return toast.error("Please fill in all compliance fields");
    }

    try {
      console.log("🔗 [SRWA Demo] Checking compliance with form data:", complianceForm);
      
      const result = await checkCompliance({
        tokenAddress: complianceForm.tokenAddress,
        from: complianceForm.from,
        to: complianceForm.to,
        amount: complianceForm.amount
      });

      setResults(prev => ({ ...prev, checkCompliance: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to check compliance:", error);
    }
  };

  const handleSetComplianceRules = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!complianceForm.tokenAddress) {
      return toast.error("Please enter token address");
    }

    try {
      console.log("🔗 [SRWA Demo] Setting compliance rules for token:", complianceForm.tokenAddress);
      
      const rules = {
        maxTransferAmount: "1000000000",
        requireKYC: true,
        allowedCountries: ["US", "CA", "EU"]
      };

      const result = await setComplianceRules(complianceForm.tokenAddress, rules);
      setResults(prev => ({ ...prev, setComplianceRules: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to set compliance rules:", error);
    }
  };

  const handleGetComplianceRules = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!complianceForm.tokenAddress) {
      return toast.error("Please enter token address");
    }

    try {
      console.log("🔗 [SRWA Demo] Getting compliance rules for token:", complianceForm.tokenAddress);
      
      const result = await getComplianceRules(complianceForm.tokenAddress);
      setResults(prev => ({ ...prev, getComplianceRules: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to get compliance rules:", error);
    }
  };

  // Identity Operations
  const handleRegisterIdentity = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!identityForm.address || !identityForm.identity) {
      return toast.error("Please fill in identity address and data");
    }

    try {
      console.log("🔗 [SRWA Demo] Registering identity with form data:", identityForm);
      
      const result = await registerIdentity({
        address: identityForm.address,
        identity: identityForm.identity,
        kycData: identityForm.kycData
      });

      setResults(prev => ({ ...prev, registerIdentity: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to register identity:", error);
    }
  };

  const handleGetIdentity = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!identityForm.address) {
      return toast.error("Please enter identity address");
    }

    try {
      console.log("🔗 [SRWA Demo] Getting identity for address:", identityForm.address);
      
      const result = await getIdentity(identityForm.address);
      setResults(prev => ({ ...prev, getIdentity: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to get identity:", error);
    }
  };

  const handleUpdateIdentity = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!identityForm.address || !identityForm.identity) {
      return toast.error("Please fill in identity address and data");
    }

    try {
      console.log("🔗 [SRWA Demo] Updating identity with form data:", identityForm);
      
      const result = await updateIdentity({
        address: identityForm.address,
        identity: identityForm.identity,
        kycData: identityForm.kycData
      });

      setResults(prev => ({ ...prev, updateIdentity: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to update identity:", error);
    }
  };

  const handleVerifyIdentity = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    if (!identityForm.address) {
      return toast.error("Please enter identity address");
    }

    try {
      console.log("🔗 [SRWA Demo] Verifying identity for address:", identityForm.address);
      
      const result = await verifyIdentity(identityForm.address);
      setResults(prev => ({ ...prev, verifyIdentity: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to verify identity:", error);
    }
  };

  // System Status
  const handleGetSystemStatus = async () => {
    if (!isConnected || !wallet) {
      return toast.error("Connect wallet first");
    }

    try {
      console.log("🔗 [SRWA Demo] Getting system status");
      
      const result = await getSystemStatus();
      setSystemStatus(result.result);
      setResults(prev => ({ ...prev, getSystemStatus: result }));
    } catch (error) {
      console.error("🔗 [SRWA Demo] Failed to get system status:", error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Wallet</p>
              <p className="text-lg font-semibold text-gray-900">
                {isConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Contracts</p>
              <p className="text-lg font-semibold text-gray-900">8 Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Operations</p>
              <p className="text-lg font-semibold text-gray-900">
                {Object.keys(results).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {isLoading ? "Loading..." : "Ready"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={handleGetSystemStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Status"}
          </button>
        </div>
        
        {systemStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([key, status]: [string, any]) => (
              <div key={key} className="flex items-center space-x-2">
                {status.status === "active" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">{key}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTokens = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Token Factory Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token Name</label>
            <input
              type="text"
              value={tokenForm.name}
              onChange={(e) => setTokenForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My SRWA Token"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol</label>
            <input
              type="text"
              value={tokenForm.symbol}
              onChange={(e) => setTokenForm(prev => ({ ...prev, symbol: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="MSRWA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Decimals</label>
            <input
              type="number"
              value={tokenForm.decimals}
              onChange={(e) => setTokenForm(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="7"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Address</label>
            <input
              type="text"
              value={tokenForm.admin}
              onChange={(e) => setTokenForm(prev => ({ ...prev, admin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GADMIN..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Contract</label>
            <input
              type="text"
              value={tokenForm.complianceContract}
              onChange={(e) => setTokenForm(prev => ({ ...prev, complianceContract: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CCOMPLIANCE..."
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleCreateToken}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Token"}
          </button>
          <button
            onClick={handleGetTokenFactoryConfig}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Get Config
          </button>
          <button
            onClick={handleGetCreatedTokens}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Get Tokens
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Compliance Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Token Address</label>
            <input
              type="text"
              value={complianceForm.tokenAddress}
              onChange={(e) => setComplianceForm(prev => ({ ...prev, tokenAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Token contract address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Address</label>
            <input
              type="text"
              value={complianceForm.from}
              onChange={(e) => setComplianceForm(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sender address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Address</label>
            <input
              type="text"
              value={complianceForm.to}
              onChange={(e) => setComplianceForm(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recipient address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="text"
              value={complianceForm.amount}
              onChange={(e) => setComplianceForm(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000000"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleCheckCompliance}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check Compliance"}
          </button>
          <button
            onClick={handleSetComplianceRules}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Set Rules
          </button>
          <button
            onClick={handleGetComplianceRules}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Get Rules
          </button>
        </div>
      </div>
    </div>
  );

  const renderIdentity = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Identity Operations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={identityForm.address}
              onChange={(e) => setIdentityForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="User address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Identity</label>
            <input
              type="text"
              value={identityForm.identity}
              onChange={(e) => setIdentityForm(prev => ({ ...prev, identity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRegisterIdentity}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Identity"}
          </button>
          <button
            onClick={handleGetIdentity}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Get Identity
          </button>
          <button
            onClick={handleUpdateIdentity}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Update Identity
          </button>
          <button
            onClick={handleVerifyIdentity}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Verify Identity
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Operation Results</h3>
        
        {Object.keys(results).length === 0 ? (
          <p className="text-gray-500">No operations performed yet. Try some operations above!</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(results).map(([operation, result]) => (
              <div key={operation} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{operation}</h4>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SRWA Contract Demo</h1>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Connected</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {wallet?.publicKey.slice(0, 8)}...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={connect}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'tokens', name: 'Tokens', icon: CreditCard },
                { id: 'compliance', name: 'Compliance', icon: Shield },
                { id: 'identity', name: 'Identity', icon: Wallet },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentPage(tab.id as PageType)}
                  className={`${
                    currentPage === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {currentPage === 'overview' && renderOverview()}
            {currentPage === 'tokens' && renderTokens()}
            {currentPage === 'compliance' && renderCompliance()}
            {currentPage === 'identity' && renderIdentity()}
            {currentPage === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
}
