import { withTxToasts } from '@/lib/txFlow';
import { 
  Address, 
  IdentityClaim, 
  ClaimTopic, 
  TrustedIssuer 
} from '@/types/srwa-contracts';
import { ComplianceStatus } from '@/types/compliance';

/**
 * Identity Registry Operations
 * Based on the Identity Registry contract from contracts3/identity_registry
 */

/**
 * Register a new identity claim
 */
export async function addClaim(
  identityRegistryAddress: Address,
  subject: Address,
  issuer: Address,
  topicId: number,
  data: string,
  validUntil: number,
  admin: Address
): Promise<string> {
  return withTxToasts('Add identity claim', async () => {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: identityRegistryAddress,
    //   method: 'add_claim',
    //   args: [subject, issuer, topicId, data, validUntil],
    //   source: admin,
    // });

    return 'MOCK_ADD_CLAIM_TX_HASH';
  });
}

/**
 * Remove an identity claim
 */
export async function removeClaim(
  identityRegistryAddress: Address,
  subject: Address,
  issuer: Address,
  topicId: number,
  admin: Address
): Promise<string> {
  return withTxToasts('Remove identity claim', async () => {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: identityRegistryAddress,
    //   method: 'remove_claim',
    //   args: [subject, issuer, topicId],
    //   source: admin,
    // });

    return 'MOCK_REMOVE_CLAIM_TX_HASH';
  });
}

/**
 * Get all claims for a subject
 */
export async function getClaims(
  identityRegistryAddress: Address,
  subject: Address
): Promise<IdentityClaim[]> {
  try {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: identityRegistryAddress,
    //   method: 'get_claims',
    //   args: [subject],
    // });

    // Mock claims
    const mockClaims: IdentityClaim[] = [
      {
        subject,
        issuer: 'GKYCISSUER...',
        topic_id: 1,
        data: '4b59432056657269666965640000000000000000000000000000000000000000', // "KYC Verified" in hex
        valid_until: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
      },
      {
        subject,
        issuer: 'GAMLISSUER...',
        topic_id: 2,
        data: '414d4c20436c656172000000000000000000000000000000000000000000000', // "AML Clear" in hex
        valid_until: Date.now() + 365 * 24 * 60 * 60 * 1000,
      },
    ];

    return mockClaims;
  } catch (error) {
    console.error('Failed to get claims:', error);
    return [];
  }
}

/**
 * Get claims by topic for a subject
 */
export async function getClaimsByTopic(
  identityRegistryAddress: Address,
  subject: Address,
  topicId: number
): Promise<IdentityClaim[]> {
  try {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: identityRegistryAddress,
    //   method: 'get_claims_by_topic',
    //   args: [subject, topicId],
    // });

    // Filter mock claims by topic
    const allClaims = await getClaims(identityRegistryAddress, subject);
    return allClaims.filter(claim => claim.topic_id === topicId);
  } catch (error) {
    console.error('Failed to get claims by topic:', error);
    return [];
  }
}

/**
 * Check if a subject is verified for specific topics
 */
export async function isVerified(
  identityRegistryAddress: Address,
  subject: Address,
  requiredTopics: number[]
): Promise<boolean> {
  try {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: identityRegistryAddress,
    //   method: 'is_verified',
    //   args: [subject, requiredTopics],
    // });

    // Mock verification check
    const claims = await getClaims(identityRegistryAddress, subject);
    const subjectTopics = new Set(claims.map(c => c.topic_id));
    
    return requiredTopics.every(topicId => subjectTopics.has(topicId));
  } catch (error) {
    console.error('Failed to check verification:', error);
    return false;
  }
}

/**
 * Get compliance status for an address
 */
export async function getComplianceStatus(
  identityRegistryAddress: Address,
  trustedIssuersRegistryAddress: Address,
  subject: Address,
  requiredTopics: number[]
): Promise<ComplianceStatus> {
  try {
    const claims = await getClaims(identityRegistryAddress, subject);
    const trustedIssuers = await getTrustedIssuers(trustedIssuersRegistryAddress);
    
    // Check which required topics have valid claims from trusted issuers
    const validClaims = claims.filter(claim => {
      const isFromTrustedIssuer = trustedIssuers.some(
        ti => ti.issuer === claim.issuer && ti.topic_id === claim.topic_id
      );
      const isNotExpired = claim.valid_until > Date.now();
      return isFromTrustedIssuer && isNotExpired;
    });

    const validTopics = new Set(validClaims.map(c => c.topic_id));
    const missingTopics = requiredTopics.filter(topicId => !validTopics.has(topicId));

    const complianceStatus: ComplianceStatus = {
      address: subject,
      is_compliant: missingTopics.length === 0,
      required_claims: requiredTopics.map(id => ({ 
        id, 
        name: getTopicName(id), 
        description: `Required claim for topic ${id}` 
      })),
      current_claims: validClaims,
      missing_claims: missingTopics,
      is_frozen: false, // Would check freeze status from compliance module
      frozen_amount: undefined,
    };

    return complianceStatus;
  } catch (error) {
    console.error('Failed to get compliance status:', error);
    throw error;
  }
}

// Claim Topics Registry Operations

/**
 * Add a new claim topic
 */
export async function addClaimTopic(
  claimTopicsRegistryAddress: Address,
  topicId: number,
  topicName: string,
  admin: Address
): Promise<string> {
  return withTxToasts('Add claim topic', async () => {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: claimTopicsRegistryAddress,
    //   method: 'add_claim_topic',
    //   args: [topicId, topicName],
    //   source: admin,
    // });

    return 'MOCK_ADD_CLAIM_TOPIC_TX_HASH';
  });
}

/**
 * Remove a claim topic
 */
export async function removeClaimTopic(
  claimTopicsRegistryAddress: Address,
  topicId: number,
  admin: Address
): Promise<string> {
  return withTxToasts('Remove claim topic', async () => {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: claimTopicsRegistryAddress,
    //   method: 'remove_claim_topic',
    //   args: [topicId],
    //   source: admin,
    // });

    return 'MOCK_REMOVE_CLAIM_TOPIC_TX_HASH';
  });
}

/**
 * Get all claim topics
 */
export async function getClaimTopics(
  claimTopicsRegistryAddress: Address
): Promise<ClaimTopic[]> {
  try {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: claimTopicsRegistryAddress,
    //   method: 'get_claim_topics',
    //   args: [],
    // });

    // Mock claim topics
    const mockTopics: ClaimTopic[] = [
      { id: 1, name: 'KYC', description: 'Know Your Customer verification' },
      { id: 2, name: 'AML', description: 'Anti-Money Laundering clearance' },
      { id: 3, name: 'Accredited', description: 'Accredited investor status' },
      { id: 4, name: 'Jurisdiction', description: 'Jurisdiction verification' },
    ];

    return mockTopics;
  } catch (error) {
    console.error('Failed to get claim topics:', error);
    return [];
  }
}

// Trusted Issuers Registry Operations

/**
 * Add a trusted issuer
 */
export async function addTrustedIssuer(
  trustedIssuersRegistryAddress: Address,
  issuer: Address,
  topicId: number,
  admin: Address
): Promise<string> {
  return withTxToasts('Add trusted issuer', async () => {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: trustedIssuersRegistryAddress,
    //   method: 'add_trusted_issuer',
    //   args: [issuer, topicId],
    //   source: admin,
    // });

    return 'MOCK_ADD_TRUSTED_ISSUER_TX_HASH';
  });
}

/**
 * Remove a trusted issuer
 */
export async function removeTrustedIssuer(
  trustedIssuersRegistryAddress: Address,
  issuer: Address,
  topicId: number,
  admin: Address
): Promise<string> {
  return withTxToasts('Remove trusted issuer', async () => {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: trustedIssuersRegistryAddress,
    //   method: 'remove_trusted_issuer',
    //   args: [issuer, topicId],
    //   source: admin,
    // });

    return 'MOCK_REMOVE_TRUSTED_ISSUER_TX_HASH';
  });
}

/**
 * Get all trusted issuers
 */
export async function getTrustedIssuers(
  trustedIssuersRegistryAddress: Address
): Promise<TrustedIssuer[]> {
  try {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: trustedIssuersRegistryAddress,
    //   method: 'get_trusted_issuers',
    //   args: [],
    // });

    // Mock trusted issuers
    const mockIssuers: TrustedIssuer[] = [
      { issuer: 'GKYCISSUER...', topic_id: 1 },
      { issuer: 'GAMLISSUER...', topic_id: 2 },
      { issuer: 'GACCISSUER...', topic_id: 3 },
      { issuer: 'GJURISSUER...', topic_id: 4 },
    ];

    return mockIssuers;
  } catch (error) {
    console.error('Failed to get trusted issuers:', error);
    return [];
  }
}

/**
 * Check if an issuer is trusted for a specific topic
 */
export async function isTrustedIssuer(
  trustedIssuersRegistryAddress: Address,
  issuer: Address,
  topicId: number
): Promise<boolean> {
  try {
    // TODO: Replace with actual contract call
    // const result = await stellar.contract.invoke({
    //   contractId: trustedIssuersRegistryAddress,
    //   method: 'is_trusted_issuer',
    //   args: [issuer, topicId],
    // });

    const trustedIssuers = await getTrustedIssuers(trustedIssuersRegistryAddress);
    return trustedIssuers.some(ti => ti.issuer === issuer && ti.topic_id === topicId);
  } catch (error) {
    console.error('Failed to check trusted issuer:', error);
    return false;
  }
}

// Bulk Operations

/**
 * Add multiple claims for a subject
 */
export async function addClaimsBatch(
  identityRegistryAddress: Address,
  subject: Address,
  claims: Omit<IdentityClaim, 'subject'>[],
  admin: Address
): Promise<string[]> {
  const txHashes: string[] = [];

  for (const claim of claims) {
    const txHash = await addClaim(
      identityRegistryAddress,
      subject,
      claim.issuer,
      claim.topic_id,
      claim.data,
      claim.valid_until,
      admin
    );
    txHashes.push(txHash);
  }

  return txHashes;
}

/**
 * Verify multiple subjects at once
 */
export async function verifySubjectsBatch(
  identityRegistryAddress: Address,
  subjects: Address[],
  requiredTopics: number[]
): Promise<Record<Address, boolean>> {
  const results: Record<Address, boolean> = {};

  for (const subject of subjects) {
    results[subject] = await isVerified(identityRegistryAddress, subject, requiredTopics);
  }

  return results;
}

// Helper functions

/**
 * Get topic name by ID
 */
function getTopicName(topicId: number): string {
  const topicNames: Record<number, string> = {
    1: 'KYC',
    2: 'AML',
    3: 'Accredited',
    4: 'Jurisdiction',
  };
  return topicNames[topicId] || `Topic ${topicId}`;
}

/**
 * Convert string to hex for claim data (BROWSER COMPATIBLE)
 */
export function stringToHex(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return hex.padEnd(64, '0');
}

/**
 * Convert hex to string for claim data (BROWSER COMPATIBLE)
 */
export function hexToString(hex: string): string {
  const cleanHex = hex.replace(/^0x/, '');
  const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const decoder = new TextDecoder();
  return decoder.decode(bytes).replace(/\0/g, '');
}

/**
 * Check if a claim is expired
 */
export function isClaimExpired(claim: IdentityClaim): boolean {
  return claim.valid_until < Date.now();
}

/**
 * Get remaining validity time in days
 */
export function getClaimValidityDays(claim: IdentityClaim): number {
  const remainingMs = claim.valid_until - Date.now();
  return Math.max(0, Math.floor(remainingMs / (24 * 60 * 60 * 1000)));
}

/**
 * Format claim data for display
 */
export function formatClaimData(data: string): string {
  try {
    const decoded = hexToString(data);
    return decoded || 'Binary data';
  } catch {
    return 'Invalid data';
  }
}

/**
 * Generate standard claim data for KYC
 */
export function generateKYCClaimData(
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  jurisdiction: string
): string {
  const claimData = {
    firstName,
    lastName,
    dateOfBirth,
    jurisdiction,
    verifiedAt: Date.now(),
  };
  return stringToHex(JSON.stringify(claimData));
}

/**
 * Generate standard claim data for AML
 */
export function generateAMLClaimData(
  riskScore: number,
  sanctionsCheck: boolean,
  pepCheck: boolean
): string {
  const claimData = {
    riskScore,
    sanctionsCheck,
    pepCheck,
    verifiedAt: Date.now(),
  };
  return stringToHex(JSON.stringify(claimData));
}