import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

export default function KYCEligibility() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-4xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">KYC/KYB & Eligibility</h1>
				<div className="border rounded-md p-4 space-y-2">
					<div className="text-sm text-muted-foreground">Upload eligibility CSV and manage status</div>
					<div className="flex gap-2">
						<Button>Upload CSV</Button>
						<Button variant="outline">Freeze Account</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
