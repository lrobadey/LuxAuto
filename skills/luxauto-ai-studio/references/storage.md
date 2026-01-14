# Storage and Migration

## Keys and versions
- LocalStorage: `luxeauto_saves_v1`, `luxeauto_saves_v2`
- `STORAGE_VERSION = 2`

## IndexedDB
- DB: `luxeauto_archive`
- Store: `saves` (keyPath: `id`, index: `timestamp`)

## Migration flow
- On load, read IndexedDB first.
- If empty, read legacy localStorage.
- If legacy has slots, normalize + migrate into IndexedDB.

## Normalization rules
- Use `normalizeSpecs()` for `CarSpecs`.
- Validate variants, lore entries, and program/brief objects.
- Accept missing fields; default to safe empty values.

## Quota fallback
- When localStorage is full, strip images:
  - brand lore image URLs -> `undefined`
  - model variant image URLs -> empty string

## Import/export
- Export JSON payload includes `version`, `exportedAt`, `slots`.
- Import uses `parseArchiveText()` with dedupe and drop invalid slots.
