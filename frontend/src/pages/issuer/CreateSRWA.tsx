import { IssuerWizard } from '@/components/srwa/IssuerWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function CreateSRWA() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Criar Token SRWA</CardTitle>
                <CardDescription className="text-base">
                  Tokenize seus ativos do mundo real na blockchain
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete o processo de criação do token em 5 etapas. Após a submissão,
              seu token será enviado para aprovação administrativa antes de ser implantado na blockchain.
            </p>
          </CardContent>
        </Card>
      </div>

      <IssuerWizard />
    </div>
  );
}
