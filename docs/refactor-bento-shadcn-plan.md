# Bento Shadcn Refactor Plan

## Reference Read: BentoPDF

BentoPDF's strongest moves are not only the tiles. The page works because it makes privacy the first product thesis, keeps the first viewport sparse, uses a dark gridded workbench background, and reserves the bright blue-violet accent for decisive actions. The tool listing comes after trust setup, with search and preferences/settings positioned as part of choosing a tool rather than as separate decoration.

Patterns to adapt:
- Dark product-tool canvas with subtle grid depth.
- Large, direct headline and one primary CTA.
- Privacy/no-signup claims near the first action.
- Bento-style tool directory with search, grouping, and varied cell prominence.
- Compact navigation that collapses cleanly on mobile.

Patterns not to copy:
- BentoPDF name, logo mark, GitHub/star proof, customer logos, "works offline" claim, or any unsupported metrics.
- The exact purple accent and typography proportions.
- Marketing sections that are not useful for office-worker PDF tasks.

## Target Direction

Refactor toward a bento workbench for `shining.io.vn`: free, no-account PDF tools for office workers, with privacy-forward browser processing where true. Use shadcn/ui for primitives, customized through Tailwind v4 CSS variables and the tokens in `DESIGN.md`.

## Phase 1: Foundation

1. Install and initialize shadcn/ui for the existing Next.js/Tailwind v4 setup.
2. Add `components.json`, `src/lib/utils.ts`, and base primitives: Button, Card, Badge, Input, Separator, Tabs or Dropdown Menu as needed.
3. Convert global CSS variables to the Shining dark-first token system while preserving readable light/dark behavior if the app keeps system color mode.
4. Replace the current `public/icon.svg` and `public/favicon.svg` with a Shining logo mark after approval.

## Phase 2: Information Architecture Preservation

1. Keep current localized routes and slugs: `/[locale]`, `/merge-pdf`, `/compress-pdf`, `/workflow-builder`, `/word-to-pdf`, `/pdf-to-word`, `/privacy`, and coming-soon tool routes.
2. Preserve EN/VI dictionaries, SEO metadata generation, and static params.
3. Add only safe copy improvements that reinforce free/no-account/privacy truth without inventing metrics.

## Phase 3: Homepage Bento Directory

1. Replace the current hero card with an unframed first viewport: brand, concise value prop, privacy/no-account chips, and primary tool CTA.
2. Build a mixed-span bento grid for active tools, giving Merge/Compress/Workflow larger cells and conversion tools clear service-limit notes.
3. Add search/filter for tools if it can stay lightweight and localized.
4. Make coming-soon tools visually quieter but still discoverable.

## Phase 4: Tool Workbench Components

1. Extract shared upload, file list, settings, progress, error, and download panel patterns into shadcn-styled workbench components.
2. Keep browser-local tools visually marked as local/private.
3. Keep converter-service tools honest: verification, file-size limit, temporary processing, and best-effort language.
4. Ensure empty/loading/error/success states remain complete and tested.

## Phase 5: Responsive, Accessibility, and Motion

1. Define explicit mobile collapse rules for every bento grid and two-column workbench.
2. Verify keyboard focus, button contrast, text overflow in Vietnamese, and file-control accessibility.
3. Add restrained motion only for feedback and hierarchy: hover lift, active press, progress transitions, and optional section reveal under reduced-motion guards.

## Phase 6: Verification

1. Run unit tests and typecheck.
2. Run Playwright e2e for homepage and active tool routes.
3. Capture desktop and mobile screenshots.
4. Run Impeccable detector on changed UI targets.
5. Re-run `$impeccable document` after implementation to extract the final real tokens and sidecar.

## Open Decisions

- Logo concept approval: angular "S" spark, folded document mark, or wordmark-first.
- Build path default for new visual surfaces: comp-first or code-first.
- Whether the site should remain system light/dark or move to dark-first with a manual theme option later.
