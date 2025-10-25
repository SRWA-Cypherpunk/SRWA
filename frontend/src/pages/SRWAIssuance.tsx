import { Header } from '@/components/layout/Header';
import { IssuerWizard } from '@/components/srwa/IssuerWizard';

export default function SRWAIssuance() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<IssuerWizard />
		</div>
	);
}
