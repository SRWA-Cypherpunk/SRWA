# Solend Integration

The admin panel now supports provisioning permissioned Solend pools directly from the web interface.
The flow mirrors the official `solend-program-cli` and uses the on-chain devnet program
`ALend7Ketfx5bxh6ghsCDXAoDrhvEmsXT3cynB6aPLgx`.

## Features

- Create a fresh lending market (or reuse an existing one) on Solend devnet.
- Initialize a reserve for SRWA tokens, providing initial liquidity and fee accounts.
- Configure key risk parameters such as LTV, liquidation thresholds and interest rate curves.
- Surfaces all derived accounts (reserve, collateral mint, liquidity supply) and transaction signatures.

## How it works

The UI leverages `@solendprotocol/solend-sdk` to replicate the CLI steps:

1. `init_lending_market` – deploy a new market owned by the connected admin wallet.
2. `init_reserve` – create the reserve, collateral mint/supply, and move the initial liquidity.

Accounts are created client-side and transactions are signed via the connected wallet using
`wallet.sendTransaction`.

## Requirements

- Wallet connected on Solana **devnet** with enough SOL + SRWA tokens to seed the reserve.
- A valid Pyth price feed address for the collateral asset.
- Optional Switchboard feed (defaults to the null oracle if left blank).

Environment overrides can be provided through:

```
VITE_SOLEND_PROGRAM_ID
VITE_PYTH_ORACLE_PROGRAM_ID
VITE_SWITCHBOARD_PROGRAM_ID
VITE_SOLEND_USE_MOCK
```

Set `VITE_SOLEND_USE_MOCK=true` to simulate pool creation locally without sending
transactions. The UI will generate placeholder public keys and signatures so you
can validate the flow without requiring real Solend accounts or balances.
Integration with Solend lending protocol for SRWA tokens.

## Coming Soon

This integration will provide:
- Supply SRWA tokens as collateral
- Borrow against SRWA collateral
- Monitor positions and health factor
- Automated liquidation protection

## Resources

- [Solend Docs](https://docs.solend.fi/)
- [Solend SDK](https://github.com/solendprotocol/solana-program-library)
