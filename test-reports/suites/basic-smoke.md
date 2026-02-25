# Gemini CLI Termux Basic Smoke Suite

Goal: validate the Termux fork runtime after merge/patch refresh.

Target: Android + Termux (ARM64)

## 0. Prep

- Use a clean directory: `rm -rf ~/gemini-test && mkdir ~/gemini-test && cd ~/gemini-test`
- Confirm fork binary is the one installed: `which gemini`

## 1. Version / Package Identity

1. `gemini --version` prints a `-termux` version.
2. `npm root -g | xargs -I{} ls {}/@mmmbuto/gemini-cli-termux/package.json`
3. `node $(npm root -g)/@mmmbuto/gemini-cli-termux/bundle/gemini.js --version` matches step 1.

## 2. Termux Environment Detection

1. `node -e "console.log(process.platform)"` -> `android`
2. `echo "$PREFIX"` contains `com.termux`
3. `which termux-open-url` exists
4. `which termux-tts-speak` exists (if `termux-api` installed)

## 3. CLI Basics

1. `gemini --help` exits 0
2. `gemini /help` starts and shows help in interactive mode (after auth if needed)
3. `gemini -p "What is 2+2?" -o json` returns valid output

## 4. PTY / Interactive Runtime (Termux Patch)

1. `node -e "import('@mmmbuto/pty-termux-utils').then(m=>m.getPty().then(x=>console.log(x?.name||'none')) )"`
2. Result is `mmmbuto-node-pty` (or a valid fallback), not crash.
3. Start `gemini` interactively and verify input rendering works (no blank CI-style UI).
4. Run a shell tool action in session (simple `pwd`) and confirm no PTY crash.

## 5. Browser / Auth Flow (Termux Patch)

1. `gemini /auth` starts auth flow without `xdg-open` error.
2. Browser launch uses `termux-open-url` behavior.
3. No unsupported-platform error from secure browser launcher.

## 6. TTS Tool (Termux Feature)

Prereq: `pkg install termux-api`

1. In `/settings`, enable `General -> Enable Notifications`.
2. Ask the agent to call `tts_notification` with a short message.
3. Audio is spoken via Android TTS (or a clear non-crashing message if unavailable).
4. Disable notifications and repeat: tool should skip cleanly (no crash).

## 7. Update / Package Command (Fork Patch)

1. Trigger update check message (or inspect code path) and confirm suggested command uses `@mmmbuto/gemini-cli-termux`.
2. No update guidance points to `@google/gemini-cli`.

## 8. Build / Bundle (Source Install Path)

From repo root:

1. `npm run build`
2. `npm run bundle`
3. `node bundle/gemini.js --version` matches root `package.json` version
4. `node -e "console.log(require('./bundle/package.json').name, require('./bundle/package.json').version)"` prints fork package + same version

## 9. Patch Integrity Script

1. `bash scripts/check-termux-patches.sh` returns success

## 10. Expected Outcome

- No crashes in CLI startup, PTY shell execution, browser launch, or TTS tool.
- Version output and packaged bundle version are consistent.
- Fork package identity is preserved in update/install commands.

## Report Template

```markdown
# Test Report <version>

Date: YYYY-MM-DD
Device: <device>
Node: <node version>
Termux: <termux version>
Termux API: installed / not installed

| Section | Status | Notes |
| --- | --- | --- |
| 1. Version / Package Identity | ✅/❌ | |
| 2. Termux Environment Detection | ✅/❌ | |
| 3. CLI Basics | ✅/❌ | |
| 4. PTY / Interactive Runtime | ✅/❌ | |
| 5. Browser / Auth Flow | ✅/❌ | |
| 6. TTS Tool | ✅/❌ | |
| 7. Update / Package Command | ✅/❌ | |
| 8. Build / Bundle | ✅/❌ | |
| 9. Patch Integrity Script | ✅/❌ | |

Overall: ✅ PASS / ❌ FAIL
```
