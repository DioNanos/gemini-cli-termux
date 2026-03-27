# Gemini CLI Termux - Full Executable Test Suite

## Overview

Full validation suite for `@mmmbuto/gemini-cli-termux` on Termux/Android.

## Prerequisites

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts termux-api
npm install -g @mmmbuto/gemini-cli-termux@latest
```

## Test Categories

### 1. Installation Tests

- [ ] Package installs without errors
- [ ] `gemini --version` returns correct version
- [ ] Global bin link is created (`$PREFIX/bin/gemini`)

### 2. Core Functionality Tests

- [ ] Interactive mode starts (`gemini`)
- [ ] `--version` flag works
- [ ] `--help` flag works
- [ ] `--model` flag accepts values
- [ ] API key auth flow starts (`GEMINI_API_KEY=xxx gemini`)

### 3. Termux-Specific Tests

- [ ] `termux-open-url` integration for browser auth
- [ ] `termux-tts-speak` for TTS notifications
- [ ] PTY works via `@mmmbuto/pty-termux-utils`
- [ ] `termux-detect` returns correct value

### 4. Tool Tests

- [ ] File read/write works
- [ ] Shell commands execute
- [ ] MCP servers can be configured

### 5. Integration Tests

```bash
npm run test:e2e
```

## Running Tests

```bash
# Full suite (requires Gemini API key)
gemini -p "Say hello and confirm you are running on Termux"

# Specific tool test
gemini -p "Write a test file and read it back"

# MCP test
gemini -p "List configured MCP servers"
```

## Expected Output

All tests should complete without PTY or permission errors.
