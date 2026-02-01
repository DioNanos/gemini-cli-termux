# 🤖 Gemini CLI – Termux Edition (v0.28.0-termux)

> **Google Gemini CLI for Android Termux (ARM64)**  
> Upstream: v0.28.0-nightly.20260201.b0f38104d

## What This Is

Built from upstream Google Gemini CLI source, compiled for Android Termux. This fork applies minimal patches only for Termux compatibility issues.

## What's New in v0.28.0-termux

### Upstream Features (v0.28.0-nightly.20260201)
- Improved PTY handling with better process group termination
- New `ask_user` tool for user interaction
- Event-driven tool execution scheduler
- ACP session resume support

### Termux-Specific Patches
- **Context Memory**: ✅ Persistent memory in `~/.gemini/context_memory/` (restored after upstream deletion)
- **TTS Notification**: ✅ NEW dedicated `tts_notification` tool
- **Memory Mode**: ✅ Control between GEMINI.md only or GEMINI.md + JSON
- **ARM64 PTY**: Prebuilt for Android (no node-gyp required)
- **Termux-API**: Integration with termux-api commands

## Installation

```bash
npm install -g @mmmbuto/gemini-cli-termux
```

### Verify Installation

```bash
gemini --version
# Output: 0.28.0-termux
```

## Compatibility

| Platform | Build | TTS | Notes |
|----------|-------|-----|------|
| **Termux/Android** | ✅ | ✅ | `termux-tts-speak` available |
| **Linux** | ✅ | ⚠️ | TTS fails silently (best-effort) |

## Usage

Same as upstream Gemini CLI:

```bash
# Start chat
gemini

# Non-interactive mode
gemini "Explain this code" -o json
```

## License

Apache-2.0 (same as upstream)

---

**Version**: v0.28.0-termux  
**Upstream**: v0.28.0-nightly.20260201.b0f38104d  
**Package**: @mmmbuto/gemini-cli-termux  
**Files**: 4189 bundled files (13.1 MB)
