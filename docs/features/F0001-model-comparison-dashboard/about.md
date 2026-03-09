# Epic: Model Comparison Dashboard

> **Branch:** feature/F0001-model-comparison-dashboard
> **Feature:** F0001
> **Date:** 2026-03-08
> **Type:** Epic (4 subfeatures)

---

## Objective

Expand the LLM Benchmarks site with model profiles, a comparison dashboard, and category rankings — giving visitors a way to evaluate and compare AI models side-by-side using real benchmark scores, pricing, and performance data sourced from official publications and OpenRouter API.

## Business Context

- **Why:** The site currently only explains what benchmarks measure. Visitors have no way to see how specific models perform, compare pricing, or rank models by use case.
- **Problem:** Zero model data on site; no comparison tool; no navigation between pages.
- **Stakeholders:** AI practitioners, developers, and technical decision-makers evaluating which model to use.

## Scope

### Included (v1)

- 15 models across 8 providers (Anthropic, OpenAI, Google, xAI, DeepSeek, Moonshot, MiniMax)
- 14 benchmarks (SWE-bench, HumanEval, MMLU, GPQA, MATH, TAU-bench, GAIA, WebArena, Arena ELO, MT-Bench, LiveCodeBench, AgentBench, IFEval, SimpleQA)
- `/models/` — filterable/sortable model grid with category ranking
- `/models/[slug]` — full model profile: radar chart, score table, pricing, latency, specs
- `/compare` — comparison dashboard: 2–4 models, radar overlay, bar chart detail, shareable URLs
- Data: `models.json` (scraped scores), `providers.ts` (metadata), `benchmarks.ts` (extracted definitions)
- Build-time OpenRouter API fetch (pricing, latency, specs); graceful degradation if API fails
- Apache ECharts (npm + Astro island `client:load`)
- Minimal top navigation (Home / Models / Compare) in BaseLayout
- `.claude/commands/scrape-benchmarks.md` for updating benchmark scores
- Provider logos as local SVGs in `public/images/providers/`
- Bilingual (PT-BR/EN) and dark/light theme throughout

### Not Included (v1)

- Historical score trends over time
- Real-time latency measurement
- Open-source models on third-party providers
- SSR or custom API
- User accounts or saved comparisons
- Search/text filtering on model grid

## Key Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Chart library | Apache ECharts (npm + `client:load`) | Native radar, code splitting, smooth animations |
| OpenRouter failure | Graceful degradation ("—") | Site always deploys |
| Benchmark source | Extract to `benchmarks.ts` | DRY; shared between home and models pages |
| Comparison state | URL params `?m=model1,model2` | Shareable without backend |
| Provider logos | Local SVGs in `public/images/` | No external URL fragility |
| Navigation | Minimal TopNav in BaseLayout | Multi-page site requires navigation |
| Max comparison models | 4 | Readable radar; ECharts handles cleanly |

## Subfeature Structure

See `epic.md` for full decomposition and implementation order.

| ID | Subfeature | Status |
|----|-----------|--------|
| SF01 | Data Foundation | pending |
| SF02 | Models Grid | pending |
| SF03 | Model Profile | pending |
| SF04 | Comparison Dashboard | pending |

## Acceptance Criteria (Epic)

- [ ] All 15 models accessible at `/models/[slug]`
- [ ] `/models/` grid filterable by all 5 categories
- [ ] `/compare` supports 2–4 model comparison with shareable URL
- [ ] All pages bilingual (PT-BR/EN) and dark/light themed
- [ ] Build succeeds even if OpenRouter API is unavailable
- [ ] Benchmark scores updatable via `/scrape-benchmarks` command
