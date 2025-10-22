import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function OracleNav() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-3xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">Oracle & NAV</h1>
				<div className="border rounded-md p-4 space-y-2">
					<div className="flex gap-2">
						<Button>Submit NAV</Button>
						<Button variant="outline">Refresh TWAP</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
