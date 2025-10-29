#!/bin/bash
# Deploy script for Phase 1 - SRWA Protocol
# Usage: ./scripts/deploy-phase1.sh [devnet|testnet|mainnet]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
CLUSTER=${1:-devnet}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   SRWA Phase 1 Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Cluster:${NC} $CLUSTER"
echo ""

# Confirm deployment
read -p "Deploy to $CLUSTER? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

# Step 1: Build
echo -e "${BLUE}Step 1: Building programs...${NC}"
anchor build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 2: Deploy srwa_controller
echo -e "${BLUE}Step 2: Deploying srwa_controller...${NC}"
anchor deploy --provider.cluster $CLUSTER --program-name srwa_controller

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ srwa_controller deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ srwa_controller deployed${NC}"
echo ""

# Step 3: Deploy srwa_factory
echo -e "${BLUE}Step 3: Deploying srwa_factory...${NC}"
anchor deploy --provider.cluster $CLUSTER --program-name srwa_factory

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ srwa_factory deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ srwa_factory deployed${NC}"
echo ""

# Step 4: (Optional) Deploy identity_claims
read -p "Deploy identity_claims? (recommended for future) (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Step 4: Deploying identity_claims...${NC}"
    anchor deploy --provider.cluster $CLUSTER --program-name identity_claims

    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  identity_claims deployment failed (non-critical)${NC}"
    else
        echo -e "${GREEN}✅ identity_claims deployed${NC}"
    fi
else
    echo -e "${YELLOW}⏸️  Skipping identity_claims${NC}"
fi
echo ""

# Step 5: Verify deployments
echo -e "${BLUE}Step 5: Verifying deployments...${NC}"

CONTROLLER_ID=$(solana-keygen pubkey target/deploy/srwa_controller-keypair.json 2>/dev/null || echo "unknown")
FACTORY_ID=$(solana-keygen pubkey target/deploy/srwa_factory-keypair.json 2>/dev/null || echo "unknown")

echo -e "${YELLOW}Program IDs:${NC}"
echo "  srwa_controller: $CONTROLLER_ID"
echo "  srwa_factory: $FACTORY_ID"
echo ""

# Check if deployed
if [ "$CONTROLLER_ID" != "unknown" ]; then
    solana program show $CONTROLLER_ID --url $CLUSTER >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ srwa_controller verified on $CLUSTER${NC}"
    else
        echo -e "${RED}❌ srwa_controller NOT found on $CLUSTER${NC}"
    fi
fi

if [ "$FACTORY_ID" != "unknown" ]; then
    solana program show $FACTORY_ID --url $CLUSTER >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ srwa_factory verified on $CLUSTER${NC}"
    else
        echo -e "${RED}❌ srwa_factory NOT found on $CLUSTER${NC}"
    fi
fi
echo ""

# Step 6: Initialize Admin Registry
echo -e "${BLUE}Step 6: Initializing Admin Registry...${NC}"
read -p "Run initialization script? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ts-node scripts/initialize-admin-registry.ts

    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Initialization failed or already done${NC}"
    else
        echo -e "${GREEN}✅ Admin Registry initialized${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Remember to run: ts-node scripts/initialize-admin-registry.ts${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Deployed Programs:${NC}"
echo "  ✅ srwa_controller"
echo "  ✅ srwa_factory"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Update frontend with new Program IDs"
echo "  2. Copy IDLs to frontend:"
echo "     cp target/idl/srwa_*.json frontend/src/idl/"
echo ""
echo "  3. Run tests:"
echo "     anchor test tests/srwa-phase1.ts"
echo ""
echo -e "${YELLOW}Explorer Links ($CLUSTER):${NC}"
echo "  https://explorer.solana.com/address/$CONTROLLER_ID?cluster=$CLUSTER"
echo "  https://explorer.solana.com/address/$FACTORY_ID?cluster=$CLUSTER"
echo ""
