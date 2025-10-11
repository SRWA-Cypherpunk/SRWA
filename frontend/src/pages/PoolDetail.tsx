import { Header } from '@/components/layout/Header';

export default function PoolDetail() {
	return (
		<div>
			<Header />
			<div className="container mx-auto max-w-6xl p-6 space-y-4">
				<h1 className="text-2xl font-semibold">Pool Detail</h1>
				<div className="border rounded-md p-4">
					<div className="flex gap-4 border-b mb-4">
						<button>Overview</button>
						<button>Supply</button>
						<button>Borrow</button>
						<button>Positions</button>
						<button>Risk</button>
						<button>Admin</button>
					</div>
					<div>Content</div>
				</div>
			</div>
		</div>
	);
}
