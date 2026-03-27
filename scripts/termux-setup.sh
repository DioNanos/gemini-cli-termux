#!/data/data/com.termux/files/usr/bin/bash
# TERMUX PATCH: Helper script for building from source on Termux
# Author: DioNanos

set -e

echo "=== Gemini CLI Termux Setup ==="
echo ""

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ required"
    echo "   Install with: pkg install nodejs-lts"
    exit 1
fi
echo "✓ Node.js version: $(node -v)"

# Check if in project directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from gemini-cli-termux root directory"
    exit 1
fi
echo "✓ In project directory"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# Build
echo ""
echo "Building..."
npm run build 2>&1
echo "✓ Build complete"

echo ""
echo "Bundling..."
npm run bundle 2>&1
echo "✓ Bundle complete"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Run with: node bundle/gemini.js"
echo "Or link globally: npm link"
echo ""
