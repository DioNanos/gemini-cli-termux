# Test Reports

This directory contains test suites and validation reports for Gemini CLI Termux Edition.

## Structure

```
test-reports/
├── README.md              # This file
├── suites/
│   ├── GEMINI-TEST-SUITE.md   # Full test suite
│   └── basic-smoke.md         # Quick smoke test
└── [version]/
    └── TEST-REPORT-YYYY-MM-DD.md  # Validation report
```

## Quick Start

1. Run basic smoke test: `bundle/gemini.js -p "OK"`
2. Check version: `bundle/gemini.js --version`
3. Full validation: see `suites/GEMINI-TEST-SUITE.md`
