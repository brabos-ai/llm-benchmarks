# Discovery: Smart Model Catalog & Scraping Update

> **Branch:** feature/F0002-model-scraping-update
> **Feature:** F0002
> **Date:** 2026-03-09

---

## Codebase Analysis

### Commit History
- Projeto em fase inicial (F0001 ainda em progresso)
- Commits recentes focados em UI: radar chart, dropdown CSS, theme toggle, comparison dashboard

### Related Files
- `src/data/openrouter.ts` — fetch individual stats por slug (base a estender)
- `src/data/providers.ts` — 347 linhas, 15 modelos hardcoded em 7 providers
- `src/data/models.json` — 350 linhas, 15 modelos, scores todos `null`
- `src/data/benchmarks.ts` — 178 linhas, 14 benchmarks com relevância por use-case
- `src/data/home.ts` — ~400 linhas, i18n e dados da home page
- `src/pages/models/[slug].astro` — gera páginas estáticas via `getStaticPaths()`
- `src/pages/models/index.astro` — grid de todos os modelos
- `src/components/ModelCard.astro` — card do modelo (já suporta `isDeranked` badge)
- `src/components/ModelProfile.astro` — página individual do modelo
- `src/components/ModelSelector.astro` — picker de modelos no dashboard de comparação

### Similar Features
- F0001 (model-comparison-dashboard) — padrão de consumo de dados de modelos; ECharts CDN pattern já estabelecido; slots de dados do modelo a seguir

### Patterns
- **ECharts via CDN** (`window.echarts`), não via npm import — crítico manter
- **Astro `is:inline` scripts** para lógica client-side
- **`getStaticPaths()`** em `[slug].astro` — modelos vêm de `getAllModels()` em `providers.ts`
- **TypeScript interfaces** bem definidas para ProviderModel, ModelData, BenchmarkId
- **Dark/light theme** via `data-theme` no `<html>` com `MutationObserver` em scripts inline

---

## Technical Context

### Infrastructure
- **Astro 5** (static site generation)
- **TypeScript** em data layer
- **No build scripts** — `package.json` tem apenas `dev`, `build`, `preview` da Astro
- **OpenRouter API** — `/api/frontend/stats/endpoint?slug=X` chamado em build-time no `[slug].astro`
- **CDN:** ECharts, Google Fonts — sem node_modules para charting

### Dependencies
- **OpenRouter API** — catalog: `https://openrouter.ai/api/v1/models`; stats: `/api/frontend/stats/endpoint`
- **ArtificialAnalysis.ai** — API não-oficial para benchmark scores (investigar endpoint)
- **Provider websites** — fallback para web fetch de scores (anthropic.com, openai.com, deepmind.google, etc.)

### Integration Points
- `getAllModels()` em `providers.ts` → usado em `[slug].astro` e `models/index.astro`
- `getModelById()` em `providers.ts` → usado em `ModelProfile.astro`
- `models.json` importado via `import modelsData from './models.json'` em múltiplos componentes
- O comando `/scrape-models` (a criar) vai escrever em `models.json` e `providers.ts` diretamente

---

## Files Mapping

### To Create
- `src/data/model-families.json` — whitelist de famílias + alias mapping (family → OpenRouter prefix + variants)
- `.codeadd/commands/scrape-models.md` — definição do comando Claude Code
- `docs/features/F0002-model-scraping-update/about.md` ✅ (já criado)
- `docs/features/F0002-model-scraping-update/discovery.md` ✅ (este arquivo)

### To Modify
- `src/data/providers.ts` — adicionar campos `family`, `version`, `variant`, `isObsolete` na interface + atualizar os 15 modelos existentes + novos modelos
- `src/data/models.json` — estender schema com novos campos + popular com modelos reais + scores reais
- `src/data/openrouter.ts` — adicionar `fetchModelCatalog()` que busca `/api/v1/models` e filtra por whitelist
- `src/pages/models/index.astro` — adicionar family grouping + filtrar `isObsolete` do grid
- `src/components/ModelCard.astro` — exibir versão/variante + badge de obsoleto (já tem `isDeranked`)
- `src/components/ModelProfile.astro` — seção "Parte da família X" com links para outras versões/variantes

---

## Technical Assumptions

| Assumption | Impact if Wrong |
|------------|-----------------|
| OpenRouter `/api/v1/models` retorna lista paginada ou completa de todos os modelos | Se paginado, precisar implementar paginação no catalog fetch |
| ArtificialAnalysis.ai tem endpoint acessível sem autenticação | Se precisar auth/key, scraping de HTML como fallback |
| Slugs do OpenRouter seguem padrão `provider/model-name-version` consistente | Se inconsistente, mais aliases manuais no `model-families.json` |
| `providers.ts` pode ser estendido sem quebrar build atual | Se houver type errors, resolver antes de adicionar novos modelos |
| Agente Claude tem acesso a `WebFetch` durante execução do `/scrape-models` | Crítico para o fallback de web scraping |

---

## References

### Files Consulted
- `src/data/openrouter.ts` — 100 linhas, padrão fetch a seguir
- `src/data/providers.ts` — 347 linhas, interface ProviderModel atual
- `src/data/models.json` — 350 linhas, schema atual dos modelos
- `src/data/benchmarks.ts` — 178 linhas, 14 benchmark IDs
- `src/pages/models/[slug].astro` — como dados são consumidos em build-time
- `src/components/ModelCard.astro` — badge `isDeranked` já implementado
- `docs/features/F0001-model-comparison-dashboard/about.md` — contexto F0001

### Documentation
- OpenRouter API: `https://openrouter.ai/docs/api-reference/list-available-models`
- ArtificialAnalysis: `https://artificialanalysis.ai` (investigar endpoint durante scraping)

### Related Features (histórico)
- F0001-model-comparison-dashboard — establishes model data consumption patterns

---

## Related Features

| Feature | Relation | Key Files | Impact |
|---------|----------|-----------|--------|
| F0001-model-comparison-dashboard | shares-domain | `src/data/providers.ts`, `src/data/models.json` | F0002 muda o schema destes arquivos — verificar que F0001 componentes continuam funcionando após extensão |

<!-- refs: F0001 -->

---

## Summary for Planning

### Executive Summary
A feature tem 3 camadas distintas: (1) extensão de schema + population inicial do catálogo com dados reais, (2) criação do comando Claude Code `/scrape-models` que usa APIs + web fetch para manter o catálogo atualizado, e (3) atualização da UI para family grouping. O ponto mais delicado é o schema migration — estender `providers.ts` e `models.json` sem quebrar o build atual do F0001.

### Key Decisions
- `models.json` é a single source of truth — `providers.ts` deve ser validado/gerado a partir dele
- O agente Claude do `/scrape-models` usa ferramentas `WebFetch` para buscar APIs e fazer fallback em sites
- Family mapping explícito (`model-families.json`) evita regex frágil nos slugs do OpenRouter
- Versão = número principal do slug; variante = sufixo (pro/flash/mini/codex)

### Critical Files
- `src/data/providers.ts` — interface ProviderModel: qualquer mudança aqui afeta todo o build
- `src/data/models.json` — source de dados para todas as páginas e componentes
- `src/data/openrouter.ts` — será estendido com `fetchModelCatalog()`; deve manter backward compat com `fetchModelData()`
- `src/pages/models/[slug].astro` — `getStaticPaths()` precisa filtrar `isObsolete` mas manter páginas acessíveis via URL
