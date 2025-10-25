import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/csv';

export default function Dashboards() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-6xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">Dashboards</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="border rounded-md p-4">Issuer</div>
					<div className="border rounded-md p-4">Spoke</div>
					<div className="border rounded-md p-4">Investor</div>
				</div>
				<Button onClick={() => exportToCsv('dashboard.csv', [{a:1,b:2}])}>Export CSV</Button>
			</div>
		</div>
	);
}
