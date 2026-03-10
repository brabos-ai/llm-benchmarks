# Discovery: Layout & Pricing Fixes

> **Branch:** feature/0001F-layout-pricing-fixes
> **Feature:** 0001F
> **Date:** 2026-03-09

---

## Codebase Analysis

### Commit History
Recent: `3d94961 feat: implement OpenRouter benchmark scraping pipeline` — added scraping that populates `models.json` with pricing + latency fields.

### Related Files
- `src/layouts/BaseLayout.astro` — shared shell; includes TopNav; has anti-flash theme init script
- `src/components/TopNav.astro` — nav bar rendered on every route; currently has NO toggles
- `src/components/LanguageToggle.astro` — renders theme-toggle btn + lang-btn HTML only (no JS)
- `src/components/HomeBehavior.astro` — inline JS: theme toggle, lang toggle, filter. Only used in `index.astro`
- `src/components/ModelBehavior.astro` — inline JS: lang toggle (duplicate), filter, ranking. Only used in `models/index.astro`
- `src/pages/index.astro` — imports LanguageToggle + HomeBehavior
- `src/pages/models/index.astro` — imports ModelBehavior; does live OpenRouter fetch; passes pricing to ModelCard
- `src/pages/models/[slug].astro` — no toggle, no pricing
- `src/pages/compare.astro` — no toggle, no pricing
- `src/components/ModelCard.astro` — renders pricing (prompt only), latency, context in footer
- `src/data/models.json` — scraped data with `pricing.prompt`, `pricing.completion`, `latency_p50` per model
- `src/data/openrouter.ts` — `fetchAllModels()` function used for live stats fetch

### Similar Features
- Anti-flash theme init already in `BaseLayout.astro` (inline script) — same pattern to follow for lang init
- Lang param already used as URL state (`?lang=pt`) — consistent, keep it

### Patterns
- Inline `is:inline` scripts for client-side behavior (no module bundling)
- `define:vars={{ translations }}` to pass server data to client scripts
- `data-i18n` attributes for translation targets
- `localStorage` for theme persistence; URL param for lang persistence

## Technical Context

### Infrastructure
- Astro static site, Cloudflare Pages deploy
- Build-time data fetching in Astro frontmatter (for OpenRouter live fetch — to be removed)

### Dependencies
- No new deps needed
- `src/data/home.ts` — translations dictionary (already covers all routes)

### Integration Points
- `BaseLayout.astro` ← inject shared toggle HTML (via TopNav) + shared JS
- `HomeBehavior.astro` ← remove duplicated applyTheme/applyLang/setLang blocks
- `ModelBehavior.astro` ← remove duplicated applyLang/setLang/listeners block
- `models/index.astro` ← remove `fetchAllModels` import + call; map from model fields directly

## Files Mapping

### To Create
- `docs/features/0001F-layout-pricing-fixes/about.md` ✅
- `docs/features/0001F-layout-pricing-fixes/discovery.md` ✅

### To Modify
- `src/components/TopNav.astro` — add toggle HTML (theme btn + lang btns) with styles
- `src/layouts/BaseLayout.astro` — add shared inline JS for theme + lang (after existing anti-flash script); pass translations via define:vars
- `src/components/HomeBehavior.astro` — strip applyTheme, applyLang, setLang, getLangFromURL, toggle event listeners (keep filter logic)
- `src/components/ModelBehavior.astro` — strip applyLang, setLang, getLangFromURL, toggle event listeners (keep ranking/filter/search logic); remove `applyLang(getLangFromURL())` call from init
- `src/pages/models/index.astro` — remove `fetchAllModels` import + call; map `pricing` and `latencyMs` from `model.pricing` / `model.latency_p50` directly
- `src/components/ModelCard.astro` — update `priceDisplay` logic + footer to show "IN $X / OUT $Y /1M"; add attribution note

## Technical Assumptions

| Assumption | Impact if Wrong |
|------------|-----------------|
| models.json `pricing` field matches `OpenRouterPricing` shape | ModelCard would need different field mapping |
| models.json always has `latency_p50` as ms number (or null) | Same null-guard logic; no change |
| `translations` in `home.ts` covers all `data-i18n` keys across all routes | Some keys would silently fall back to English server-rendered text |
| `?lang=` param persists via browser navigation (URL params don't carry to new hrefs by default) | Would need client-side link interception — acceptable for now |

## Root Cause Analysis: Pricing/Latency Bug

```
models/index.astro:
  const openrouterMap = await fetchAllModels(slugs);   ← calls stats endpoint

fetchModelData(openrouterSlug):
  URL: /api/frontend/stats/endpoint?permaslug=${openrouterSlug}&variant=standard

Problem: passes openrouterSlug="anthropic/claude-sonnet-4.6"
         but API expects permaslug="anthropic/claude-4.6-sonnet-20260217"
         → API returns null/empty → orData is undefined → pricing shows N/A

Fix: models.json already has pricing.prompt, pricing.completion, latency_p50
     Use model.pricing and model.latency_p50 directly — no fetch needed
```

## References

### Files Consulted
- `src/layouts/BaseLayout.astro`
- `src/components/TopNav.astro`
- `src/components/LanguageToggle.astro`
- `src/components/HomeBehavior.astro`
- `src/components/ModelBehavior.astro`
- `src/components/ModelCard.astro`
- `src/pages/index.astro`
- `src/pages/models/index.astro`
- `src/data/models.json` (sample)
- `src/data/openrouter.ts`

### Related Features
None (first feature in this repo).

## Summary for Planning

### Executive Summary
Four tightly coupled display/UX fixes: move toggles to global layout, fix pricing data source to use already-scraped models.json fields, update ModelCard to show input+output pricing, and add OpenRouter credit. All changes are in existing files with no new dependencies.

### Key Decisions
- Shared toggle JS lives in `BaseLayout.astro` to avoid per-page duplication
- Live OpenRouter fetch at build time removed entirely — models.json is the source of truth
- Pricing display pattern: `IN $X / OUT $Y /1M` (two lines or inline)

### Critical Files
- `src/components/TopNav.astro` — receives toggle HTML
- `src/layouts/BaseLayout.astro` — receives shared JS logic
- `src/pages/models/index.astro` — fix data mapping (remove live fetch)
- `src/components/ModelCard.astro` — pricing display + attribution
