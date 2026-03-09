# Epic: Model Comparison Dashboard

> **Branch:** feature/F0001-model-comparison-dashboard
> **Feature:** F0001
> **Date:** 2026-03-08

## Subfeatures

| ID | Name | Objective | Status | Checkpoint |
|----|------|-----------|--------|------------|
| SF01 | Data Foundation | Build data layer, OpenRouter fetch, nav component, benchmarks extraction | done | F0001-SF01-done |
| SF02 | Models Grid | `/models/` page with card grid, filter pills, category sorting | done | F0001-SF02-done |
| SF03 | Model Profile | `/models/[slug]` page with charts, pricing, specs, callouts | done | F0001-SF03-done |
| SF04 | Comparison Dashboard | `/compare` with model selector, radar overlay, bar chart, shareable URLs | done | F0001-SF04-done |

## Ordem de Implementação

1. SF01 (no dependencies — data layer + nav + benchmarks.ts refactor)
2. SF02 (depends: SF01)
3. SF03 (depends: SF01, SF02)
4. SF04 (depends: SF01, SF02)

## Notas

- SF03 and SF04 can be parallelized after SF01 + SF02 are complete
- ECharts npm install happens in SF01 (used by SF03 + SF04)
- Scraping command (`.claude/commands/scrape-benchmarks.md`) ships with SF01
- All subfeatures must maintain bilingual (PT-BR/EN) and dark/light theme support
- OpenRouter API graceful degradation applies to SF01 (other SFs inherit)
