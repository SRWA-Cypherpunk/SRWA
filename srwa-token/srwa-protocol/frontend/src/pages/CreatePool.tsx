import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function CreatePool() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-3xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">Create Pool</h1>
				<ol className="list-decimal pl-6 space-y-2">
					<li>Deploy OracleAdapter</li>
					<li>Deploy Pool via Factory</li>
					<li>Set Reserve and IRM/Caps</li>
					<li>Activate and Map Locally</li>
				</ol>
				<div className="flex gap-2">
					<Button>Next</Button>
					<Button variant="outline">Back</Button>
				</div>
			</div>
		</div>
	);
}
