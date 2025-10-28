import { Header } from '@/components/layout/Header';
import { RaydiumPoolManager } from '@/components/srwa/pool/RaydiumPoolManager';

export default function Pools() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto max-w-7xl p-6 space-y-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Raydium Liquidity Pools</h1>
					<p className="text-muted-foreground">
						Gerencie seus pools de liquidez: faça swaps, adicione ou remova liquidez
					</p>
				</div>

				<RaydiumPoolManager />
			</div>
		</div>
	);
}
