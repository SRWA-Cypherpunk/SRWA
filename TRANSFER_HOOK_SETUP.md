# Transfer Hook Setup Guide

## ⚠️ Important: One-Time Setup Required

Before SRWA Token-2022 transfers can work with on-chain KYC validation, you must initialize the **ExtraAccountMetaList** for each token mint.

## 🔍 Step 1: Find Your Token Mint Address

1. Open your frontend application
2. Go to Admin Panel
3. Try to approve a purchase request
4. Look in the browser console for the log:
   ```
   🪙 Token Mint: <YOUR_MINT_ADDRESS>
   ```
5. Copy this address

## 🚀 Step 2: Initialize the Transfer Hook

Run the initialization script with your token mint address:

```bash
cd /home/inteli/Desktop/SRWA
ts-node scripts/find-and-init-hooks.ts <YOUR_MINT_ADDRESS>
```

### Example:
```bash
ts-node scripts/find-and-init-hooks.ts 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### Initialize Multiple Tokens:
```bash
ts-node scripts/find-and-init-hooks.ts MINT1 MINT2 MINT3
```

## ✅ Step 3: Verify

After running the script, you should see:

```
✅ SUCCESS!
   Explorer: https://explorer.solana.com/tx/...
```

## 📊 What This Does

The script creates an **ExtraAccountMetaList** account that tells Token-2022:
- Which extra accounts the Transfer Hook needs
- How to derive those accounts (PDAs)
- The order they should be passed

Once initialized, all transfers of this token will:
1. ✅ Automatically invoke the Transfer Hook
2. ✅ Validate sender KYC on-chain
3. ✅ Validate recipient KYC on-chain
4. ✅ Check offering phase, time windows, and rules
5. ✅ Reject transfers if KYC is invalid

## 🔄 Do I Need to Run This Again?

**No!** Once initialized for a token mint, it's permanent. You only need to:
- Run it once per token mint
- Run it again if you create a new SRWA token

## 🐛 Troubleshooting

### Error: "insufficient account keys for instruction"
→ You forgot to run the initialization script. Run Step 2.

### Error: "Already initialized"
→ Good! This mint is already set up. No action needed.

### Error: "not a valid Token-2022 mint"
→ Check that you copied the correct mint address.

## 📝 Technical Details

- **ExtraAccountMetaList PDA**: Derived from `["extra-account-metas", mint]`
- **Program ID**: `345oZiSawNcHLVLnQLjiE7bkycC3bS1DJcmhvYDDaMFH`
- **Extra Accounts Passed**:
  1. SRWA Config PDA
  2. Offering PDA
  3. Sender User Registry PDA
  4. Recipient User Registry PDA

## 🎉 After Setup

Once initialized, transfers will automatically validate KYC on-chain! No frontend changes needed - the SPL Token-2022 program handles everything.
