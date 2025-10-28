import { useDeployedTokens } from '@/hooks/solana/useDeployedTokens';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TokenSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TokenSelect({ value, onValueChange, placeholder = "Selecione um token", disabled }: TokenSelectProps) {
  const { tokens, loading } = useDeployedTokens();

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando tokens...</span>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="p-3 border rounded-md bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Nenhum token deployado encontrado. Crie um token SRWA primeiro no Token Wizard.
        </p>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token.mint.toBase58()} value={token.mint.toBase58()}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{token.symbol}</span>
              <span className="text-xs text-muted-foreground">({token.name})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
