# SF01: Data Foundation

> **Epic:** F0001-model-comparison-dashboard
> **Branch:** feature/F0001-model-comparison-dashboard
> **Date:** 2026-03-08

---

## Objective

Build the entire data layer and shared infrastructure that all other subfeatures depend on: benchmark extraction, model/provider data files, OpenRouter build-time fetch, ECharts installation, top navigation, and the scraping CLI command.

## Business Context

- **Why:** SF02, SF03, SF04 are all blocked until data types, fetch utilities, and shared components exist.
- **Problem:** Benchmark definitions are locked in `home.ts`; no model/provider data exists; no navigation between pages; no chart library installed.
- **Stakeholders:** Developers (unblocks all other SFs); end users (nav component is user-facing).

## Scope

### Included

- Extract benchmark definitions from `home.ts` → `src/data/benchmarks.ts` (types + data). Update `home.ts` to import from it.
- Create `src/data/providers.ts` — 8 providers, 15 models with OpenRouter slugs, color tokens, logo paths
- Create `src/data/models.json` — initial benchmark scores for all 15 models (scraped or seeded)
- Create `src/data/openrouter.ts` — build-time fetch utility for OpenRouter `/api/frontend/stats/endpoint` and `/api/frontend/models`
- Graceful degradation: if OpenRouter API fails at build, show "—" for pricing/latency/specs
- Install Apache ECharts via npm
- Create minimal top navigation component (`src/components/TopNav.astro`) — links: Home / Models / Compare
- Add TopNav to `src/layouts/BaseLayout.astro`
- Add new i18n keys to `home.ts` translations (Models, Compare, navigation labels)
- Create `.claude/commands/scrape-benchmarks.md` — scraping command definition
- Add provider logo SVGs to `public/images/providers/` (8 providers)

### Not Included

- Actual page implementations (SF02, SF03, SF04)
- Chart rendering (SF03, SF04)
- Client-side filtering/sorting (SF02)

## Business Rules

### Validations

- `models.json` must include all 15 models from design doc before build
- Each model must have `id`, `name`, `provider`, `openrouterSlug`, `scores`, `scrapedAt`
- `scores` values: number (0-100 or 0-1000 for Elo) or `null` if unknown
- Provider `colorToken` must map to an existing CSS variable in `global.css`

### Flows

**Happy Path (build):**
1. `astro build` starts
2. `openrouter.ts` fetch utility calls OpenRouter API for each model's slug
3. Merges pricing/latency/specs with `models.json` benchmark scores
4. Data available to all pages as typed objects

**Error (OpenRouter API down):**
1. Fetch throws or times out
2. Utility returns model object with `pricing: null`, `latency: null`, `specs: null`
3. Build continues; pages render "—" for missing data

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Chart library | Apache ECharts via npm + Astro island | Code splitting; only chart pages load it |
| Benchmark source of truth | Extract to `benchmarks.ts` | DRY; home.ts and models pages share types |
| OpenRouter failure | Graceful degradation (show "—") | Site always deploys |
| Provider logos | Local SVGs in `public/images/providers/` | No external URL fragility |
| Navigation | Minimal TopNav in BaseLayout | All pages need navigation |

## Acceptance Criteria

- [ ] `src/data/benchmarks.ts` exports `BenchmarkId` type and `benchmarks[]`; `home.ts` imports from it without breaking home page
- [ ] `src/data/providers.ts` exports `Provider` interface and all 8 providers with 15 models
- [ ] `src/data/models.json` contains all 15 models with at least partial benchmark scores
- [ ] `src/data/openrouter.ts` fetch utility handles API failure gracefully (returns nulls, doesn't throw)
- [ ] `npm install apache-echarts` succeeds; package in `package.json`
- [ ] `TopNav.astro` renders with correct links; bilingual labels work
- [ ] `BaseLayout.astro` includes TopNav; home page still renders correctly
- [ ] `.claude/commands/scrape-benchmarks.md` created with full usage instructions
- [ ] Provider logo SVGs present in `public/images/providers/`

## Spec (Token-Efficient)

```
benchmarks.ts:
  export type BenchmarkId = "swe-bench" | "humaneval" | "mmlu" | "gpqa" | "math" |
    "arena-elo" | "mt-bench" | "livecodebench" | "ifeval" | "simpleqa" |
    "tau-bench" | "gaia" | "webarena" | "agentbench"
  export const benchmarks: Benchmark[] (same data as home.ts, imported there)

providers.ts:
  Provider { id, name, colorToken, logoUrl, website }
  ProviderModel { id, name, openrouterSlug }
  providers: Provider[] (8 providers)
  modelsByProvider: Record<ProviderId, ProviderModel[]>

models.json:
  { lastUpdated, models: Model[] }
  Model { id, name, provider, openrouterSlug, scores: Record<BenchmarkId, number|null>, scrapedAt }

openrouter.ts:
  fetchModelStats(slug: string): Promise<OpenRouterStats | null>
  fetchModelCatalog(): Promise<OpenRouterModel[]>
  OpenRouterStats { pricing, stats, context_length, ... }
```

## Next Steps

→ `/add-plan` for SF01 implementation planning
