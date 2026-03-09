# SF04: Comparison Dashboard

> **Epic:** F0001-model-comparison-dashboard
> **Branch:** feature/F0001-model-comparison-dashboard
> **Depends on:** SF01, SF02
> **Date:** 2026-03-08

---

## Objective

Implement the `/compare` page: an interactive dashboard where users select 2–4 models, view an overlaid radar chart, click into a benchmark for a bar chart detail view, and see a side-by-side comparison table. Selected models encoded in URL params for shareability.

## Business Context

- **Why:** Users need to directly compare models across multiple dimensions simultaneously.
- **Problem:** `/compare` is a placeholder; no comparison tool exists.
- **Stakeholders:** Technical users choosing between 2–4 candidate models.

## Scope

### Included

- Replace `src/pages/compare.astro` with full comparison dashboard
- `src/components/ComparisonDashboard.astro` — top-level comparison page content
- `src/components/ModelSelector.astro` — dropdown/chips to add/remove models (max 4); pre-populated from URL `?m=` param
- `src/components/RadarChart.astro` (multi-series mode) — overlaid polygons, one per selected model, distinct colors
- `src/components/BarChart.astro` — horizontal grouped bar chart for a single benchmark across selected models; triggered by clicking radar axis or benchmark name
- Side-by-side comparison table — rows: benchmarks, cols: selected models; highlight best score per row
- Shareable URLs: selected models encoded in `?m=model1,model2` — parsed on page load
- `ModelBehavior.astro` (extended) — parse URL params, manage selected models state (add/remove), update radar + bar chart + table reactively
- Bilingual + dark/light theme (ECharts re-themes on toggle)

### Not Included

- Saving comparisons server-side (no backend)
- More than 4 models simultaneously
- Price/latency in comparison (benchmark scores only in v1)

## Business Rules

### Validations

- Minimum 1 model selected to render page (if URL has no `?m=` param, show "Select models to compare" empty state)
- Minimum 2 models to render radar chart (single model → show empty state in radar)
- Maximum 4 models; 5th selection replaces the oldest
- Invalid model IDs in URL params silently ignored
- Null benchmark scores excluded from radar axes; shown as "—" in table

### Flows

**Happy Path:**
1. User arrives via `/compare?m=claude-opus-4,gpt-4o` (from model profile "Compare" button)
2. Both models pre-selected in ModelSelector chips
3. Radar chart renders with 2 overlaid polygons
4. User clicks a radar axis (e.g. "SWE-bench") → BarChart appears below for that benchmark
5. User adds a 3rd model via ModelSelector
6. Radar updates to 3 polygons; table adds column; URL updates to `?m=claude-opus-4,gpt-4o,gemini-2.5-pro`
7. User copies URL to share comparison

**Empty State:**
1. User visits `/compare` with no URL params
2. Sees: "Select models to compare" + ModelSelector
3. After selecting ≥1 model, URL updates; after ≥2, radar renders

**Alternative (1 model):**
1. Only 1 model in `?m=` param
2. Radar shows empty state: "Add another model to compare"
3. Comparison table shows single column (still useful)

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Max models | 4 | Readable radar; ECharts handles 4 series cleanly |
| State management | URL params (`?m=`) | Shareable, no server needed |
| URL update | `history.replaceState` | No page reload on model add/remove |
| Model colors | Distinct ECharts palette + provider colorToken | Visual distinction in radar |
| Bar chart trigger | Click radar axis or table benchmark header | Natural interaction patterns |
| Overflow (5th model) | Replace oldest | Predictable behavior |

## Acceptance Criteria

- [ ] `/compare?m=claude-opus-4,gpt-4o` pre-selects both models on load
- [ ] ModelSelector allows add/remove up to 4 models
- [ ] Radar chart renders overlaid polygons for 2–4 models
- [ ] Clicking radar axis shows BarChart for that benchmark
- [ ] Side-by-side table: rows=benchmarks, cols=models; best score highlighted per row
- [ ] URL updates on model add/remove without page reload
- [ ] Empty state shown when <2 models selected
- [ ] Dark/light theme toggle re-themes ECharts
- [ ] Bilingual labels work

## Spec (Token-Efficient)

```
URL state:
  ?m=model1,model2,model3 (comma-separated model IDs, max 4)
  Parsed on load; updated via history.replaceState on change

RadarChart (multi-series):
  indicator = benchmarks.filter(b => anySelectedModelHasScore(b))
  series = selectedModels.map(m => ({
    name: m.name,
    value: indicator.map(b => m.scores[b.id] ?? 0)
  }))

BarChart (single benchmark):
  categories = selectedModels.map(m => m.name)
  values = selectedModels.map(m => m.scores[benchmarkId])

Comparison table:
  for each benchmark row: highlight max non-null value with green accent
```

## Next Steps

→ `/add-plan` for SF04 after SF01 + SF02 are complete
