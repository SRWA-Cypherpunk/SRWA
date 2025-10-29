#!/bin/bash

echo "🔄 Redeploying srwa_factory to devnet..."
echo ""

# Try anchor deploy first
echo "Attempting deploy with Anchor..."
if anchor deploy --provider.cluster devnet --program-name srwa_factory; then
    echo "✅ Deploy successful with Anchor!"
    exit 0
fi

echo "❌ Anchor deploy failed, trying with Solana CLI..."
echo ""

# Fallback to solana CLI
if solana program deploy target/deploy/srwa_factory.so \
    --program-id DgNZ6dzLSXzunGiaFnpUhS63B6Wu9WNZ79KF6fW3ETgY \
    --url devnet \
    --keypair ~/.config/solana/temp-keypair.json; then
    echo "✅ Deploy successful with Solana CLI!"
    exit 0
fi

echo "❌ Both deploy methods failed. The devnet RPC may be experiencing issues."
echo "Please try again later or check https://status.solana.com/"
exit 1
