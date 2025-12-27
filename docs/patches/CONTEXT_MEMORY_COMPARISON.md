# Confronto: contextMemory.ts vs JIT Context Memory

## Tabella Comparativa

| Caratteristica          | contextMemory.ts (Termux)     | JIT Context Memory (Upstream) |
| ----------------------- | ----------------------------- | ----------------------------- |
| **Architettura**        | Dual JSON + Journal           | Lazy loader + Event system    |
| **Persistenza**         | 3 file (base/user/journal)    | File .gemini.md esistenti     |
| **Formato**             | JSON strutturato              | Markdown nativo               |
| **Validazione**         | Ajv schema (UUID, date, enum) | Nessuna                       |
| **Scoping**             | global/host/project           | None                          |
| **Sensitivity filter**  | Sì (low/medium/high)          | No                            |
| **Expiration**          | Sì (expiresAt)                | No                            |
| **Journal append-only** | Sì (JSONL)                    | No                            |
| **Compaction**          | Sì (automatica)               | No                            |
| **MCP import**          | Sì (integrato)                | No                            |
| **UI sync events**      | No                            | Sì (CoreEvent.MemoryChanged)  |
| **Performance**         | Batch load + merge            | Lazy load                     |
| **Complessità**         | Alta (~650 righe)             | Media (~150 righe)            |
| **Configurabilità**     | Molto alta                    | Bassa (on/off)                |
| **Portable**            | Sì (JSON)                     | No (dipende da file system)   |

---

## Analisi Dettagliata

### 1. Architettura

#### contextMemory.ts (Termux)

```
base.json (read-only, di default)
  ↓
user.json (read-write)
  ↓
user.journal.jsonl (append-only)
  ↓
merge + compaction → snapshot in user.json
```

**Vantaggi:**

- Separazione netta tra base (amministratore) e user (utente)
- Journal append-only per tracciabilità
- Compaction automatica quando journal > 2MB
- Merge-safe (più processi possono scrivere nel journal)

#### JIT Context Memory (Upstream)

```
ContextManager.refresh()
  ↓
loadGlobalMemory() → .gemini/Instruction.md
  ↓
loadEnvironmentMemory() → *.gemini.md nel workspace
  ↓
getUserMemory() → getGlobalMemory() + getEnvironmentMemory()
```

**Vantaggi:**

- Usa file .gemini.md esistenti (niente nuovi formati)
- Lazy loading (carica solo quando serve)
- Event system per UI sync
- Semplice da capire

---

### 2. Formato Dati

#### contextMemory.ts

```json
{
  "version": 1,
  "updatedAt": "2025-12-27T10:00:00Z",
  "compactionMeta": {
    "journalBytesProcessed": 1024,
    "lastCompactedAt": "2025-12-27T09:00:00Z"
  },
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "Preferisco Vim come editor",
      "key": "editor:preference",
      "scope": "global",
      "tags": ["editor", "vim"],
      "sensitivity": "low",
      "expiresAt": "2026-12-27T10:00:00Z",
      "confidence": 0.9,
      "source": "tool"
    }
  ]
}
```

**Pro:**

- Schema validato (Ajv)
- Tipi forte (UUID, date-time, enum)
- Metadati ricchi (confidence, expiration, sensitivity)
- Supporto per chiavi personalizzate (key)

**Contro:**

- Verboso
- Non editabile a mano facilmente
- Dipende da JSON parser

#### JIT Context Memory

```markdown
# Instruction.md

Preferisco Vim come editor.

Uso Termux su Android.

---
```

**Pro:**

- Semplice
- Editabile a mano
- Nativo Gemini

**Contro:**

- Non strutturato
- Nessuna validazione
- Nessun metadato

---

### 3. Feature Uniche

#### contextMemory.ts (Solo Termux)

1. **Sensitivity Filter**

```typescript
function filterHighSensitivity(entries) {
  return entries.filter((e) => e.sensitivity !== 'high');
}
```

Evita di leakare informazioni sensibili all'LLM.

2. **Expiration**

```typescript
if (e.expiresAt && Date.parse(e.expiresAt) < now) continue;
```

Le entry scadute vengono automaticamente ignorate.

3. **Journal Append-Only**

```typescript
await fsp.appendFile(options.paths.journal, `${line}\n`, { mode: 0o600 });
```

Tracciabilità completa delle modifiche.

4. **MCP Import**

```typescript
mcpImport: {
  enabled: false,
  categories: ['identity', 'infrastructure', 'projects', 'workflow', 'base'],
  scope: 'global'
}
```

Importa memoria da MCP server remoto.

5. **Runtime Options**

```typescript
setRuntimeContextMemoryOptions(options);
```

Permette di cambiare configurazione a runtime.

#### JIT Context Memory (Solo Upstream)

1. **UI Sync Events**

```typescript
coreEvents.emit(CoreEvent.MemoryChanged, {
  fileCount: this.loadedPaths.size,
});
```

La UI si aggiorna quando la memoria cambia.

2. **Lazy Loading** Carica solo quando serve, non all'avvio.

3. **Workspace Integration** Integrato con `workspaceContext.getDirectories()`.

---

### 4. Performance

#### contextMemory.ts

- **Avvio**: Legge 3 file JSON (piccoli)
- **Update**: Append al journal (O(1))
- **Compaction**: Periodica (ogni 2MB journal)
- **Memoria**: 50 entry max, 20KB max

#### JIT Context Memory

- **Avvio**: Scansione file system (\*.gemini.md)
- **Update**: Riscrittura file .md
- **Refresh**: Manuale (`/memory` o evento)
- **Memoria**: Dipende da dimensione file .md

**Vincitore**: contextMemory.ts per startup time, JIT per memoria usage.

---

### 5. Sicurezza

#### contextMemory.ts

```typescript
fs.writeFileSync(filePath, payload, { mode: 0o600 }); // rw-------
```

- File con permessi 0600
- Sensitivity filter
- Validazione UUID
- Sanitizzazione input

#### JIT Context Memory

- Nessuna misura specifica
- Dipende da permessi file system

**Vincitore**: contextMemory.ts

---

## Quale è Migliore?

### Per Termux/Android: **contextMemory.ts** ⭐

**Motivi:**

1. Filesystem mobile è lento → JSON piccolo meglio di scansione .md
2. Startup time critico su mobile → batch load più veloce
3. Sensitivity filter → privacy su dispositivo personale
4. MCP import → utile per integrazione con server MCP
5. Compaction automatica → evita file grandi che occupano spazio

### Per Desktop/Workstation: **JIT Context Memory** ⭐

**Motivi:**

1. Filesystem veloce → scansione .md non è problema
2. Semplicità → utenti possono editare .gemini.md a mano
3. UI sync → esperienza desktop più ricca
4. Workspace integration → meglio per progetti multipli

---

## Conclusione

| Scenario                  | Raccomandazione                                |
| ------------------------- | ---------------------------------------------- |
| **Termux/Android**        | contextMemory.ts                               |
| **Desktop single-user**   | JIT Context Memory                             |
| **Desktop multi-user**    | contextMemory.ts (per sensitivity filter)      |
| **Sviluppo attivo**       | JIT Context Memory (più semplice da mantenere) |
| **Produzione/Enterprise** | contextMemory.ts (più robusto)                 |

### Per il Merge

**Mantenere contextMemory.ts come feature Termux-exclusive.**

Il sistema JIT è buono per desktop, ma contextMemory.ts è superiore per:

- Dispositivi mobili (filesystem lento)
- Privacy (sensitivity filter)
- Integrazione MCP
- Robustezza (validazione, compaction)

JIT può essere usato come fallback opzionale per utenti che preferiscono il
sistema upstream.

```typescript
if (!experimentalJitContext) {
  // Termux-optimized: contextMemory.ts
  const result = await loadContextMemory(contextMemoryOptions);
} else {
  // Upstream: JIT context
  await contextManager.refresh();
}
```

---

**Autore**: DioNanos **Data**: 2025-12-27 **Verdetto**: contextMemory.ts è
migliore per Termux, JIT è meglio per desktop
