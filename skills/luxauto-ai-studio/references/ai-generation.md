# AI Generation

## Where to change
- `services/geminiService.ts` centralizes all model IDs and API calls.

## Models
- `TEXT_MODEL`: text-only responses
- `REASONING_MODEL`: deeper reasoning prompts
- `IMAGE_MODEL`: image generation

## JSON output rules
- For JSON payloads, always set `responseMimeType: "application/json"` and define `responseSchema`.
- Parse with `cleanJson()` and `ensureArray()` before normalizing.
- Use `safeJsonParse()` when a fallback is required.

## Normalization
- Brand identity: `normalizeBrandIdentity()`
- Car specs payload: `normalizeCarSpecsPayload()` + `normalizeSpecs()`
- Avoid direct use of raw AI output in UI or storage.

## Prompt helpers
- `formatBrandContext()` and `formatVisualContext()` for concise brand DNA.
- `formatBrandBrief()` / `formatProgramBrief()` for structured prompts.
- `formatTierTargets()` for tier constraints.

## Image generation
- For iterative updates, pass reference images via inline data.
- Use "reference note" and "delta note" patterns to preserve silhouette.
