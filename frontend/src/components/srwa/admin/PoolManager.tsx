import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Waves, TrendingUp, Droplet, DollarSign } from 'lucide-react';
import { RaydiumPoolCreator } from './RaydiumPoolCreator';
import { SolendPoolCreator } from './SolendPoolCreator';
import { OrcaPoolCreator } from './OrcaPoolCreator';
import { MarginFiBankCreator } from './MarginFiBankCreator';

export function PoolManager() {
  const [selectedProtocol, setSelectedProtocol] = useState<'orca' | 'raydium' | 'marginfi' | 'solend'>('orca');

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle>Pool Manager</CardTitle>
        <CardDescription>
          Choose protocol and manage your liquidity and lending pools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedProtocol} onValueChange={(value) => setSelectedProtocol(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="orca" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              <span>Orca</span>
              <Badge variant="default" className="ml-1 text-xs bg-brand-500">Token-2022</Badge>
            </TabsTrigger>
            <TabsTrigger value="raydium" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              <span>Raydium</span>
              <Badge variant="secondary" className="ml-1 text-xs">AMM</Badge>
            </TabsTrigger>
            <TabsTrigger value="marginfi" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>MarginFi</span>
              <Badge variant="default" className="ml-1 text-xs bg-brand-500">Token-2022</Badge>
            </TabsTrigger>
            <TabsTrigger value="solend" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Solend</span>
              <Badge variant="secondary" className="ml-1 text-xs">Lending</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orca">
            <OrcaPoolCreator />
          </TabsContent>

          <TabsContent value="raydium">
            <RaydiumPoolCreator />
          </TabsContent>

          <TabsContent value="marginfi">
            <MarginFiBankCreator />
          </TabsContent>

          <TabsContent value="solend">
            <SolendPoolCreator />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
