# Merge Analysis: 0.22.7-termux → 0.24.0-nightly

**Date**: 2025-12-27 **Current**: v0.22.7-termux **Target**:
v0.24.0-nightly.20251227.37be16243 **Delta**: ~55 commits upstream

---

## Executive Summary

Passare alla 0.24.0-nightly è **fattibile** ma richiede la risoluzione di
conflitti in 5 file. Le patch Termux essenziali sono isolate e possono essere
preservate.

### Raccomandazione

**Procedere con il merge alla 0.24.0-nightly** per le seguenti ragioni:

1. **Feature upstream importanti**: JIT context, A2A client, extension
   management, security fixes
2. **Patch Termux preservabili**: Tutte le nostre patch sono in file separati o
   isolati
3. **Conflitti gestibili**: Solo 5 file con conflitti, tutti risolvibili

---

## Patch Termux da Preservare (Essential)

| File/Feature                                        | Status      | Action Required                  |
| --------------------------------------------------- | ----------- | -------------------------------- |
| `packages/core/src/utils/termux-detect.ts`          | ✅ OK       | Nessuna azione (file nuovo)      |
| `scripts/postinstall.cjs`                           | ✅ OK       | Ri-aggiungere in package.json    |
| `scripts/termux-setup.sh`                           | ✅ OK       | Nessuna azione (file nuovo)      |
| `scripts/termux-tools/`                             | ✅ OK       | Nessuna azione (directory nuova) |
| `package.json` - `postinstall` script               | ⚠️ CONFLICT | Manuale: keep ours               |
| `package.json` - `@esbuild/android-arm64`           | ⚠️ CONFLICT | Manuale: re-add                  |
| `packages/cli/src/config/config.ts` - `isTermux()`  | ⚠️ CONFLICT | Manuale: merge both              |
| `packages/core/src/index.ts` - termux-detect export | ✅ OK       | Verifica solo                    |

---

## File con Conflitti (5)

### 1. package-lock.json

**Risoluzione**: `git checkout --ours package-lock.json` e poi `npm install`

### 2. package.json

**Conflitto**:

- Nome versione: `@google/gemini-cli` vs `@mmmbuto/gemini-cli-termux`
- Version: `0.24.0-nightly` vs `0.24.0-termux`
- Scripts: `postinstall` mancante upstream
- Dependencies: `@esbuild/android-arm64` mancante upstream

**Risoluzione**:

```json
{
  "name": "@mmmbuto/gemini-cli-termux",
  "version": "0.24.0-termux",
  "repository": {
    "url": "https://github.com/DioNanos/gemini-cli-termux.git"
  },
  "scripts": {
    // ... upstream scripts ...
    "postinstall": "node scripts/postinstall.cjs || true"
  },
  "files": ["bundle/", "scripts/postinstall.cjs", "README.md", "LICENSE"],
  "dependencies": {
    // ... upstream deps ...
    "@esbuild/android-arm64": "^0.27.1"
  }
}
```

### 3. packages/cli/src/config/config.ts

**Conflitto**: Context memory (nostra implementazione) vs JIT context (upstream)

Upstream ha aggiunto `experimentalJitContext` in
`settings.experimental?.jitContext`. La nostra implementazione context memory è
più complessa (base/user/journal split).

**Risoluzione**:

```typescript
// Mantenere entrambe le logiche con fallback
const contextMemoryOptions = buildContextMemoryOptions(settings);
const experimentalJitContext = settings.experimental?.jitContext ?? false;

let memoryContent = '';
let fileCount = 0;
let filePaths: string[] = [];

if (!experimentalJitContext) {
  // Nostro context memory system
  const result = await loadServerHierarchicalMemory(
    cwd,
    [],
    debugMode,
    quietMode,
    memoryImportFormat,
    memoryFileFiltering,
    settings.context?.discoveryMaxDirs,
    contextMemoryOptions,
  );
  memoryContent = result.memoryContent;
  fileCount = result.fileCount;
  filePaths = result.filePaths;
} else {
  // Upstream JIT context (minimal)
  const result = await loadServerHierarchicalMemory(
    cwd,
    [],
    debugMode,
    quietMode,
    memoryImportFormat,
    memoryFileFiltering,
    settings.context?.discoveryMaxDirs,
  );
  memoryContent = result.memoryContent;
  fileCount = result.fileCount;
  filePaths = result.filePaths;
}
```

**Import da preservare**:

```typescript
import {
  isTermux,
  setRuntimeContextMemoryOptions,
} from '@google/gemini-cli-core';
```

**Logica isTermux da preservare**:

```typescript
const allowedTools = argv.allowedTools || settings.tools?.allowed || [];
if (isTermux() && !allowedTools.includes(SHELL_TOOL_NAME)) {
  allowedTools.push(SHELL_TOOL_NAME);
}
```

### 4. packages/core/src/config/config.ts

**Conflitto**: Import type differences

**Risoluzione**: Keep ours (include context memory types)

### 5. packages/core/src/utils/shell-utils.ts

**Conflitto**: web-tree-sitter import position

Upstream ha spostato l'import dentro la funzione. Noi lo abbiamo in alto.

**Risoluzione**: Keep upstream (la loro ottimizzazione è migliore)

---

## Feature Upstream Notevoli (0.22.7 → 0.24.0)

| Commit      | Feature                              | Relevance to Termux |
| ----------- | ------------------------------------ | ------------------- |
| `37be16243` | Shell command allowlisting in policy | 🔒 Security         |
| `563d81e08` | In-CLI extension install/uninstall   | 🆕 Feature          |
| `02a36afc3` | A2A Client Manager                   | 🆕 Feature          |
| `6be034392` | Automatic `/model` persistence       | 📱 UX               |
| `3b1dbcd42` | Secrets sanitization                 | 🔒 Security         |
| `e9a601c1f` | MCPServerConfig fix                  | 🔧 Bugfix           |
| `e6344a8c2` | Project-level hook warnings          | 🔒 Security         |
| `0a216b28f` | Fix EIO crash in readStdin           | 🐛 Bugfix           |
| `8feeffb29` | Fix infinite relaunch loop           | 🐛 Bugfix           |
| `2e229d3bb` | JIT context memory                   | 🚀 Performance      |

---

## Procedure di Merge

### Step 1: Preparazione

```bash
cd ~/Dev/gemini-cli-termux
git fetch upstream --tags
git checkout -b merge-0.24.0-termux
```

### Step 2: Merge

```bash
git merge v0.24.0-nightly.20251227.37be16243 --no-edit
```

### Step 3: Risoluzione Conflitti

```bash
# 1. package-lock.json - keep ours
git checkout --ours package-lock.json

# 2. package.json - edit manuale
# (vedere sezione sopra)

# 3. packages/cli/src/config/config.ts - merge manuale
# (vedere sezione sopra)

# 4. packages/core/src/config/config.ts - keep ours
git checkout --ours packages/core/src/config/config.ts

# 5. packages/core/src/utils/shell-utils.ts - keep upstream
git checkout --theirs packages/core/src/utils/shell-utils.ts
```

### Step 4: Verifica

```bash
# Verifica patch Termux
bash scripts/check-termux-patches.sh

# Verifica imports
grep -r "isTermux" packages/cli/src/config/config.ts
grep "termux-detect" packages/core/src/index.ts

# Build test
npm install
npm run build
npm run bundle
node bundle/gemini.js --version  # deve essere 0.24.0-termux
```

### Step 5: Commit

```bash
git add .
git commit -m "merge: upstream v0.24.0-nightly + Termux patches preserved

- Merged v0.24.0-nightly.20251227.37be16243 (55 commits)
- Preserved Termux patches:
  - termux-detect.ts utility
  - postinstall.cjs message
  - termux-setup.sh helper
  - termux-tools/ integration
  - isTermux() in config.ts
  - Context memory system (base/user/journal)
- Resolved conflicts in 5 files
- Version bump to 0.24.0-termux
"
```

### Step 6: Tag e Test

```bash
git tag v0.24.0-termux
npm run bundle
# Test su Termux
```

---

## Aggiornamenti da Fare Post-Merge

### docs/patches/README.md

Aggiornare versione a 0.24.0-termux e aggiungere nuove feature upstream.

### README.md

Aggiornare versione expected da:

```markdown
gemini --version # expected: 0.22.2-termux (npm latest)
```

a:

```markdown
gemini --version # expected: 0.24.0-termux (npm latest)
```

### package.json (packages/cli)

Aggiornare versione e sandboxImageUri.

---

## Rischio e Mitigazione

| Rischio                   | Probabilità | Mitigazione                            |
| ------------------------- | ----------- | -------------------------------------- |
| Context memory regression | Bassa       | Test completo memory system            |
| Shell tool breakage       | Bassa       | Verificare isTermux() logic            |
| Build failure             | Molto bassa | prepare-termux: npm install (no flags) |
| npm publish issues        | Bassa       | Verificare files array in package.json |

---

## Checklist Pre-Merge

- [ ] Backup del branch corrente (`git branch backup-pre-0.24`)
- [ ] Fetch upstream tags
- [ ] Verificare che `termux-detect.ts` è esportato in core/index.ts
- [ ] Verificare che `postinstall.cjs` esiste
- [ ] Verificare che `scripts/termux-tools/` è completo

---

## Checklist Post-Merge

- [ ] Tutti i 5 conflitti risolti
- [ ] `bash scripts/check-termux-patches.sh` passa
- [ ] `npm run build` completa senza errori
- [ ] `npm run bundle` crea `bundle/gemini.js`
- [ ] `node bundle/gemini.js --version` mostra 0.24.0-termux
- [ ] Test funzionali su Termux (shell, clipboard, etc.)
- [ ] Aggiornato README.md
- [ ] Aggiornato docs/patches/README.md
- [ ] Creato tag v0.24.0-termux

---

**Autore**: DioNanos **Data**: 2025-12-27 **Stato**: Pronto per merge
