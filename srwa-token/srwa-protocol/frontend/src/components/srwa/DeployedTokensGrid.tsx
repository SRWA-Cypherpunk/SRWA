import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Coins, TrendingUp, DollarSign, RefreshCw, ExternalLink, Shield } from 'lucide-react';

export function DeployedTokensGrid() {
  const { tokens, loading, error, refresh } = useDeployedTokens();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-institutional">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="card-institutional">
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-body-1 text-fg-secondary">{error}</p>
          <Button onClick={refresh} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="card-institutional">
        <CardHeader>
          <CardTitle className="text-h2 flex items-center gap-2">
            <Coins className="h-6 w-6 text-brand-400" />
            Created SRWA Tokens
          </CardTitle>
          <CardDescription>No tokens deployed yet</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Coins className="h-16 w-16 text-fg-muted mx-auto mb-4 opacity-50" />
          <p className="text-body-1 text-fg-muted mb-4">
            No SRWA tokens have been deployed yet
          </p>
          <Button onClick={() => window.location.href = '/srwa-issuance'} className="btn-primary">
            Create Your First Token
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h1 font-semibold text-fg-primary flex items-center gap-2">
            <Coins className="h-8 w-8 text-brand-400" />
            Created SRWA Tokens
          </h2>
          <p className="text-body-1 text-fg-secondary mt-2">
            {tokens.length} token{tokens.length > 1 ? 's' : ''} deployed on-chain
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <Card key={token.mint.toBase58()} className="card-institutional hover-lift group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-h3 flex items-center gap-2">
                    {token.name}
                    <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">
                      Live
                    </Badge>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs mt-1">
                    {token.symbol}
                  </CardDescription>
                </div>
                <Coins className="h-8 w-8 text-brand-400" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mint Address */}
              <div className="p-3 bg-bg-elev-2 rounded-lg">
                <p className="text-micro text-fg-muted mb-1">Mint Address</p>
                <p className="font-mono text-xs text-fg-primary break-all">
                  {token.mint.toBase58()}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-fg-muted" />
                    <p className="text-micro text-fg-muted">Target TVL</p>
                  </div>
                  <p className="text-body-1 font-semibold text-fg-primary">
                    ${(token.tvl / 1_000_000).toFixed(1)}M
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-fg-muted" />
                    <p className="text-micro text-fg-muted">Target APY</p>
                  </div>
                  <p className="text-body-1 font-semibold text-brand-400">
                    {token.supplyAPY.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Yield Strategy */}
              <div className="p-3 bg-bg-elev-2 rounded-lg">
                <p className="text-micro text-fg-muted mb-1">Yield Strategy</p>
                <p className="text-body-2 text-fg-primary capitalize">
                  {token.yieldConfig.protocol}
                </p>
              </div>

              {/* Issuer */}
              <div className="space-y-1">
                <p className="text-micro text-fg-muted">Issuer</p>
                <p className="font-mono text-xs text-fg-primary">
                  {token.issuer.toBase58().slice(0, 16)}...
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(token.mint.toBase58());
                  toast.success('Mint address copied!');
                }}
                variant="outline"
                className="w-full group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Copy Mint Address
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
