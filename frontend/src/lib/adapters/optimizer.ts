import { withTxToasts } from '@/lib/txFlow';

export async function place_supply(_pool: string, _amount: string) {
	return withTxToasts('Place supply', async () => 'MOCK_TX_HASH_PLACE_SUPPLY');
}

export async function place_borrow(_pool: string, _amount: string) {
	return withTxToasts('Place borrow', async () => 'MOCK_TX_HASH_PLACE_BORROW');
}

export async function cancel(_orderId: string) {
	return withTxToasts('Cancel order', async () => 'MOCK_TX_HASH_CANCEL');
}

export async function match() {
	return withTxToasts('Match orders', async () => 'MOCK_TX_HASH_MATCH');
}
