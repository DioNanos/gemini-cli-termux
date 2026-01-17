# Termux Patches Documentation

This directory documents all Termux-specific patches applied to the upstream Gemini CLI.

## Version: 0.26.0-termux

### Core Patches

#### 1. ARM64 PTY Support
- **Package**: `@mmmbuto/node-pty-android-arm64` (prebuilt, no node-gyp required)
- **Files**: `packages/core/package.json`, `esbuild.config.js`
- **Purpose**: Provides native PTY functionality for Android ARM64 without compilation
- **Upstream dependency**: `node-pty` (requires node-gyp, fails on Termux)

#### 2. Clipboard Detection Fix
- **Files**: `bundle/gemini.js` (banner patch)
- **Patch**: `TERMUX__PREFIX` environment variable fix
- **Code**: `process.env.TERMUX__PREFIX = process.env.PREFIX`
- **Purpose**: clipboardy expects `TERMUX__PREFIX` but Termux sets `PREFIX`

#### 3. Termux-API Integration
- **Files**: `packages/core/src/tools/termux-api.ts`
- **Purpose**: Discovery and execution of Termux API commands (battery, wifi, etc.)
- **Optional**: Requires `termux-api` package installed

#### 4. Mobile-Safe Guards
- **Various files**: Path handling, environment checks
- **Purpose**: Avoids desktop-only assumptions (keytar paths, temp directories, etc.)

### Bug Fixes (v0.26.0-termux)

#### 5. Telemetry TypeError Fix
- **Files**: `packages/core/src/telemetry/clearcut-logger/clearcut-logger.ts`
- **Issue**: `cpus[0].model` throws when `os.cpus()` returns empty array
- **Fix**: Added guard `cpus.length > 0 ? cpus[0].model : 'unknown'`

#### 6. Model Config Fallbacks
- **Files**: `packages/core/src/telemetry/types.ts`
- **Issue**: `config.getModel()` returns undefined during startup
- **Fix**: Added `|| 'unknown'` fallback for model and embedding_model

#### 7. Event Guard
- **Files**: `packages/core/src/telemetry/loggers.ts`
- **Issue**: Undefined event causes TypeError
- **Fix**: Added `if (!event) return` guard

#### 8. Context Memory & TTS Stub Methods
- **Files**: `packages/core/src/config/config.ts`
- **Issue**: Missing methods from upstream changes (new features in v0.26.0)
- **Added stubs**:
  - `getContextMemoryOptions()`: Returns disabled context memory config (upstream feature)
  - `isTtsEnabled()`: Returns `false` for TTS check (mobile compatibility)
- **Purpose**: Maintain compatibility with upstream code paths while keeping features disabled

#### 9. IPty API Compatibility
- **Files**: `packages/core/src/services/shellExecutionService.ts`
- **Issue**: IPty API changed (onData/onExit → on('data')/on('exit'))
- **Fix**: Updated to new event-based API

### Package Scope

- **Root/CLI packages**: `@mmmbuto/gemini-cli-termux` (Termux-specific)
- **Core/Test-utils packages**: `@google/gemini-cli-core`, `@google/gemini-cli-test-utils` (upstream compatibility)

### Release Notes

- **v0.26.0-termux**: 146 upstream commits merged, 25 conflicts resolved
- **Tag**: `v0.26.0-termux` (commit: `cf4a6ac20`)
- **Test Report**: `GEMINI_TEST_REPORT_v0.26.0.md`
