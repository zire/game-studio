#!/bin/bash

# Test deployment script for Y3 Labs - Pacboy 2025
# This script simulates the GitHub Actions deployment process locally

set -e

echo "🚀 Testing deployment process for Y3 Labs - Pacboy 2025"
echo "======================================================"

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ DFX is not installed. Please install it first:"
    echo "   sh -ci \"\$(curl -fsSL https://internetcomputer.org/install.sh)\""
    exit 1
fi

echo "✅ DFX is installed"

# Check current identity
echo "📋 Current identity:"
dfx identity whoami

# Check if we're on the IC network
echo "🌐 Checking IC network connection..."
dfx ping ic

# Deploy to IC
echo "🚀 Deploying to Internet Computer..."
dfx deploy --network ic --yes

# Get canister info
echo "📊 Canister information:"
dfx canister --network ic info y3-labs

# Get the canister URL
CANISTER_ID=$(dfx canister --network ic id y3-labs)
echo "🌐 Your canister is available at:"
echo "   https://${CANISTER_ID}.ic0.app"

echo ""
echo "✅ Deployment test completed successfully!"
echo "🎮 Your Y3 Labs game should now be live on the Internet Computer!" 