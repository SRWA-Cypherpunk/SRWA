import { toast } from 'sonner';

export async function withTxToasts<T>(label: string, action: () => Promise<T>): Promise<T> {
	const id = toast.loading(`${label}: simulating…`);
	try {
		const result = await action();
		toast.success(`${label}: sent`, { id });
		return result;
	} catch (e: any) {
		toast.error(`${label}: failed`, { id, description: e?.message ?? String(e) });
		throw e;
	}
}
