import { Header } from '@/components/layout/Header';

export default function Pools() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-6xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">Pools</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="border rounded-md p-4">Pool A</div>
					<div className="border rounded-md p-4">Pool B</div>
					<div className="border rounded-md p-4">Pool C</div>
				</div>
			</div>
		</div>
	);
}
