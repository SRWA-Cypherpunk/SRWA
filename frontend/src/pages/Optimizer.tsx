import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import * as Opt from '@/lib/adapters/optimizer';

export default function Optimizer() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-3xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">Optimizer</h1>
				<div className="flex gap-2">
					<Button onClick={() => Opt.place_supply('POOL','100')}>Place Supply</Button>
					<Button variant="outline" onClick={() => Opt.place_borrow('POOL','50')}>Place Borrow</Button>
					<Button variant="secondary" onClick={() => Opt.match()}>Match</Button>
				</div>
			</div>
		</div>
	);
}
