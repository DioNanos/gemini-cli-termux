#!/bin/bash
# TERMUX PATCH: Verify all Termux patches are intact after merge
# Run this after merging upstream to ensure patches weren't lost
# Author: DioNanos

set -e

echo "=== Checking Termux Patches ==="
echo ""

ERRORS=0

# Check file existence
FILES=(
  "packages/core/src/utils/termux-detect.ts"
  "packages/core/src/tools/tts-notification.ts"
  "packages/cli/src/patches/empty-module.ts"
  "scripts/postinstall.cjs"
  "scripts/termux-setup.sh"
  "scripts/termux-tools/discovery.sh"
  "scripts/termux-tools/call.sh"
  "scripts/check-termux-patches.sh"
)

echo "Checking required files..."
for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ✗ $f MISSING"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "Checking patch content..."

# Check esbuild banner
if grep -q "TERMUX PATCH" esbuild.config.js; then
  echo "  ✓ esbuild.config.js has TERMUX patches"
else
  echo "  ✗ esbuild.config.js MISSING TERMUX patches"
  ERRORS=$((ERRORS + 1))
fi

# Check package.json postinstall
if grep -q "postinstall" package.json; then
  echo "  ✓ package.json has postinstall script"
else
  echo "  ✗ package.json MISSING postinstall script"
  ERRORS=$((ERRORS + 1))
fi

# Check PTY deps
if grep -q "@mmmbuto/pty-termux-utils" package.json && grep -q "@mmmbuto/node-pty-android-arm64" package.json; then
  echo "  ✓ package.json has Termux PTY dependencies"
else
  echo "  ✗ package.json MISSING Termux PTY dependencies"
  ERRORS=$((ERRORS + 1))
fi

# Check core index export
if grep -q "termux-detect" packages/core/src/index.ts; then
  echo "  ✓ core/index.ts has termux-detect export"
else
  echo "  ✗ core/index.ts MISSING termux-detect export"
  ERRORS=$((ERRORS + 1))
fi

# Check browser patches
if grep -q "termux-open-url" packages/core/src/utils/secure-browser-launcher.ts && grep -q "termux-open-url" packages/cli/src/ui/utils/commandUtils.ts; then
  echo "  ✓ browser launch uses termux-open-url on Android"
else
  echo "  ✗ browser termux-open-url patch missing"
  ERRORS=$((ERRORS + 1))
fi

# Check TTS tool registration
if grep -q "TtsNotificationTool" packages/core/src/config/config.ts && grep -q "tts_notification" packages/core/src/tools/tool-names.ts; then
  echo "  ✓ TTS notification tool is registered"
else
  echo "  ✗ TTS notification tool registration missing"
  ERRORS=$((ERRORS + 1))
fi

# Check Makefile targets
if grep -q "termux-install" Makefile; then
  echo "  ✓ Makefile has termux-install target"
else
  echo "  ✗ Makefile MISSING termux-install target"
  ERRORS=$((ERRORS + 1))
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "=== All Termux patches intact ==="
  exit 0
else
  echo "=== WARNING: $ERRORS patches missing or broken ==="
  echo ""
  echo "Review MERGE_STRATEGY.md for recovery instructions."
  exit 1
fi
