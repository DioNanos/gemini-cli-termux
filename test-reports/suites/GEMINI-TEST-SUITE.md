# Gemini CLI Termux - Manual Functional Test Suite

## Overview

This suite provides manual functional tests for `@mmmbuto/gemini-cli-termux` on
Termux/Android, focusing on critical user-facing features and Termux-specific
integrations. It complements automated tests by validating user experience,
environment peculiarities, and fork-specific behaviors after new versions or
upstream merges.

## Prerequisites

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts termux-api
npm install -g @mmmbuto/gemini-cli-termux@latest
```

Ensure `gemini` is available in your PATH.

## Test Categories

### 1. Installation & Basic Functionality Tests

- [ ] Package installs without errors (observe `npm install` output)
- [ ] `gemini --version` returns `0.42.0-termux` (or current expected version)
- [ ] Global bin link is created (`which gemini` should output a path like
      `$PREFIX/bin/gemini`)
- [ ] `gemini --help` displays help message correctly
- [ ] Package.json version matches tag (verify with
      `npm info @mmmbuto/gemini-cli-termux version`)

### 2. Core Gemini Functionality Tests

- [ ] Interactive mode starts (`gemini` without arguments, verify prompt
      appears)
- [ ] Basic prompt works (`gemini -p "Say hello"`)
- [ ] `--model` flag accepts a valid model name (e.g.,
      `gemini -p "hello" --model "gemini-3-pro-preview"`)
- [ ] `/help` command in ACP mode displays general help
- [ ] `/about` command in ACP mode displays information about the CLI
- [ ] `TopicTool`: Can initiate a new topic and recall it (e.g.,
      `gemini -p "/topic new MyTestTopic"`, then `gemini -p "/topic list"` to
      verify)
- [ ] Persistent browser session: If an auth flow (e.g., for a new tool)
      requires browser interaction, verify it launches and reconnects without
      issues after closing/reopening CLI.

### 2b. Current upstream feature checks

- [ ] Persistent browser session management: Open a browser auth flow, close
      CLI, reopen — session should persist and reconnect
- [ ] TopicTool state preservation: Create a topic, exit CLI, restart — topic
      state should be intact (`/topic list` shows previous topics)
- [ ] JSONL chat recording: Run `gemini -p "test"` with recording enabled,
      verify `.jsonl` file is created and contains valid JSON lines
- [ ] Context management refactor: Verify settings schema is unified — run
      `/settings` and confirm no duplicate or conflicting options
- [ ] Tool output distillation: Instruct gemini to run a command with verbose
      output, verify output is summarized/distilled correctly
- [ ] Agent history provider: Ask
      `gemini -p "What did we do in the previous turn?"` after a multi-turn
      conversation, verify history is accessible
- [ ] ACP mode `/help` and `/about`: Enter ACP mode, run both commands, verify
      they display correct help and about information
- [ ] Tokyo Night theme: Apply Tokyo Night theme via settings, verify visual
      appearance changes correctly

### 3. Termux-Specific Integrations

- [ ] `termux-open-url` integration: Trigger an action that requires opening a
      URL (e.g., auth flow for a new tool or requesting a web search via prompt
      if WebFetch is enabled), verify that Termux prompts to open a browser.
- [ ] `termux-tts-speak` for TTS notifications: Verify that `tts_notification`
      tool (if available via MCP) or any feature using TTS works by hearing
      audio output.
- [ ] PTY works: Run a shell command through `gemini` that requires PTY
      interaction (e.g.,
      `gemini -p "Execute 'ls -l /data/data/com.termux/files/home'"`), verify
      output and interaction.
- [ ] `termux-detect` returns correct value: Execute
      `gemini -p "What is my operating system?"` and verify it correctly
      identifies Termux/Android.

### 4. Tool & MCP Interaction Tests

- [ ] File read/write works: Instruct
      `gemini -p "Write 'hello world' to a file named 'test.txt' and then read its content back."`
      Verify content.
- [ ] Shell commands execute: Instruct
      `gemini -p "Execute 'echo Hello from shell'"`. Verify output.
- [ ] MCP servers can be configured and listed: Instruct
      `gemini -p "List configured MCP servers"`. Verify output shows expected
      server names (e.g., VPS1, VPS3).

### 5. UI & Theming Tests

- [ ] Tokyo Night theme: Change the theme to "Tokyo Night" if theme changing
      feature is available (e.g., via settings or command), verify visual
      appearance.

## Running Tests

Perform each test step manually or using the provided `gemini -p` command
examples. Observe the output and behavior.

```bash
# Example: Check version
gemini --version

# Example: Say hello (Core Functionality)
gemini -p "Say hello"

# Example: List topics (TopicTool)
gemini -p "/topic list"

# Example: Read/Write file (Tool Test)
gemini -p "Write 'temporary content' to 'temp.txt' and read it back."
```

## Expected Output

All tests should complete successfully, reflecting expected behavior for Gemini
CLI Termux edition. No PTY or permission errors should occur during normal
operation. User prompts and interactive flows should be clear and functional.
