#!/bin/bash

# Test deployment script for Y3 Labs Game Studio
# This script simulates the GitHub Actions deployment process locally

set -e

echo "🚀 Testing deployment process for Y3 Labs Game Studio"
echo "===================================================="

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
echo "🚀 Deploying Y3 Labs Game Studio to Internet Computer..."
dfx deploy --network ic --yes

# Get canister info
echo "📊 Canister information:"
dfx canister --network ic info y3-labs

# Get the canister URL
CANISTER_ID=$(dfx canister --network ic id y3-labs)
echo "🌐 Your Y3 Labs Game Studio is available at:"
echo "   https://${CANISTER_ID}.ic0.app"
echo "   🎮 Pacboy 2025: https://${CANISTER_ID}.ic0.app/games/pacboy-2025/"

echo ""
echo "✅ Deployment test completed successfully!"
echo "🎮 Your Y3 Labs Game Studio should now be live on the Internet Computer!"
echo ""
echo "📁 Project Structure:"
echo "   src/landing/          - Y3 Labs landing page"
echo "   src/games/pacboy-2025/ - Pacboy 2025 game"
echo "   .github/workflows/     - CI/CD deployment" 