# Test Reports

Human-run validation reports for the Termux-only fork.

## Scope

These reports are for Android/Termux behavior only.
Desktop/macOS/Linux validation is out of scope for this fork.

## Structure

- `suites/` runnable checklists (what to test)
- `notes/` reference notes
- `<version>/` completed reports

## Quick Post-Install Smoke

```bash
gemini --version
gemini --help | head
which termux-open-url
which termux-tts-speak || true
```

## Report Checklist Metadata

When creating a report, include:

1. Fork version (`gemini --version`)
2. Node version (`node -v`)
3. Device model
4. Termux version (`pkg show termux`)
5. Termux API installed/not installed (`pkg show termux-api`)
6. Pass/fail notes per suite section
