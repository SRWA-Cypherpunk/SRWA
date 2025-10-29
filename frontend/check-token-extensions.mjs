import { Connection, PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const tokenMint = new PublicKey('EBYtnCDGYeaNLoLq6w9fKDjUkynHsHyX5MGZQoQMSxZs');

try {
  console.log('Checking token extensions for:', tokenMint.toBase58());

  const mintInfo = await getMint(
    connection,
    tokenMint,
    'confirmed',
    TOKEN_2022_PROGRAM_ID
  );

  console.log('\n=== MINT INFO ===');
  console.log('Decimals:', mintInfo.decimals);
  console.log('Supply:', mintInfo.supply.toString());
  console.log('Mint Authority:', mintInfo.mintAuthority?.toBase58());
  console.log('Freeze Authority:', mintInfo.freezeAuthority?.toBase58());

  if (mintInfo.tlvData && mintInfo.tlvData.length > 0) {
    console.log('\n=== TOKEN-2022 EXTENSIONS DETECTED ===');
    console.log('TLV Data Length:', mintInfo.tlvData.length);

    // Try to parse extensions
    const accountInfo = await connection.getAccountInfo(tokenMint);
    console.log('Raw account data length:', accountInfo?.data.length);

    // Check for common extensions by looking at the account data
    const data = accountInfo?.data;
    if (data) {
      console.log('\nChecking for specific extensions:');

      // Extension type identifiers (from Token-2022 spec)
      const EXTENSION_TYPES = {
        0: 'Uninitialized',
        1: 'TransferFeeConfig',
        2: 'TransferFeeAmount',
        3: 'MintCloseAuthority',
        4: 'ConfidentialTransferMint',
        5: 'ConfidentialTransferAccount',
        6: 'DefaultAccountState',
        7: 'ImmutableOwner',
        8: 'MemoTransfer',
        9: 'NonTransferable',
        10: 'InterestBearingConfig',
        11: 'PermanentDelegate',
        12: 'TransferHook',
        13: 'MetadataPointer',
        14: 'TokenMetadata',
      };

      // Extension starts after the base mint data (82 bytes for Token Program)
      // For Token-2022, we need to check the TLV data
      console.log('Extensions present in this token:');

      // Simple heuristic: check byte patterns
      const dataHex = Buffer.from(data).toString('hex');

      if (dataHex.includes('0100000000000000')) console.log('  - Possible TransferFeeConfig');
      if (dataHex.includes('0600000000000000')) console.log('  - Possible DefaultAccountState');
      if (dataHex.includes('0900000000000000')) console.log('  - Possible NonTransferable');
      if (dataHex.includes('0b00000000000000')) console.log('  - Possible PermanentDelegate');
      if (dataHex.includes('0c00000000000000')) console.log('  - Possible TransferHook');
      if (dataHex.includes('0400000000000000')) console.log('  - Possible ConfidentialTransferMint');
    }
  } else {
    console.log('\n=== NO EXTENSIONS ===');
    console.log('This is a standard Token-2022 mint without extensions');
  }

} catch (error) {
  console.error('Error checking token:', error.message);
}
