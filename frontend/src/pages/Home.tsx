import { Header } from '@/components/layout/Header';

export default function Home() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-7xl p-6">
				<h1 className="text-2xl font-semibold mb-4">Overview</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="border rounded-md p-4">TVL</div>
					<div className="border rounded-md p-4">Open Interest</div>
					<div className="border rounded-md p-4">Active Pools</div>
				</div>
			</div>
		</div>
	);
}
