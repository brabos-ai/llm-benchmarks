# SF03: Model Profile

> **Epic:** F0001-model-comparison-dashboard
> **Branch:** feature/F0001-model-comparison-dashboard
> **Depends on:** SF01, SF02
> **Date:** 2026-03-08

---

## Objective

Implement the `/models/[slug]` page: a full model profile with an individual radar chart, complete benchmark score table, pricing breakdown, latency percentiles, specs, "Best for" callout, and a "Compare this model →" button.

## Business Context

- **Why:** Users need deep detail on a specific model before making a decision.
- **Problem:** `/models/[slug]` is a placeholder.
- **Stakeholders:** Technical users evaluating model capabilities and cost.

## Scope

### Included

- Replace `src/pages/models/[slug].astro` with full implementation using `getStaticPaths()` — generates one page per model
- `src/components/ModelProfile.astro` — full profile page content
- `src/components/RadarChart.astro` — ECharts radar/spider chart (single model, 14 axes) via Astro island `client:load`
- `src/components/RankingTable.astro` — full score table, all 14 benchmarks, sortable by score
- Pricing breakdown: input, output, cache read, reasoning token prices (from OpenRouter); show "—" if null
- Latency percentiles: p50, p75, p90, p99 (from OpenRouter); show "—" if null
- Specs: context window, max completion tokens, input/output modalities, supports_reasoning, supports_tool_parameters
- **"Best for: [Category]"** callout — computed from highest category-weighted score
- **"Compare this model →"** button linking to `/compare?m=[slug]`
- Breadcrumb: Models → [Model Name]
- Bilingual + dark/light theme

### Not Included

- Multi-model comparison (SF04)
- Historical score trends

## Business Rules

### Validations

- Null benchmark scores show "—" and are excluded from radar axes
- Null pricing/latency/specs show "—" per field
- "Best for" computed only from benchmarks with non-null scores
- `getStaticPaths()` generates paths from `models.json` model IDs

### Flows

**Happy Path:**
1. User clicks model card on `/models/` → navigates to `/models/claude-opus-4`
2. Sees radar chart for this model's scores
3. Reads full score table (sorted by score desc by default)
4. Reads pricing + latency + specs
5. Sees "Best for: Coding" callout
6. Clicks "Compare this model →" → `/compare?m=claude-opus-4`

**Alternative (partial data):**
1. Model has some null scores
2. Radar renders with only axes where scores exist
3. Table shows "—" for missing benchmarks
4. Pricing/latency sections show "—" with note: "Data unavailable"

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Chart | ECharts radar, Astro island `client:load` | Code split; only loads on profile pages |
| "Best for" computation | Highest category-weighted average score | Uses existing relevanceScores system |
| Score table default sort | Score descending | Most useful first |
| Slug format | Model `id` from `models.json` (e.g. `claude-opus-4`) | Stable, readable URLs |
| "Compare" button | Links to `/compare?m=[slug]` | Enables shareable pre-selected comparison |

## Acceptance Criteria

- [ ] `getStaticPaths()` generates one page per model in `models.json`
- [ ] Radar chart renders with ECharts island; updates theme with dark/light toggle
- [ ] Score table shows all 14 benchmarks; null scores show "—"
- [ ] Pricing section shows all 4 price types (input/output/cache/reasoning); null → "—"
- [ ] Latency section shows p50–p99; null → "—"
- [ ] Specs section shows context window, modalities, feature flags
- [ ] "Best for: [Category]" callout visible and correctly computed
- [ ] "Compare this model →" links to `/compare?m=[slug]`
- [ ] Bilingual + dark/light theme works

## Spec (Token-Efficient)

```
getStaticPaths():
  return models.map(m => ({ params: { slug: m.id }, props: { model: m, provider, pricing, specs } }))

RadarChart.astro (island):
  axes = benchmarks.filter(b => model.scores[b.id] != null)
  series = [{ name: model.name, values: axes.map(b => model.scores[b.id]) }]
  ECharts radar({ indicator: axes, series })

BestFor computation:
  bestCategory = categories
    .filter(c => c.id !== 'all')
    .map(c => ({ id: c, score: categoryScore(model, c) }))
    .sort(desc score)[0].id
```

## Next Steps

→ `/add-plan` for SF03 after SF01 + SF02 are complete
