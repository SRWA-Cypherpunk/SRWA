import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Wallet, Loader2, Info } from 'lucide-react';
import { useWallet } from '@/components/wallet/WalletProvider';

import { TokenCreationForm } from '@/types/srwa-contracts';
import { RWATemplate } from '@/types/templates';

interface BasicConfigurationProps {
  formData: TokenCreationForm;
  template: RWATemplate;
  onChange: (updates: Partial<TokenCreationForm>) => void;
}

export default function BasicConfiguration({ formData, template, onChange }: BasicConfigurationProps) {
  const { isConnected, address, isConnecting, connect } = useWallet();
  const [isWalletAddressUsed, setIsWalletAddressUsed] = useState(false);

  useEffect(() => {
    if (isConnected && address && !formData.admin) {
      onChange({ admin: address });
      setIsWalletAddressUsed(true);
    }
  }, [isConnected, address, formData.admin, onChange]);

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleUseWallet = () => {
    if (address) {
      onChange({ admin: address });
      setIsWalletAddressUsed(true);
    }
  };

  const validateSymbol = (symbol: string): string | null => {
    if (!symbol) return null;
    if (symbol.length < 2 || symbol.length > 12) {
      return 'Symbol must be between 2 and 12 characters';
    }
    if (!/^[A-Z0-9]+$/.test(symbol)) {
      return 'Symbol must contain only uppercase letters and numbers';
    }
    return null;
  };

  const validateDecimals = (decimals: number): string | null => {
    if (decimals < 0 || decimals > 18) {
      return 'Decimals must be between 0 and 18';
    }
    return null;
  };

  const validateAddress = (address: string): string | null => {
    if (!address) return null;
    if (!address.startsWith('G') || address.length !== 56) {
      return 'Invalid Stellar address format';
    }
    return null;
  };

  const symbolError = validateSymbol(formData.symbol);
  const decimalsError = validateDecimals(formData.decimals);
  const addressError = validateAddress(formData.admin);

  // Inline styles to avoid CSS conflicts
  const cardStyle = {
    backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
    border: '1px solid hsl(222, 23%, 14%)', // stroke-line
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    position: 'relative' as const,
    zIndex: 1
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid hsl(222, 23%, 14%)', // stroke-line
    borderRadius: '8px',
    backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1
    color: '#ffffff',
    position: 'relative' as const,
    zIndex: 10,
    pointerEvents: 'auto' as const
  };

  const inputStyleError = {
    ...inputStyle,
    borderColor: '#ef4444'
  };

  return (
    <div style={{ padding: '0', position: 'relative', zIndex: 1 }}>
      {/* Template Information */}
      <div style={cardStyle}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px' }}>{template.icon}</span>
            Selected Template: {template.name}
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px' }}>
            {template.description}
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {template.features.map((feature) => (
            <Badge 
              key={feature.id}
              variant={feature.enabled_by_default ? "default" : "secondary"}
              style={{ position: 'relative', zIndex: 5 }}
            >
              {feature.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Token Configuration */}
      <div style={cardStyle}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            Token Configuration
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px' }}>
            Configure the basic properties of your RWA token
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Token Name */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Label 
              htmlFor="name" 
              style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff' }}
            >
              Token Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Real Estate Investment Token"
              value={formData.name || ''}
              onChange={(e) => {
                console.log('✅ Name changed:', e.target.value);
                onChange({ name: e.target.value });
              }}
              style={inputStyle}
            />
            <p style={{ fontSize: '14px', color: '#d1d5db', marginTop: '4px' }}>
              The full name of your token (e.g., "US Treasury Bill Token")
            </p>
          </div>

          {/* Token Symbol */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Label 
              htmlFor="symbol" 
              style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff' }}
            >
              Token Symbol *
            </Label>
            <Input
              id="symbol"
              type="text"
              placeholder="e.g., REIT"
              value={formData.symbol || ''}
              onChange={(e) => {
                console.log('✅ Symbol changed:', e.target.value);
                onChange({ symbol: e.target.value.toUpperCase() });
              }}
              maxLength={12}
              style={symbolError ? inputStyleError : inputStyle}
            />
            {symbolError && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                {symbolError}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#d1d5db', marginTop: '4px' }}>
              2-12 characters, uppercase letters and numbers only
            </p>
          </div>

          {/* Token Decimals */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Label 
              htmlFor="decimals" 
              style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ffffff' }}
            >
              Decimals *
            </Label>
            <Input
              id="decimals"
              type="number"
              min="0"
              max="18"
              value={formData.decimals}
              onChange={(e) => {
                console.log('✅ Decimals changed:', e.target.value);
                onChange({ decimals: parseInt(e.target.value) || 0 });
              }}
              style={decimalsError ? inputStyleError : inputStyle}
            />
            {decimalsError && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                {decimalsError}
              </p>
            )}
            <p style={{ fontSize: '14px', color: '#d1d5db', marginTop: '4px' }}>
              Number of decimal places (0-18). Most tokens use 6 or 7 decimals.
            </p>
          </div>


          {/* Admin Address with Wallet Integration */}
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Label 
              htmlFor="admin" 
              style={{ display: 'flex', marginBottom: '8px', fontWeight: '600', color: '#ffffff', alignItems: 'center', gap: '8px' }}
            >
              Admin Address *
              {isConnected && (
                <Badge 
                  variant="outline" 
                  style={{ 
                    fontSize: '12px', 
                    backgroundColor: '#f0fdf4', 
                    color: 'hsl(192, 100%, 66%)', // brand-500 
                    border: '1px solid #16a34a',
                    position: 'relative',
                    zIndex: 15
                  }}
                >
                  Wallet Connected
                </Badge>
              )}
            </Label>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
              <Input
                id="admin"
                type="text"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={formData.admin || ''}
                onChange={(e) => {
                  console.log('✅ Admin changed:', e.target.value);
                  onChange({ admin: e.target.value });
                  setIsWalletAddressUsed(false);
                }}
                style={{ ...inputStyle, flex: 1 }}
              />
              
              {isConnected && formData.admin !== address && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseWallet}
                  style={{ 
                    position: 'relative', 
                    zIndex: 15, 
                    pointerEvents: 'auto',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #3b82f6',
                    backgroundColor: '#ffffff',
                    color: '#3b82f6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Wallet size={16} />
                  Use Wallet
                </Button>
              )}
              
              <Button
                type="button"
                variant={isConnected ? "default" : "outline"}
                onClick={handleConnectWallet}
                disabled={isConnecting}
                style={{ 
                  position: 'relative', 
                  zIndex: 15, 
                  pointerEvents: 'auto',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: isConnected ? 'none' : '1px solid #6b7280',
                  backgroundColor: isConnected ? '#16a34a' : '#ffffff',
                  color: isConnected ? '#ffffff' : '#6b7280',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>
                    <CheckCircle size={16} />
                    Connected
                  </>
                ) : (
                  <>
                    <Wallet size={16} />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>

            {addressError && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} />
                {addressError}
              </p>
            )}

            {/* Wallet Connection Info */}
            {isConnected && formData.admin === address && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #16a34a', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Info size={16} />
                  <strong>Using Connected Wallet</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#d1d5db' }}>
                  You're using your connected wallet address as the token admin.
                </p>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #16a34a', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#16a34a',
                  wordBreak: 'break-all'
                }}>
                  {address}
                </div>
              </div>
            )}

            <p style={{ fontSize: '14px', color: '#d1d5db', marginTop: '4px' }}>
              Stellar address that will control the token (minting, burning, compliance)
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Preview */}
      {formData.name && formData.symbol && formData.admin && (
        <div style={{
          ...cardStyle,
          backgroundColor: 'hsl(224, 23%, 10%)', // bg-elev-2
          borderColor: 'hsl(192, 100%, 66%)' // brand-500
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'hsl(192, 100%, 66%)', // brand-500 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '0'
            }}>
              <CheckCircle size={24} />
              Configuration Preview
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#d1d5db' }}>Token Name:</span>
              <div style={{ fontWeight: '600', color: '#ffffff' }}>{formData.name}</div>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#d1d5db' }}>Symbol:</span>
              <div style={{ fontWeight: '600', color: '#3b82f6' }}>{formData.symbol}</div>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#d1d5db' }}>Decimals:</span>
              <div style={{ fontWeight: '600', color: '#ffffff' }}>{formData.decimals}</div>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#d1d5db' }}>Template:</span>
              <div style={{ fontWeight: '600', color: '#ffffff' }}>{template.name}</div>
            </div>
          </div>
          
          <div>
            <span style={{ fontSize: '14px', color: '#d1d5db' }}>Admin Address:</span>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              backgroundColor: 'hsl(227, 20%, 7%)', // bg-elev-1 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid hsl(192, 100%, 66%)', // brand-500
              color: 'hsl(192, 100%, 66%)', // brand-500
              marginTop: '4px',
              wordBreak: 'break-all'
            }}>
              {formData.admin}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}