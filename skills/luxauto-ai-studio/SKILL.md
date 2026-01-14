---
name: luxauto-ai-studio
description: Luxury AI auto studio workflow and standards for LuxAuto. Use when adding or changing Gemini prompts/models, JSON schema parsing, or AI features; when touching archive storage/migrations; when adjusting UI copy/tone or flows in this repo; or when adding fields to Brand/CarModel/Lore data.
---

# LuxAuto AI Studio

## Overview
Keep AI generation, storage, and luxury tone consistent while making small, safe changes.

## Workflow Decision Tree
- If adding/changing Gemini calls or model IDs, follow **AI Generation** and read `references/ai-generation.md`.
- If adding fields to brand/model data or save/export, follow **Data & Storage** and read `references/data-shapes.md` and `references/storage.md`.
- If changing user-facing copy or UI flow, follow **UI Tone & Primitives** and read `references/ui-tone.md`.

## AI Generation
1. Centralize all model IDs and API calls in `services/geminiService.ts`.
2. For JSON output, use `responseMimeType: "application/json"` with a `responseSchema`.
3. Parse with `cleanJson` and `ensureArray`, then normalize into app-safe shapes.
4. Keep prompts aligned with luxury/atelier tone and include brand context helpers.

## Data & Storage
1. Respect existing localStorage/IndexedDB schema and migration logic in `services/archiveStore.ts`.
2. If adding new fields, update normalization so old saves remain valid.
3. Preserve the image-stripping fallback for storage quota limits.

## UI Tone & Primitives
1. Maintain luxury/atelier voice: confident, refined, evocative.
2. Reuse `components/ui/Button.tsx` and `components/ui/Input.tsx` for controls.
3. Keep styling via Tailwind utility classes (CDN in `index.html`).

## Quick Verify
- Create a brand, generate a model, save/load archives, and ensure no JSON parsing errors.

## References
- `references/ai-generation.md`
- `references/data-shapes.md`
- `references/storage.md`
- `references/ui-tone.md`
