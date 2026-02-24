# Test Reports

This folder contains human-run validation reports for Gemini CLI Termux Edition.

## Latest Release

- **v0.30.0-termux**: Development branch (merge/v0.30.0-termux)
- **v0.28.0-termux**: `0.28.0-termux/`

## Report Index

| Version        | Report                           | Date       | Status     |
| -------------- | -------------------------------- | ---------- | ---------- |
| v0.30.0-termux | (pending release)                | -          | 🚧 WIP     |
| v0.28.0-termux | `0.28.0-termux/README.md`        | 2026-02-02 | ✅ Stable  |

## Test Suites

Runnable checklists live under:

- `suites/`

## Notes

External baselines and reference notes:

- `notes/`

## Quick Test (Post-Install)

```bash
# 1. Version check
gemini --version

# 2. Basic smoke test
gemini -p "What is 2+2?"

# 3. Auth check
gemini /auth

# 4. Help check
gemini /help
```

## Reporting Issues

Found a Termux-specific issue? Please open an issue with:

1. Gemini CLI version: `gemini --version`
2. Node.js version: `node --version`
3. Termux version: `pkg show termux`
4. Steps to reproduce
5. Expected vs actual behavior
6. Error logs

---

**Last Updated**: 2026-02-24
**Maintainer**: @DioNanos
