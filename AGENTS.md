# AGENTS.md

## Purpose
This file defines how AI coding agents should work in this repo.

## Scope
- Follow repo conventions and existing patterns.
- Avoid breaking changes unless explicitly requested.

## Ground rules
- Prefer small, focused changes.
- Do not delete or rewrite unrelated code.
- Ask before introducing new dependencies or large refactors.
- Keep edits ASCII unless the file already uses Unicode.
- Don’t run networked commands without approval.

## Workflow
1) Inspect relevant files before editing.
2) Explain the plan briefly if the change is non-trivial.
3) Make the minimal change needed.
4) Suggest a quick way to verify the change.

## Project structure
- App entry: `index.tsx` and `App.tsx`
- UI components: `components/`
- Gemini API: `services/geminiService.ts`
- Tailwind via CDN in `index.html`

## Code style
- Preserve existing formatting and naming conventions.
- Avoid large formatting-only diffs.
- Add short, clarifying comments only when necessary.

## UI and design
- Keep styling in Tailwind utility classes via the CDN in `index.html`.
- Preserve the luxury/atelier tone in UI copy and labels.
- Reuse existing UI primitives: `components/ui/Button.tsx`, `components/ui/Input.tsx`.

## Gemini/AI usage
- Centralize model IDs and API calls in `services/geminiService.ts`.
- For JSON payloads, use `responseMimeType: "application/json"` with `responseSchema`.
- Parse AI JSON with `cleanJson` and `ensureArray`.

## Data persistence
- Respect the localStorage schema/versioning in `App.tsx`.
- If adding fields, update the normalization/migration logic.
- Be mindful of storage limits; follow the image-stripping fallback pattern.

## Secrets & config
- Never print or hardcode secrets.
- Treat `.env*` files as sensitive.

## Files to avoid touching unless asked
- `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`
- `db/migrations/*`
- `dist/`, `build/`

## Questions
If requirements are unclear, ask before editing.
