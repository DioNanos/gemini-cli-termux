# Merge Analysis: v0.24.9-termux → v0.24.10-termux

**Date**: 2026-01-10  
**Current**: v0.24.9-termux  
**Target**: HideBanner fix  
**Delta**: Bug fix only (no upstream merge)  
**Conflicts Resolved**: 0

---

## Executive Summary

Patch hotfix per risolvere il problema con `ui.hideBanner` che non sopprimeva
tutti gli startup warnings. Nessun upstream merge, solo fix bug.

### Result

✅ **Patch applicata con successo**  
✅ **Test superati** (hideBanner: true nasconde warnings)  
✅ **Version bump a 0.24.10-termux**

---

## Changes

### 1. hideBanner Fix

**File**: `packages/cli/src/utils/userStartupWarnings.ts`

**Problem**:

- `ui.hideBanner` nascondeva solo l'header banner
- Il warning "Warning you are running Gemini CLI in your home directory" veniva
  ancora mostrato
- Il filtro in `AppContainer.tsx` rimuoveva solo un warning specifico

**Solution**:

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

**Result**: Con `hideBanner: true` in `.gemini/settings.json`, **TUTTI** gli
startup warnings vengono soppressi, incluso il warning home directory.

---

## Documentation Updates

### 1. docs/patches/README.md

- Aggiornato a v0.24.10-termux
- Aggiunta patch #17 (hideBanner fix)

### 2. README.md

- Versione aggiornata a 0.24.10-termux
- Tutti i riferimenti a v0.24.9 aggiornati a v0.24.10

### 3. GEMINI_TEST_REPORT_v0.24.10.md

- Nuovo test report creato
- Tutti i test PASS
- Validazione hideBanner fix

---

## Test Results

### hideBanner Validation

| Test                        | Settings                     | Expected      | Actual  | Status |
| --------------------------- | ---------------------------- | ------------- | ------- | ------ |
| hideBanner: true            | No warnings                  | No warnings   | ✅ PASS |
| hideBanner: false (default) | Show warnings                | Show warnings | ✅ PASS |
| Home directory warning      | Hidden when hideBanner: true | Hidden        | ✅ PASS |

---

## No Conflicts

Nessun conflitto con versioni precedenti. La patch è self-contained.

---

## Checklist

- [x] Patch hideBanner applicata
- [x] Version bump a 0.24.10-termux
- [x] Docs aggiornati (README.md, patches/README.md)
- [x] Test report creato (GEMINI_TEST_REPORT_v0.24.10.md)
- [x] Vecchi test report rimossi
- [x] Bundle creato e testato
- [x] GitHub push
- [x] Tag creato
- [x] GitHub release creata
- [x] npm publish (tag: latest)

---

## Conclusion

**Status**: ✅ **RELEASED**  
**Type**: Bug fix (hotfix)  
**Impact**: Improves UX by properly supporting hideBanner setting

**v0.24.10-termux is now live on npm and GitHub**

---

**Author**: DioNanos  
**Date**: 2026-01-10  
**Status**: ✅ Released  
**Tag**: v0.24.10-termux
