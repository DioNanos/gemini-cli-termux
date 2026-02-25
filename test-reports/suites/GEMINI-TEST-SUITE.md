# Gemini CLI Termux Executable Test Suite

Goal: validate the published Termux executable package (`@mmmbuto/gemini-cli-termux`) on Android/Termux before release sign-off.

Target: Android + Termux (ARM64), installed package (global npm install)

Scope: Termux-only fork behavior. Desktop/macOS/Linux checks are out of scope.

## 0. Test Setup (Required)

1. Use a clean test directory:
   `rm -rf ~/gemini-exec-test && mkdir ~/gemini-exec-test && cd ~/gemini-exec-test`
2. Capture environment:
   `uname -a`
   `node -v`
   `npm -v`
   `pkg show termux | head -20`
   `pkg show termux-api | head -20 || true`
3. Confirm Termux runtime:
   `node -e "console.log(process.platform, process.arch)"`
   Expected: `android arm64` (or `android aarch64` depending on output formatting)

## 1. Install / Upgrade (Executable Under Test)

1. Install or upgrade the published package:
   `npm install -g @mmmbuto/gemini-cli-termux@latest`
2. Confirm installed package:
   `npm ls -g --depth=0 @mmmbuto/gemini-cli-termux || true`
3. Confirm executable path:
   `which gemini`
4. Confirm executable resolves to the fork package path (not upstream package):
   `npm root -g`
   `ls "$(npm root -g)/@mmmbuto/gemini-cli-termux/package.json"`

## 2. Version / Package Identity (Critical)

1. `gemini --version`
   Expected: version ends with `-termux`
2. `node "$(npm root -g)/@mmmbuto/gemini-cli-termux/bundle/gemini.js" --version`
   Expected: matches step 1 exactly
3. `node -e "const p=require('fs').readFileSync(process.argv[1],'utf8'); const j=JSON.parse(p); console.log(j.name,j.version)" "$(npm root -g)/@mmmbuto/gemini-cli-termux/package.json"`
   Expected: `@mmmbuto/gemini-cli-termux <same version>`
4. `node -e "const p=require('fs').readFileSync(process.argv[1],'utf8'); const j=JSON.parse(p); console.log(j.name,j.version,j.type)" "$(npm root -g)/@mmmbuto/gemini-cli-termux/bundle/package.json"`
   Expected: `@mmmbuto/gemini-cli-termux <same version> module`

## 3. Termux Integration Prereqs (Critical)

1. `echo "$PREFIX"`
   Expected: contains `com.termux`
2. `command -v termux-open-url`
   Expected: found
3. `command -v termux-tts-speak || true`
   Expected: found if `termux-api` installed
4. `node -e "console.log('PREFIX', !!process.env.PREFIX, 'TERMUX__PREFIX', !!process.env.TERMUX__PREFIX)"`
   Expected: no crash (runtime env check only)

## 4. CLI Startup / Help (Critical)

1. `gemini --help`
   Expected: exits 0
2. `gemini -h`
   Expected: exits 0
3. `gemini --version`
   Expected: still the same `-termux` version (sanity repeat)
4. Start interactive CLI:
   `gemini`
   Expected: TUI starts, no immediate crash, prompt visible

## 5. Auth / Browser Flow (Termux Patch)

Run inside an interactive `gemini` session:

1. `/auth`
2. Confirm browser opens via Termux behavior (`termux-open-url`), not `xdg-open`
3. Confirm no unsupported platform error
4. If you cancel auth, CLI remains usable and does not crash

Expected failure modes that should NOT appear:
- `xdg-open: not found`
- `Unsupported platform: android`
- fatal error after `/auth`

## 6. PTY / Interactive Shell Execution (Critical Termux Patch)

1. Verify PTY provider loads:
   `node -e "import('@mmmbuto/pty-termux-utils').then(m=>m.getPty().then(x=>console.log(x?.name||'none')).catch(e=>{console.error(e);process.exit(1)}))"`
2. Expected: `mmmbuto-node-pty` (or valid fallback) and no crash
3. In interactive `gemini`, send a simple prompt and confirm normal rendering (no CI-like blank UI)
4. Ask the agent to run a shell command (`pwd`)
5. Ask the agent to run another shell command (`ls`)
6. Confirm shell output renders and session stays alive (no PTY crash)

## 7. Basic Tooling / File Ops (Executable Behavior)

In `~/gemini-exec-test`:

1. `printf 'hello-termux\\n' > sample.txt`
2. Start `gemini`
3. Ask the agent to read `sample.txt`
4. Ask the agent to create `sample2.txt` with a short line
5. Confirm both file operations succeed and no permission/path regressions appear

Expected:
- reads local files correctly
- writes local files in working directory
- no unexpected sandbox/path errors for normal local usage

## 8. Non-Interactive Mode (Critical)

1. `gemini -p "What is 2+2?"`
   Expected: returns a normal response
2. `gemini -p "What is 2+2?" -o json`
   Expected: valid JSON output
3. `gemini -p "Print the current working directory only" -o text`
   Expected: text output, no TUI startup
4. `gemini -p "List files in current directory"` (from `~/gemini-exec-test`)
   Expected: no crash in prompt mode

## 9. TTS Tool (Termux Feature)

Prereq: `pkg install termux-api`

1. In interactive `gemini`, open `/settings`
2. Enable `General -> Enable Notifications`
3. Ask the agent: "Use the `tts_notification` tool to say: test notification from termux"
4. Expected: Android TTS plays audio, or a clear non-crashing best-effort result if device TTS is unavailable
5. Disable notifications
6. Ask the agent again to use `tts_notification`
7. Expected: tool skips cleanly with a message, no crash

## 10. Update Message / Package Name (Fork Identity Patch)

1. If an update prompt appears, inspect the suggested install/update command
2. Expected package name in suggestions: `@mmmbuto/gemini-cli-termux`
3. Confirm no guidance points to `@google/gemini-cli`

If no update prompt appears:
4. Record `N/A (no update available)` and continue

## 11. Stability / Regression Notes (Recommended)

1. Start and exit `gemini` three times
2. Run one interactive session that uses:
   - one shell tool call
   - one file read/write action
   - one `/auth` attempt (or skip if already authenticated and no browser test needed)
   - one `tts_notification` call (if `termux-api` installed)
3. Confirm no crashes, hangs, or broken redraws

## 12. Optional Source Checks (Only If Testing Local Repo Build)

Only run this if you are testing from a local source checkout, not the published executable:

1. `bash scripts/check-termux-patches.sh`
2. `npm run build`
3. `npm run bundle`
4. `node bundle/gemini.js --version`
5. Confirm source-built bundle version matches the repo `package.json`

## 13. Pass / Fail Criteria

Release candidate is acceptable for executable testing if:

- Version and bundle package identity are consistent and end with `-termux`
- Auth/browser flow works on Termux without `xdg-open` or platform errors
- PTY-backed shell execution works in interactive mode
- Non-interactive mode works without crashes
- TTS tool behaves correctly (speak or safe no-crash fallback)
- No fork identity regressions (`@google/gemini-cli` in update guidance)

## 14. Test Report Template

```markdown
# Gemini CLI Termux Executable Test Report <version>

Date: YYYY-MM-DD
Tester: <name>
Device: <device model>
Android: <version>
Termux: <pkg show termux version>
Termux API: installed / not installed
Node: <node -v>
npm: <npm -v>

Installed package:
- `@mmmbuto/gemini-cli-termux@<version>`

| Section | Status | Notes |
| --- | --- | --- |
| 0. Test Setup | ✅/❌ | |
| 1. Install / Upgrade | ✅/❌ | |
| 2. Version / Package Identity | ✅/❌ | |
| 3. Termux Integration Prereqs | ✅/❌ | |
| 4. CLI Startup / Help | ✅/❌ | |
| 5. Auth / Browser Flow | ✅/❌ | |
| 6. PTY / Interactive Shell Execution | ✅/❌ | |
| 7. Basic Tooling / File Ops | ✅/❌ | |
| 8. Non-Interactive Mode | ✅/❌ | |
| 9. TTS Tool | ✅/❌ | |
| 10. Update Message / Package Name | ✅/❌/N/A | |
| 11. Stability / Regression Notes | ✅/❌ | |
| 12. Optional Source Checks | ✅/❌/N/A | |

Overall: ✅ PASS / ❌ FAIL

Blocking issues:
- <issue 1>
- <issue 2>
```

## 15. Save Location

Save reports under:

- `test-reports/<version>/`

Example:

- `test-reports/0.30.5-termux/TEST-REPORT-YYYY-MM-DD.md`
