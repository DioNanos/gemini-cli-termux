# v0.24.10-termux - hideBanner Fix

**Date**: 2026-01-10  
**Type**: Bug fix (hotfix)  
**Base Version**: v0.24.9-termux

---

## Overview

Versione hotfix che risolve un bug nella implementazione di `ui.hideBanner`.
Nessuna nuova feature upstream, solo fix del comportamento esistente.

---

## Bug Fixed

### hideBanner Setting

**Issue**: `ui.hideBanner` setting non sopprimeva tutti gli startup warnings

**Problem**:

- `ui.hideBanner: true` nascondeva solo l'header banner
- Gli startup warnings (come "Warning you are running Gemini CLI in your home
  directory") venivano comunque mostrati
- Il filtro in `AppContainer.tsx` rimuoveva solo un warning specifico

**Root Cause**:

- Il filtro in `AppContainer.tsx` operava POST generazione degli warnings
- `getUserStartupWarnings()` generava tutti i warnings indipendentemente da
  hideBanner
- hideBanner controllava solo l'header, non i warnings

**Solution**:

- Aggiunto check early return in `getUserStartupWarnings()`
- Quando `settings.ui?.hideBanner` è true, ritorna array vuoto immediatamente
- Nessun warning viene generato o mostrato

**Files Modified**:

- `packages/cli/src/utils/userStartupWarnings.ts`

**Code Change**:

```typescript
export async function getUserStartupWarnings(
  settings: Settings,
  workspaceRoot: string = process.cwd(),
): Promise<string[]> {
  // TERMUX PATCH: If hideBanner is true, skip all startup warnings
  if (settings.ui?.hideBanner) {
    return [];
  }
  const results = await Promise.all(
    WARNING_CHECKS.map((check) => check.check(workspaceRoot, settings)),
  );
  return results.filter((msg) => msg !== null);
}
```

---

## Testing

### Manual Tests (Termux ARM64)

| Test                   | Settings          | Expected      | Actual        | Status  |
| ---------------------- | ----------------- | ------------- | ------------- | ------- |
| CLI startup            | hideBanner: true  | No warnings   | No warnings   | ✅ PASS |
| CLI startup            | hideBanner: false | Show warnings | Show warnings | ✅ PASS |
| Home directory warning | hideBanner: true  | Hidden        | Hidden        | ✅ PASS |
| Home directory warning | hideBanner: false | Shown         | Shown         | ✅ PASS |

**Test Environment**:

- Device: ROGPhone3 (Termux ARM64)
- Node: v24.12.0
- Platform: Android aarch64

**See**: `GEMINI_TEST_REPORT_v0.24.10.md` for full test results

---

## Documentation

### Updated Files

1. **docs/patches/README.md**
   - Updated to v0.24.10-termux
   - Added patch #17 (hideBanner fix)

2. **README.md**
   - Updated expected version to 0.24.10-termux

3. **GEMINI_TEST_REPORT_v0.24.10.md**
   - New test report created
   - All tests PASS
   - hideBanner fix validated

---

## Release Notes

### What Changed

- Fixed `ui.hideBanner` setting to properly suppress all startup warnings
- Patch applied in `packages/cli/src/utils/userStartupWarnings.ts`
- Version bump to 0.24.10-termux

### Installation

```bash
npm install -g @mmmbuto/gemini-cli-termux@latest
```

---

## Compatibility

- ✅ No breaking changes
- ✅ Backward compatible with v0.24.9-termux
- ✅ All Termux patches preserved
- ✅ Bundle size stable (~22MB)

---

**Author**: DioNanos  
**Date**: 2026-01-10  
**Status**: ✅ Released  
**Tag**: v0.24.10-termux
