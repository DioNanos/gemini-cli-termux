# 🧪 Gemini CLI Termux Test Suite (v0.24.6-termux)

**Goal**: Validate the Termux build with ARM64 PTY prebuild (no node-gyp). Run
from a clean shell on Termux ARM64.

**Version**: 0.24.6-termux **Last Updated**: 2026-01-08

## 0. Prep

- Create workspace:
  `rm -rf ~/gemini-test && mkdir ~/gemini-test && cd ~/gemini-test`

## 1. Version & Env

1.1 `gemini --version` → shows `0.24.6-termux` 1.2 `node -v`, `uname -m`,
`echo $PREFIX` (expect Termux paths / aarch64)

## 2. CLI Basics

2.1 `gemini --help` exits 0 2.2 `gemini --help | grep "model"` shows model
option 2.3 `gemini --help | grep "auth\|logout"` shows auth commands

## 3. Hooks (Skipped)

_Feature not currently available in this build._

## 4. Extensions

4.1 `gemini extensions list` succeeds (even if empty) 4.2
`gemini extensions settings --help` prints settings schema/usage

## 5. MCP

5.1 `gemini mcp list` works (empty ok) 5.2 `gemini mcp add --help` exits 0 5.3
`gemini mcp --help` shows available commands

## 6. Non-interactive

6.1 `gemini -o json "echo hello"` returns JSON stream 6.2
`GEMINI_JSONL=1 gemini -o json "pwd"` produces JSONL (or a single JSON object)
6.3 `gemini "What is 2+2?"` returns correct answer

## 7. File ops (Termux safe)

7.1 `echo hi > file.txt` then `gemini -o json "read file.txt"` contains "hi" 7.2
`gemini -o json "ls"` lists current dir

## 8. Termux specifics

8.1 `termux-info` runs (or prints not available) without crash 8.2
`which termux-open-url` exists 8.3 `echo $LD_LIBRARY_PATH` preserved inside
`node -e "console.log(process.env.LD_LIBRARY_PATH)"` 8.4 No `base.json` parsing
errors in output

## 9. Package/binary

9.1 `ls $(npm root -g)/@mmmbuto/gemini-cli-termux/bundle/gemini.js` exists 9.2
`node bundle/gemini.js --version` (from repo) prints 0.24.6-termux 9.3
`ls -lh $(npm root -g)/@mmmbuto/gemini-cli-termux/bundle/gemini.js` shows ~21MB
bundle

## 10. PTY checks

10.1 `node -e "require('@mmmbuto/node-pty-android-arm64')"` should succeed 10.2
`node -e "require('node-pty')"` should fail gracefully (not installed)

## 11. Termux-API Integration (v0.22.1+)

11.1 **Detection**:
`node -e "console.log(require('./packages/core/dist/src/utils/termux-detect.js').isTermux())"`
returns `true`

11.2 **Tool Discovery**: - Run `bash scripts/termux-tools/discovery.sh` - Expect
JSON array with tools like `termux_battery_status`

11.3 **Tool Call**: - Run
`echo '{}' | bash scripts/termux-tools/call.sh termux_battery_status` - Expect
JSON output or valid Termux-API response

11.4 **Installation Helpers**: - `make termux-install` runs without error -
`scripts/termux-setup.sh` completes successfully

## 12. Context Memory & Memory Mode (v0.24.4+)

12.1 **Memory Mode UI** Open `/settings` → `Memory` and verify **Memory Mode**
exists with options: `default`, `jit`, `jit+json`.

12.2 **Default mode (GEMINI.md + JSON)** Set `Memory Mode = default`, restart
CLI. Create `~/.gemini/GEMINI.md` with a short line, delete
`~/.gemini/context_memory/user.json`, then start a session. Verify:

- `user.json` is created with a bootstrap entry from GEMINI.md
- `/memory show` includes `context_memory/user.json` and/or `base.json` blocks
- `/memory list` includes JSON paths alongside GEMINI.md paths

  12.3 **JIT mode (GEMINI.md only)** Set `Memory Mode = jit`, restart CLI.
  Verify:

- `/memory show` does **not** include `context_memory/*.json`
- `/memory list` shows only GEMINI.md files
- JSON files are not created or modified during startup

  12.4 **JIT + JSON** Set `Memory Mode = jit+json`, restart CLI. Verify:

- `/memory show` includes JSON blocks again
- `/memory list` includes JSON paths
- `/memory refresh` succeeds and keeps JSON in the combined output

  12.5 **Autoload toggles** In `/settings → Memory → Context Memory`, ensure
  primary = `GEMINI.md`, and auto-load flags are true. Toggle
  `Auto-load JSON Base` off, restart CLI → `/memory show` should omit
  `base.json` content.

  12.6 **Primary ordering** Set primary to `JSON User`, restart, run `/memory` →
  JSON user block appears before GEMINI.md in the displayed context list.

  12.7 **Journal mirror** Run `/save_memory "remember this fact"` in interactive
  mode → check `~/.gemini/context_memory/user.journal.jsonl` appended with one
  record; `user.json` remains compact (≤200 entries).

  12.8 **Read-only base toggle** With `Allow Base Memory Writes` OFF,
  `/save_memory {"target":"base"}` should fail; turn it ON then retry and see
  entry in `base.json`.

  12.9 **JSON validity** Verify `~/.gemini/context_memory/base.json` and
  `user.json` are valid JSON:
  `node -e "JSON.parse(require('fs').readFileSync(process.env.HOME + '/.gemini/context_memory/base.json', 'utf8')); console.log('OK')"`

## 13. Gemini 3 Flash (Upstream) ⚡⚡⚡

**CRITICAL**: Primary new feature from upstream merge.

13.1 **Model availability**: `gemini --help | grep -i flash` shows flash model
in docs/help

13.2 **Quick test**: `gemini --model gemini-3-flash-preview "What is 5+5?"` →
returns `10` - Expect faster response than regular models - No errors or
warnings about model not found

13.3 **Model comparison** (optional):
`bash      time gemini --model gemini-3-flash-preview "Quick test" > /dev/null      time gemini --model gemini-2-flash "Quick test" > /dev/null      `
→ Flash preview should be comparable or faster

13.4 **Long context test**: `seq 1 100 > numbers.txt`
`gemini --model gemini-3-flash-preview "Sum all numbers in numbers.txt"` →
Correct sum (5050) or reasonable attempt

13.5 **Settings integration**: Run `gemini` interactively, `/settings`, check if
Gemini 3 Flash appears in model list

## 14. Agent TOML Parser (Upstream)

14.1 **TOML loader presence**: `ls packages/core/dist/agents/toml-loader.js`
exists

14.2 **Agent definition test** (if applicable): Create test TOML agent file:
`bash      cat > test-agent.toml << 'EOF'      name = "test-agent"      description = "Test agent"      version = "0.1.0"      EOF      `
Verify CLI can parse it (check logs or settings for agent recognition)

## 15. Auth Logout (Upstream)

15.1 **Command availability**: `gemini --help | grep logout` shows
`/auth logout` command

15.2 **Logout test**: - Ensure you're authenticated first: `gemini --version`
(loads cached creds) - Run `gemini` interactively, type `/auth logout` - Confirm
dialog appears - Accept logout → credentials cleared - Verify `~/.gemini/`
credentials removed or reset

15.3 **Re-authentication**: After logout, run `gemini` again → prompts for API
key/auth

## 16. Upstream Integration Validation

16.1 **Late resolve Config**: Start gemini session, verify no config-related
errors in startup

16.2 **Model stats table**: If model stats are available, verify they display
correctly (no UI crashes)

16.3 **No regressions**: All previous tests (1-12) still pass

## 17. Termux Patches Integrity (Post-Merge)

17.1 **TERMUX\_\_PREFIX patch**:
`grep -q "TERMUX__PREFIX" ~/Dev/gemini-cli-termux/esbuild.config.js && echo OK`

17.2 **TTS guard**:
`grep -q "termux-tts-speak" ~/Dev/gemini-cli-termux/packages/core/src/tools/shell.ts && echo OK`

17.3 **Mobile settings**: In settings UI, verify "Mobile Settings" toggle exists

17.4 **Postinstall message**: `npm link` output shows Termux success banner

17.5 **Makefile targets**: `make -n termux-install` shows valid commands

## 18. Performance & Stability

18.1 **Bundle size**: `ls -lh ~/Dev/gemini-cli-termux/bundle/gemini.js` → ~21MB
(acceptable)

18.2 **Startup time** (cold start): `time gemini --version` → < 5 seconds

18.3 **Memory usage**: Start interactive session, run `ps aux | grep node` →
check RSS/VSZ reasonable (expect ~100-200MB for interactive mode)

18.4 **No memory leaks** (optional long test): Run 10 consecutive prompts,
verify memory doesn't grow excessively

## Expected Outcome

- **ALL steps run without crash**; informational steps may show empty lists.
- **No build commands required**; native optional deps may fail to build but CLI
  must still work.
- **Gemini 3 Flash** responds correctly and quickly.
- **All Termux patches** preserved and functional.
- **No regressions** from previous stable version.

## Known Issues / Limitations

- `node-pty` not available → some interactive shell features limited
- Secure keychain not available → credentials in plain files
- Tree-sitter bash parsing simplified
- Some upstream features may not be Termux-optimized

## Test Report Template

```markdown
# Test Report v0.22.7-termux

**Date**: YYYY-MM-DD **Device**: [ROG Phone 3 / Pixel 9 Pro / etc] **Node**:
vX.X.X **Termux**: [version]

| Section                | Status | Notes        |
| ---------------------- | ------ | ------------ |
| 1. Version & Env       | ✅/❌  |              |
| 2. CLI Basics          | ✅/❌  |              |
| 6. Non-interactive     | ✅/❌  |              |
| 11. Termux-API         | ✅/❌  |              |
| 12. Context Memory     | ✅/❌  |              |
| **13. Gemini 3 Flash** | ✅/❌  | **CRITICAL** |
| 14. Agent TOML         | ✅/❌  |              |
| 15. Auth Logout        | ✅/❌  |              |
| 17. Patches Integrity  | ✅/❌  |              |
| 18. Performance        | ✅/❌  |              |

**Overall**: ✅ PASS / ❌ FAIL

**Critical issues**: [list any blocking issues] **Minor issues**: [list
non-blocking issues]
```

---

**Version History**:

- v0.22.7-termux (2025-12-18): Added Gemini 3 Flash, Agent TOML, Auth Logout
  tests
- v0.22.3-termux (2025-12-17): Added Context Memory tests
- v0.22.1-termux (2025-12-15): Added Termux-API integration tests
- v0.22.0-termux (2025-12-12): Initial test suite
