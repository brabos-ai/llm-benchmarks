# Smart Model Catalog & Scraping Update

> **Branch:** feature/F0002-model-scraping-update
> **Feature:** F0002
> **Date:** 2026-03-09

---

## Objective

Automatizar a descoberta, filtragem e atualização do catálogo de modelos LLM — mantendo as últimas 3 versões por família, suportando variantes (pro/flash/mini/codex), arquivando obsoletos, e populando benchmark scores via agente Claude que combina APIs + web scraping.

## Business Context

- **Why:** O catálogo atual é 100% manual — 15 modelos hardcoded com scores todos `null`. Com o ritmo de lançamentos da indústria, isso se torna stale em semanas.
- **Problem:** Nenhum pipeline de scraping existe. `providers.ts` e `models.json` são editados na mão, não há versioning, e os benchmarks nunca foram populados.
- **Stakeholders:** Usuários do dashboard (veem dados desatualizados), mantenedor do projeto (esforço manual recorrente).

## Scope

### Included
- Extensão do schema com campos `family`, `version`, `variant`, `isObsolete`
- `models.json` como single source of truth; `providers.ts` derivado/validado a partir dele
- Whitelist de famílias monitoradas (anthropic/claude, openai/gpt, google/gemini, xai/grok, deepseek, etc.)
- Regra: manter últimas 3 **versões** por família; todas as **variantes** de cada versão incluídas
- Comando Claude Code `/scrape-models` que executa:
  1. Fetch catálogo OpenRouter (discovery de versões)
  2. ArtificialAnalysis.ai API para benchmark scores (fonte primária)
  3. Web fetch (sites dos providers) como fallback para scores não cobertos
  4. Atualiza `models.json` + mantém `model-families.json` (family mapping)
- Modelos obsoletos: `isObsolete: true` — arquivados, não deletados. URL direta funciona; fora do grid/selector
- Family grouping na UI: grid agrupa por família com hierarquia visual
- Página individual de modelo mostra "Parte da família X" com links para outras versões/variantes

### Not Included
- GitHub Actions / automação de CI (pode vir como melhoria posterior)
- Adição de novos providers não contemplados na whitelist inicial
- Scrapers frágeis de HTML (apenas fetch de dados estruturados/APIs)
- Histórico temporal de scores (não é time-series, só valor atual)

## Business Rules

### Validations
- Um modelo só entra no catálogo se seu `openrouterSlug` existir no catálogo OpenRouter
- A whitelist de famílias é a fonte de controle — modelos não reconhecidos são logados mas não incluídos
- Versão é determinada pelo número principal do slug (ex: `claude-opus-4` → versão 4 da família `claude-opus`)
- Variante é o sufixo após a versão (ex: `gemini-2.5-pro` → versão 2.5, variante `pro`)
- Máximo 3 versões por família. A 4ª versão mais antiga é marcada como `isObsolete: true`

### Flows

**Happy Path (scraping bem-sucedido):**
1. Dev executa `/scrape-models` no Claude Code
2. Agente busca catálogo OpenRouter → extrai modelos das famílias na whitelist
3. Agrupa por família + versão, aplica regra das 3 versões
4. Busca benchmark scores no ArtificialAnalysis.ai API
5. Para scores faltando: faz web fetch nos sites dos providers
6. Atualiza `models.json` com modelos novos, arquiva obsoletos
7. Agente reporta: "Added X, archived Y, updated Z benchmark scores"

**Alternative (API parcialmente disponível):**
1. ArtificialAnalysis inacessível
2. Agente prossegue com web fetch nos sites como fallback
3. Scores não encontrados ficam `null` com `scoreSource: "manual-needed"`

**Error (OpenRouter indisponível):**
1. OpenRouter API falha
2. Agente usa `models.json` existente como base
3. Log: "⚠️ OpenRouter unavailable — catalog not updated. Benchmark scores may still be fetched."

## Decisions

| Context | Decision | Rationale |
|---------|----------|-----------|
| Fonte de modelos | Híbrido: whitelist de famílias + OpenRouter para versões | Evita ruído de fine-tunes e modelos irrelevantes do OpenRouter |
| Versão vs variante | Versão = número principal; variante = sabor (pro/flash/mini) | Mantém últimas 3 versões, todas as variantes de cada versão |
| Trigger de scraping | Comando Claude Code `/scrape-models` | YAGNI — manual suficiente agora, automação pode vir depois |
| Modelos obsoletos | Arquivar (`isObsolete: true`), não deletar | Preserva permalinks e histórico, sem 404s |
| Single source of truth | `models.json` é autoritativo; `providers.ts` derivado | Evita drift entre os dois arquivos |
| Family mapping | Agente constrói e mantém `model-families.json` | Parsing por regex falha em edge cases; mapeamento explícito é mais robusto |
| Benchmark fonte primária | ArtificialAnalysis.ai API | Dados estruturados, cobertura ampla dos 14 benchmarks alvo |
| Benchmark fallback | Web fetch nos sites dos providers | Agente avalia o que falta e busca nos sites relevantes |
| Family UI grouping | Grid agrupa por família com hierarquia visual | 25-30 modelos sem agrupamento fica confuso |

## Edge Cases

| Name | Description | Strategy |
|------|-------------|----------|
| Slug ambíguo | `gpt-4-turbo` e `gpt-4-1106-preview` são o mesmo modelo | `model-families.json` mapeia aliases explicitamente |
| Modelo sem versão clara | `deepseek-r1-lite` — versão ou variante? | Agente classifica; se incerto, loga para revisão manual |
| Score conflitante | ArtificialAnalysis diz 85%, site do provider diz 87% | Preferência para ArtificialAnalysis; campo `scoreSource` registra a origem |
| Família nova (ex: GPT-5 launch) | Novo provider/família não está na whitelist | Agente detecta e propõe adição à whitelist; não inclui automaticamente |
| 4ª versão mais antiga | Regra das 3 versões arquiva a mais antiga | `isObsolete: true`, acessível via URL direta |

## Acceptance Criteria

- [ ] Schema de `models.json` inclui `family`, `version`, `variant`, `isObsolete`, `scoreSource`
- [ ] `model-families.json` existe com whitelist de famílias e mapeamento slug → metadata
- [ ] Comando `/scrape-models` executa sem erros em ambiente local
- [ ] Catálogo atualizado com modelos reais das famílias monitoradas (mínimo 20 modelos)
- [ ] Últimas 3 versões de cada família presentes; versões mais antigas marcadas como `isObsolete`
- [ ] Variantes (pro/flash/mini/codex) tratadas como parte da mesma versão
- [ ] Pelo menos 50% dos 14 benchmarks com scores reais (não `null`)
- [ ] Grid de modelos agrupa por família com hierarquia visual
- [ ] Modelos com `isObsolete: true` fora do grid mas acessíveis via URL
- [ ] Build passa sem erros após atualização do catálogo

## Spec (Token-Efficient)

**Schema extensions:**
```typescript
// ProviderModel (providers.ts)
interface ProviderModel {
  id: string;
  name: string;
  openrouterSlug: string;
  family: string;         // ex: "claude-opus", "gpt-4", "gemini"
  version: string;        // ex: "4", "4.1", "2.5"
  variant?: string;       // ex: "pro", "flash", "mini", "codex"
  isObsolete?: boolean;   // true = arquivado, não aparece no grid
}

// models.json entry
interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  openrouterSlug: string;
  family: string;
  version: string;
  variant?: string;
  isObsolete?: boolean;
  scores: Record<BenchmarkId, number | null>;
  scoreSource?: Record<BenchmarkId, "artificialanalysis" | "provider-site" | "manual" | null>;
  scrapedAt: string;
}
```

**model-families.json structure:**
```json
{
  "families": {
    "claude-opus": {
      "provider": "anthropic",
      "openrouterPrefix": "anthropic/claude-opus",
      "variants": ["default", "20241022"]
    },
    "gemini": {
      "provider": "google",
      "openrouterPrefix": "google/gemini",
      "variants": ["pro", "flash", "flash-thinking"]
    }
  },
  "aliases": {
    "openai/gpt-4-turbo": { "family": "gpt-4", "version": "turbo", "variant": "default" }
  }
}
```

**Files to create:**
- `.codeadd/commands/scrape-models.md` — Claude Code command definition
- `src/data/model-families.json` — family whitelist + alias mapping

**Files to modify:**
- `src/data/providers.ts` — extend ProviderModel interface + update all models
- `src/data/models.json` — extend schema + populate with real models
- `src/pages/models/index.astro` — family grouping logic + filter obsolete
- `src/components/ModelCard.astro` — family/version display, obsolete badge
- `src/components/ModelProfile.astro` — "Part of family X" section

## Next Steps

→ `/add-plan` para planejamento técnico detalhado
