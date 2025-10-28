import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Waves, TrendingUp } from 'lucide-react';
import { RaydiumPoolCreator } from './RaydiumPoolCreator';
import { SolendPoolCreator } from './SolendPoolCreator';

export function PoolManager() {
  const [selectedProtocol, setSelectedProtocol] = useState<'raydium' | 'solend'>('raydium');

  return (
    <Card className="card-institutional">
      <CardHeader>
        <CardTitle>Pool Manager</CardTitle>
        <CardDescription>
          Escolha o protocolo e gerencie suas pools de liquidez e lending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedProtocol} onValueChange={(value) => setSelectedProtocol(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="raydium" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              <span>Raydium</span>
              <Badge variant="secondary" className="ml-1 text-xs">AMM</Badge>
            </TabsTrigger>
            <TabsTrigger value="solend" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Solend</span>
              <Badge variant="secondary" className="ml-1 text-xs">Lending</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="raydium">
            <RaydiumPoolCreator />
          </TabsContent>

          <TabsContent value="solend">
            <SolendPoolCreator />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
