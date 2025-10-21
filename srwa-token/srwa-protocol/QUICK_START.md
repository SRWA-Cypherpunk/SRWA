# Quick Start Guide - Admin Allowlist & KYC System

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Solana devnet wallet with SOL
- Node.js and npm installed
- Anchor CLI installed

### Step 1: Build and Deploy (2 minutes)

```bash
# Navigate to project
cd /home/inteli/Desktop/Meridian-Stellar-Hackathon/srwa-token/srwa-protocol

# Build programs
anchor build

# Set to devnet
solana config set --url devnet

# Airdrop SOL if needed
solana airdrop 2

# Deploy
anchor deploy

# Save the program ID shown for srwa_factory
```

### Step 2: Start Frontend (1 minute)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

Open browser to `http://localhost:5173`

### Step 3: Initialize Registries (2 minutes)

**Option A: Via UI (Recommended)**

1. Connect your wallet in the app
2. Go to **Admin Panel** → **Admin Allowlist** tab
3. Click "Initialize Admin Registry"
4. Transaction will succeed and you'll be set as super admin

**Option B: Via Code**

```typescript
import { AdminAllowlistServiceImpl } from './lib/adminAllowlist';
import { KYCProviderServiceImpl } from './lib/kycProvider';

// Initialize Admin Registry
const adminService = new AdminAllowlistServiceImpl(program, provider);
const tx1 = await adminService.initializeAdminRegistry();
console.log('Admin registry initialized:', tx1);

// Initialize KYC Registry
const kycService = new KYCProviderServiceImpl(program, provider);
const tx2 = await kycService.initializeKYCRegistry();
console.log('KYC registry initialized:', tx2);
```

## 📱 Using the Features

### For Platform Admins

**Add Authorized Admin:**
1. Go to Admin Panel → Admin Allowlist
2. Enter admin's public key
3. Click "Add Admin"
4. That admin can now approve token requests

**Remove Admin:**
1. Find admin in the list
2. Click "Remove" button
3. They can no longer approve tokens

### For Token Issuers

**Create Token with KYC:**
1. Go to Issuer Dashboard
2. Start token creation wizard
3. Fill Steps 1-3 (basic info)
4. **Step 4 - KYC Configuration:**
   - Toggle "Require KYC" on/off
   - Select required claim types (KYC, AML, etc.)
   - Add approved KYC provider addresses
5. Submit request
6. Wait for admin approval

### For Investors

**Check KYC Status:**
1. View token details page
2. See KYC requirements and your status
3. If needed, complete KYC with approved provider
4. Once verified, you can invest

## 🔧 Common Operations

### Add a KYC Provider (Platform Admin)

```typescript
const kycService = new KYCProviderServiceImpl(program, provider);

await kycService.addKYCProvider(
  new PublicKey("KYCProviderPublicKeyHere"),
  "Jumio KYC Services",
  "https://jumio.com/metadata.json"
);
```

### Configure Token KYC (Issuer)

```typescript
const kycService = new KYCProviderServiceImpl(program, provider);

await kycService.configureIssuerKYC(
  mintPubkey,
  [provider1Pubkey, provider2Pubkey], // Approved providers
  [1, 2, 6], // Required topics: KYC, AML, SANCTIONS_CLEAR
  true // Require KYC
);
```

### Check Investor Eligibility

```typescript
const kycService = new KYCProviderServiceImpl(program, provider);
const canInvest = await kycService.verifyInvestorKYC(mintPubkey);

if (canInvest) {
  console.log('✅ Investor is eligible');
} else {
  console.log('❌ Investor needs to complete KYC');
}
```

## 🎯 Testing the Complete Flow

### 1. Platform Setup (One-Time)

```bash
# Terminal 1 - Blockchain
solana-test-validator --reset

# Terminal 2 - Deploy
anchor deploy

# Terminal 3 - Frontend
cd frontend && npm run dev
```

### 2. Initialize as Super Admin

```typescript
// In browser console or test script
const adminService = new AdminAllowlistServiceImpl(srwaFactoryProgram, provider);
await adminService.initializeAdminRegistry();
// You are now super admin!
```

### 3. Add Another Admin

Via UI:
1. Admin Panel → Admin Allowlist tab
2. Enter wallet address: `GuestAdminPublicKeyHere`
3. Click "Add Admin"

### 4. Create Test Token (as Issuer)

1. Switch to issuer wallet
2. Go through wizard
3. Step 4: Select KYC requirements
4. Submit request

### 5. Approve Token (as Admin)

1. Switch to authorized admin wallet
2. Admin Panel → Pending tab
3. Click "Approve" on the request
4. Token is deployed!

### 6. Check KYC Status (as Investor)

1. Switch to investor wallet
2. View token page
3. See required KYC claims
4. Complete KYC with provider
5. Verify eligibility

## 🐛 Troubleshooting

### "Admin registry not initialized"
**Solution:** Run `initializeAdminRegistry()` first

### "Cannot read properties of undefined (reading 'fetch')"
**Fixed!** Updated services use direct account fetching

### "Admin not in allowlist"
**Solution:** Use super admin to add the wallet via AdminAllowlistPanel

### Program not found
**Solution:** Ensure you deployed with `anchor deploy` and updated program IDs

### Transaction fails
**Solutions:**
- Check you have enough SOL
- Verify wallet is connected
- Check transaction logs in browser console

## 📊 Account Addresses (PDAs)

All PDAs are deterministic and can be derived:

```typescript
import { PublicKey } from '@solana/web3.js';

const programId = new PublicKey("YOUR_SRWA_FACTORY_PROGRAM_ID");

// Admin Registry
const [adminRegistry] = PublicKey.findProgramAddressSync(
  [Buffer.from("admin_registry")],
  programId
);

// KYC Provider Registry
const [kycRegistry] = PublicKey.findProgramAddressSync(
  [Buffer.from("kyc_registry")],
  programId
);

// Issuer KYC Config (per token)
const [issuerKycConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from("issuer_kyc"), mintPubkey.toBuffer()],
  programId
);
```

## 📚 Claim Topics Reference

Use these topic IDs when configuring KYC:

| Topic ID | Name | Description |
|----------|------|-------------|
| 1 | KYC | Know Your Customer basic verification |
| 2 | AML | Anti-Money Laundering screening |
| 3 | ACCREDITED | Accredited investor status |
| 4 | RESIDENCY | Residency/jurisdiction verification |
| 5 | PEP | Politically Exposed Person check |
| 6 | SANCTIONS_CLEAR | Sanctions screening passed |
| 7 | KYB | Know Your Business (for entities) |

**Common Combinations:**
- **Basic:** `[1, 2]` - KYC + AML
- **Standard:** `[1, 2, 6]` - KYC + AML + Sanctions
- **Accredited:** `[1, 2, 3, 6]` - KYC + AML + Accredited + Sanctions
- **Full:** `[1, 2, 3, 4, 6]` - All common checks

## 🎉 You're Ready!

The system is now fully operational. Key features:

✅ Admin allowlist prevents unauthorized approvals
✅ Issuers configure KYC requirements per token
✅ Investors complete KYC with approved providers
✅ Automatic verification before investment
✅ Full UI for all user types

## 🆘 Need Help?

- **Technical Docs:** See `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- **Admin Guide:** See `ADMIN_KYC_GUIDE.md`
- **Investor Guide:** See `INVESTOR_KYC_FLOW.md`
- **Wizard Guide:** See `KYC_STEP_GUIDE.md`

---

**Happy building!** 🚀
