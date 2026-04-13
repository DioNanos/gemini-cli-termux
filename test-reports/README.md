# Test Reports

This directory contains test suites and validation reports for Gemini CLI Termux
Edition.

## Structure

```
test-reports/
├── README.md              # This file
├── suites/
│   ├── GEMINI-TEST-SUITE.md   # Full manual test suite
│   └── basic-smoke.md         # Quick smoke test
└── [version]/
    └── TEST-REPORT-YYYY-MM-DD.md  # Validation report
```

## Latest Report

- [**0.37.1-termux** — TEST-REPORT-2026-04-13](./0.37.1-termux/TEST-REPORT-2026-04-13.md)

## Report Archive

| Version       | Date       | Report                                                              |
| ------------- | ---------- | ------------------------------------------------------------------- |
| 0.37.1-termux | 2026-04-13 | [TEST-REPORT-2026-04-13](./0.37.1-termux/TEST-REPORT-2026-04-13.md) |
| 0.35.2-termux | 2026-03-27 | [TEST-REPORT-2026-03-27](./0.35.2-termux/TEST-REPORT-2026-03-27.md) |

## Quick Start

1. Run basic smoke test: `gemini -p "OK"`
2. Check version: `gemini --version`
3. Full validation: see [GEMINI-TEST-SUITE.md](./suites/GEMINI-TEST-SUITE.md)
4. Automated tests: `npm test` (from repo root)
