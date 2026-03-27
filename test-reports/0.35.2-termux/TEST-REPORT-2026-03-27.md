# Test Report: v0.35.2-termux

**Date**: 2026-03-27
**Version**: 0.35.2-termux
**Upstream**: v0.35.1

## Build Status

- [ ] Build completed successfully
- [ ] Bundle generated
- [ ] NPM package published

## Basic Smoke Tests

Run on Termux device:

```bash
gemini --version
# Expected: 0.35.2-termux

gemini -p "Reply OK"
# Expected: OK
```

## Known Issues

None reported.

## Sign-off

- [ ] Installation test
- [ ] Basic smoke test
- [ ] PTY functionality
- [ ] TTS notification (if termux-api installed)
