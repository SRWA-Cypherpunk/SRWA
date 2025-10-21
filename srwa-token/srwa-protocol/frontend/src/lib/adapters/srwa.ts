import { withTxToasts } from '@/lib/txFlow';

export type Address = string;

export async function transfer(_token: Address, to: Address, amount: string) {
	return withTxToasts('SRWA transfer', async () => {
		// TODO: build and submit payment or contract call
		return 'MOCK_TX_HASH_TRANSFER';
	});
}

export async function approve(_token: Address, _spender: Address, _amount: string) {
	return withTxToasts('SRWA approve', async () => 'MOCK_TX_HASH_APPROVE');
}

export async function mint(_token: Address, _to: Address, _amount: string) {
	return withTxToasts('SRWA mint', async () => 'MOCK_TX_HASH_MINT');
}

export async function burn(_token: Address, _from: Address, _amount: string) {
	return withTxToasts('SRWA burn', async () => 'MOCK_TX_HASH_BURN');
}

export async function set_eligibility(_token: Address, _csvUrl: string) {
	return withTxToasts('Set eligibility', async () => 'MOCK_TX_HASH_SETELIG');
}

export async function is_eligible(_token: Address, _user: Address): Promise<boolean> {
	return true;
}

export async function freeze(_token: Address, _user: Address, _frozen: boolean) {
	return withTxToasts('Freeze account', async () => 'MOCK_TX_HASH_FREEZE');
}

export async function force_transfer(_token: Address, _from: Address, _to: Address, _amount: string) {
	return withTxToasts('Force transfer', async () => 'MOCK_TX_HASH_FORCE');
}

export async function set_ruleset(_token: Address, _ruleset: unknown) {
	return withTxToasts('Set ruleset', async () => 'MOCK_TX_HASH_RULESET');
}

export async function events(_token: Address): Promise<unknown[]> {
	return [];
}
