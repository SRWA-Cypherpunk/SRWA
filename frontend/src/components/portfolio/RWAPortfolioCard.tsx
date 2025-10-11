import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletAssets } from '@/hooks/wallet/useWalletAssets';
import { useUserBlendPositions } from '@/hooks/markets/useUserBlendPositions';
import { useRecentTransactions, formatTransactionForDisplay } from '@/hooks/wallet/useWalletTransactions';

interface RWAPortfolioCardProps {
  className?: string;
}

export function RWAPortfolioCard({ className }: RWAPortfolioCardProps) {
  const [activeTab, setActiveTab] = useState('assets');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Hooks for real data
  const { rwaAssets, hasRWAAssets, loading: assetsLoading, refreshAssets } = useWalletAssets();
  const { rwaPositions, loading: positionsLoading } = useUserBlendPositions();
  const { recentTransactions, loading: transactionsLoading } = useRecentTransactions(5);

  const loading = assetsLoading || positionsLoading || transactionsLoading;
  
  // Navigation handlers with debug logging
  const handleCreateRWAToken = () => {
    try {
      navigate('/srwa-issuance');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      window.location.href = '/srwa-issuance';
    }
  };

  const handleExploreMarkets = () => {
    try {
      navigate('/dashboard', { state: { tab: 'markets' } });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      window.location.href = '/dashboard?tab=markets';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAssets();
    } catch (error) {
      console.error('❌ Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy transaction hash to clipboard
  const handleCopyTransactionHash = async (txHash: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
      setCopyFeedback(txHash);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopyFeedback(null);
      }, 2000);
    } catch (error) {
      console.error('❌ Copy error:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = txHash;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyFeedback(txHash);
        setTimeout(() => setCopyFeedback(null), 2000);
      } catch (fallbackError) {
        console.error('❌ Fallback copy error:', fallbackError);
      }
    }
  };

  // Open transaction in block explorer
  const handleViewOnExplorer = (txHash: string) => {
    try {
      // Use the formatTransactionForDisplay helper to get the correct explorer URL
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Explorer open error:', error);
    }
  };

  // Add native event listeners as backup
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Add click event listeners to all buttons
    const buttons = card.querySelectorAll('button[data-action]');
    
    buttons.forEach(button => {
      const action = button.getAttribute('data-action');
      const handler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        
        if (action === 'create-rwa') {
          handleCreateRWAToken();
        } else if (action === 'explore-markets') {
          handleExploreMarkets();
        } else if (action === 'refresh') {
          handleRefresh();
        } else if (action?.startsWith('copy-tx-')) {
          const txHash = action.replace('copy-tx-', '');
          handleCopyTransactionHash(txHash);
        } else if (action?.startsWith('explorer-tx-')) {
          const txHash = action.replace('explorer-tx-', '');
          handleViewOnExplorer(txHash);
        }
      };
      
      button.addEventListener('click', handler, { capture: true });
      
      // Cleanup
      return () => {
        button.removeEventListener('click', handler, { capture: true });
      };
    });
  }, []);

  // No RWA assets state
  if (!loading && !hasRWAAssets && rwaPositions.length === 0) {
    return (
      <div 
        ref={cardRef}
        className={`card-institutional p-6 ${className}`} 
        style={{ 
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'auto',
          borderRadius: '0.75rem',
          border: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          boxShadow: '0 1px 1px rgba(0,0,0,0.3), 0 4px 14px rgba(0,0,0,0.25)'
        }}
      >
        <div className="text-center space-y-6" style={{ pointerEvents: 'auto' }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 mx-auto border border-brand-500/20">
            <svg className="h-8 w-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-fg-primary">
              No RWA Portfolio Yet
            </h3>
            <p className="text-body-2 text-fg-secondary leading-relaxed">
              Start building your Real World Assets portfolio by creating SRWA tokens or participating in RWA lending pools.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              data-action="create-rwa"
              onClick={handleCreateRWAToken}
              className="btn-primary flex items-center justify-center gap-2"
              style={{ 
                pointerEvents: 'auto', 
                cursor: 'pointer',
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '0.75rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Create RWA Token
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3m0 8l-3 3-3-3" />
              </svg>
            </button>
            <button 
              data-action="explore-markets"
              onClick={handleExploreMarkets}
              className="btn-secondary flex items-center justify-center gap-2"
              style={{ 
                pointerEvents: 'auto', 
                cursor: 'pointer',
                minHeight: '44px',
                padding: '0 16px',
                borderRadius: '0.75rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Explore Markets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`card-institutional p-6 ${className}`} 
      style={{ 
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto',
        borderRadius: '0.75rem',
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        boxShadow: '0 1px 1px rgba(0,0,0,0.3), 0 4px 14px rgba(0,0,0,0.25)'
      }}
    >
      <div className="space-y-6" style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-h3 font-semibold text-fg-primary flex items-center">
              🏛️ RWA Portfolio
              {hasRWAAssets && (
                <span className="ml-2 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-xs">
                  Active
                </span>
              )}
            </h3>
            <p className="text-body-2 text-fg-secondary">
              Real World Assets in your wallet and lending positions
            </p>
          </div>
          
          <button
            data-action="refresh"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="btn-ghost flex items-center gap-2 disabled:opacity-50"
            style={{ 
              pointerEvents: 'auto', 
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <svg 
              className={`h-4 w-4 ${loading || isRefreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Simple Tabs */}
        <div className="space-y-6">
          <div className="flex w-full border-b border-border" style={{ pointerEvents: 'auto' }}>
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'assets' 
                  ? 'border-b-2 border-brand-500 text-brand-400' 
                  : 'text-fg-muted hover:text-fg-primary'
              }`}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Assets
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'activity' 
                  ? 'border-b-2 border-brand-500 text-brand-400' 
                  : 'text-fg-muted hover:text-fg-primary'
              }`}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activity
            </button>
          </div>

          {/* Assets Tab Content */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 p-3 bg-brand-500/5 rounded-lg border border-brand-500/20" style={{ pointerEvents: 'auto' }}>
                <button 
                  data-action="create-rwa"
                  onClick={handleCreateRWAToken}
                  className="btn-secondary flex items-center gap-1 text-sm px-3 py-2"
                  style={{ 
                    pointerEvents: 'auto', 
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create RWA Token
                </button>
                <button 
                  data-action="explore-markets"
                  onClick={handleExploreMarkets}
                  className="btn-secondary flex items-center gap-1 text-sm px-3 py-2"
                  style={{ 
                    pointerEvents: 'auto', 
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Explore Markets
                </button>
                <button 
                  data-action="refresh"
                  onClick={handleRefresh}
                  disabled={loading || isRefreshing}
                  className="btn-secondary flex items-center gap-1 text-sm px-3 py-2 disabled:opacity-50"
                  style={{ 
                    pointerEvents: 'auto', 
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg className={`h-3 w-3 ${loading || isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Assets List */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-lg bg-card border border-stroke-line animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-brand-500/20 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-brand-500/20 rounded"></div>
                            <div className="h-3 w-16 bg-brand-500/10 rounded"></div>
                          </div>
                        </div>
                        <div className="h-6 w-20 bg-brand-500/20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : rwaAssets.length > 0 ? (
                <div className="space-y-3">
                  {rwaAssets.map((asset, index) => (
                    <div key={`${asset.asset_code}-${asset.asset_issuer}`} className="p-4 rounded-lg bg-card border border-stroke-line hover:border-brand-500/30 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/20">
                            <span className="text-lg">🏛️</span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-body-1 font-medium text-fg-primary">{asset.displayName || asset.asset_code || 'Unknown Asset'}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-1 rounded border border-brand-500/20 bg-brand-500/10 text-brand-400">
                                RWA
                              </span>
                              {asset.asset_code && (
                                <span className="text-micro text-fg-muted font-mono">{asset.asset_code}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <p className="text-body-1 font-semibold text-fg-primary tabular-nums">
                            {asset.balance ? parseFloat(asset.balance).toFixed(2) : '0.00'}
                          </p>
                          <p className="text-micro text-fg-muted">
                            {asset.usdValue ? `$${(asset.usdValue / 1000).toFixed(1)}K` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <svg className="h-12 w-12 text-fg-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="space-y-2">
                    <p className="text-body-2 text-fg-muted">No RWA assets in wallet</p>
                    <p className="text-micro text-fg-muted">
                      Create your first RWA token or add trustlines to existing assets
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button 
                      data-action="create-rwa"
                      onClick={handleCreateRWAToken}
                      className="btn-secondary flex items-center gap-2 justify-center"
                      style={{ 
                        pointerEvents: 'auto', 
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create RWA Token
                    </button>
                    <button 
                      data-action="explore-markets"
                      onClick={handleExploreMarkets}
                      className="btn-secondary flex items-center gap-2 justify-center"
                      style={{ 
                        pointerEvents: 'auto', 
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Explore Markets
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab Content */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 rounded-lg bg-card border border-stroke-line animate-pulse">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-brand-500/20 rounded"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-32 bg-brand-500/20 rounded"></div>
                            <div className="h-3 w-20 bg-brand-500/10 rounded"></div>
                          </div>
                        </div>
                        <div className="h-4 w-12 bg-brand-500/20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((tx, index) => {
                    const formattedTx = formatTransactionForDisplay(tx);
                    const isCurrentlyCopied = copyFeedback === tx.hash;
                    
                    return (
                      <div key={tx.id} className="p-3 rounded-lg bg-card border border-stroke-line hover:border-brand-500/20 transition-all duration-200">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">⚡</span>
                            <div className="space-y-1">
                              <p className="text-body-2 font-medium text-fg-primary">
                                Transaction
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-micro text-fg-muted">{formattedTx.timeAgo}</span>
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span className="text-micro text-fg-muted font-mono">
                                  {formattedTx.shortHash}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button 
                              data-action={`copy-tx-${tx.hash}`}
                              onClick={() => handleCopyTransactionHash(tx.hash)}
                              className={`h-8 w-8 flex items-center justify-center rounded hover:bg-brand-500/10 transition-colors relative ${
                                isCurrentlyCopied ? 'bg-green-500/20 text-green-400' : ''
                              }`}
                              title={isCurrentlyCopied ? "Copied!" : "Copy transaction hash"}
                              style={{
                                pointerEvents: 'auto',
                                cursor: 'pointer'
                              }}
                            >
                              {isCurrentlyCopied ? '✓' : '📋'}
                              {isCurrentlyCopied && (
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                  Copied!
                                </span>
                              )}
                            </button>
                            <button 
                              data-action={`explorer-tx-${tx.hash}`}
                              onClick={() => handleViewOnExplorer(tx.hash)}
                              className="h-8 w-8 flex items-center justify-center rounded hover:bg-brand-500/10 transition-colors" 
                              title="View on Stellar Expert"
                              style={{
                                pointerEvents: 'auto',
                                cursor: 'pointer'
                              }}
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-fg-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-body-2 text-fg-muted">No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}