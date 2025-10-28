import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { RaydiumPoolOperations } from '@/components/raydium/RaydiumPoolOperations';

export default function PoolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <div className="container mx-auto max-w-5xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Raydium Pool</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie operações do pool selecionado.
            </p>
          </div>
        </div>

        {id ? (
          <RaydiumPoolOperations poolId={id} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Pool ID inválido. Retorne à dashboard e selecione um pool novamente.
          </p>
        )}
      </div>
    </div>
  );
}
