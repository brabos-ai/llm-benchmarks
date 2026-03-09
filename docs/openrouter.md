# OpenRouter API Endpoints Documentation

Documentação dos endpoints da API OpenRouter utilizados no projeto LLM Benchmarks.

**Base URL:** `https://openrouter.ai/api`

---

## Endpoints Utilizados

### 1. Author Models
**Endpoint:** `/frontend/author-models?authorSlug={author}`

**Método:** GET

**Descrição:** Retorna todos os modelos de um provider específico com dados completos incluindo pricing, specs e metadados.

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| authorSlug | string | Sim | Slug do provider (ex: anthropic, openai, google) |

**Response Structure:**
```json
{
  "data": {
    "author": {
      "id": "uuid",
      "slug": "anthropic",
      "name": "Anthropic",
      "created_at": "2024-12-04T22:50:57.620996+00:00"
    },
    "models": [
      {
        "slug": "anthropic/claude-sonnet-4.6",
        "name": "Anthropic: Claude Sonnet 4.6",
        "created_at": "2026-02-17T15:43:10.807722+00:00",
        "author": "anthropic",
        "context_length": 1000000,
        "input_modalities": ["text", "image"],
        "output_modalities": ["text"],
        "supports_reasoning": true,
        "permaslug": "anthropic/claude-4.6-sonnet-20260217",
        "endpoint": {
          "max_completion_tokens": 128000,
          "pricing": {
            "prompt": "0.000003",
            "completion": "0.000015",
            "input_cache_read": "0.0000003",
            "input_cache_write": "0.00000375"
          },
          "model_variant_permaslug": "anthropic/claude-4.6-sonnet-20260217"
        }
      }
    ]
  }
}
```

**Campos Extraídos:**
| Campo | Path JSON | Uso |
|-------|-----------|-----|
| slug | `models[].slug` | Identificador único do modelo |
| name | `models[].name` | Nome de exibição |
| created_at | `models[].created_at` | Ordenação por data |
| author | `models[].author` | Provider do modelo |
| context_length | `models[].context_length` | Tamanho do contexto |
| input_modalities | `models[].input_modalities` | Modalidades de entrada |
| output_modalities | `models[].output_modalities` | Modalidades de saída |
| supports_reasoning | `models[].supports_reasoning` | Suporte a reasoning |
| permaslug | `models[].permaslug` | Slug permanente para stats |
| max_completion_tokens | `models[].endpoint.max_completion_tokens` | Máximo de tokens de saída |
| pricing.prompt | `models[].endpoint.pricing.prompt` | Preço por token de entrada |
| pricing.completion | `models[].endpoint.pricing.completion` | Preço por token de saída |
| pricing.input_cache_read | `models[].endpoint.pricing.input_cache_read` | Preço cache read |
| pricing.input_cache_write | `models[].endpoint.pricing.input_cache_write` | Preço cache write |

**Providers Suportados:**
- anthropic
- openai
- google
- x-ai
- deepseek
- moonshotai
- minimax
- meta-llama
- mistralai
- etc.

---

### 2. Artificial Analysis Benchmarks
**Endpoint:** `/internal/v1/artificial-analysis-benchmarks?slug={slug}`

**Método:** GET

**Descrição:** Retorna scores de benchmarks do Artificial Analysis para um modelo específico. Pode retornar múltiplas variantes do mesmo modelo (ex: adaptive vs non-reasoning).

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| slug | string | Sim | Slug do modelo (ex: anthropic/claude-opus-4.6) |

**Response Structure:**
```json
{
  "data": [
    {
      "aa_id": "53c98840-47af-49aa-94e6-469fb17e9a1b",
      "aa_slug": "claude-opus-4-6-adaptive",
      "aa_name": "Claude Opus 4.6 (Adaptive Reasoning, Max Effort)",
      "permaslug": "anthropic/claude-opus-4.6",
      "openrouter_slug": "anthropic/claude-opus-4.6",
      "benchmark_data": {
        "model_type": "llm",
        "evaluations": {
          "artificial_analysis_intelligence_index": 53,
          "artificial_analysis_coding_index": 48.1,
          "artificial_analysis_agentic_index": 67.6,
          "gdpval_aa": 0.553,
          "aa_omniscience_accuracy": 0.464,
          "aa_omniscience_non_hallucination_rate": 0.387,
          "lcr": 0.707,
          "ifbench": 0.531,
          "gpqa": 0.896,
          "hle": 0.367,
          "scicode": 0.519,
          "terminalbench_hard": 0.462,
          "critpt": 0.126
        }
      },
      "percentiles": {
        "intelligence_percentile": 99,
        "coding_percentile": 98,
        "agentic_percentile": 99
      }
    }
  ]
}
```

**Campos Extraídos:**
| Campo | Path JSON | Uso |
|-------|-----------|-----|
| intelligence_index | `benchmark_data.evaluations.artificial_analysis_intelligence_index` | Score de inteligência |
| coding_index | `benchmark_data.evaluations.artificial_analysis_coding_index` | Score de coding |
| agentic_index | `benchmark_data.evaluations.artificial_analysis_agentic_index` | Score de agentic |
| gpqa | `benchmark_data.evaluations.gpqa` | GPQA benchmark |
| hle | `benchmark_data.evaluations.hle` | HLE score |
| scicode | `benchmark_data.evaluations.scicode` | SciCode benchmark |
| ifbench | `benchmark_data.evaluations.ifbench` | IFBench score |
| lcr | `benchmark_data.evaluations.lcr` | LCR benchmark |
| terminalbench_hard | `benchmark_data.evaluations.terminalbench_hard` | TerminalBench hard |
| gdpval | `benchmark_data.evaluations.gdpval_aa` | GDP validation |
| omniscience_accuracy | `benchmark_data.evaluations.aa_omniscience_accuracy` | Omniscience accuracy |
| omniscience_non_hallucination | `benchmark_data.evaluations.aa_omniscience_non_hallucination_rate` | Non-hallucination rate |
| critpt | `benchmark_data.evaluations.critpt` | CritPT score |
| intelligence_percentile | `percentiles.intelligence_percentile` | Percentil de inteligência |
| coding_percentile | `percentiles.coding_percentile` | Percentil de coding |
| agentic_percentile | `percentiles.agentic_percentile` | Percentil de agentic |

**Notas:**
- Cada modelo pode ter múltiplas entradas (variantes)
- Usar primeira ocorrência ou extrair todas as variantes
- O campo `permaslug` faz o link com o modelo no OpenRouter

---

### 3. Model Stats
**Endpoint:** `/frontend/stats/endpoint?permaslug={permaslug}&variant=standard`

**Método:** GET

**Descrição:** Retorna estatísticas de performance (latência e throughput) para um modelo específico.

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| permaslug | string | Sim | Permaslug do modelo (ex: anthropic/claude-4.6-sonnet-20260217) |
| variant | string | Não | Variante do modelo (default: standard) |

**Response Structure:**
```json
{
  "id": "uuid",
  "name": "Anthropic | anthropic/claude-4.6-sonnet-20260217",
  "permaslug": "anthropic/claude-4.6-sonnet-20260217",
  "stats": {
    "p50_latency": 250,
    "p75_latency": 350,
    "p90_latency": 500,
    "p95_latency": 750,
    "p99_latency": 1200,
    "p50_throughput": 45.5,
    "p75_throughput": 42.3,
    "p90_throughput": 38.1,
    "p95_throughput": 35.2,
    "p99_throughput": 28.7
  },
  "pricing": {
    "prompt": "0.000003",
    "completion": "0.000015"
  }
}
```

**Campos Extraídos:**
| Campo | Path JSON | Uso |
|-------|-----------|-----|
| latency_p50 | `stats.p50_latency` | Latência percentil 50 |
| latency_p75 | `stats.p75_latency` | Latência percentil 75 |
| latency_p90 | `stats.p90_latency` | Latência percentil 90 |
| latency_p95 | `stats.p95_latency` | Latência percentil 95 |
| latency_p99 | `stats.p99_latency` | Latência percentil 99 |
| throughput_p50 | `stats.p50_throughput` | Throughput percentil 50 |
| throughput_p75 | `stats.p75_throughput` | Throughput percentil 75 |
| throughput_p90 | `stats.p90_throughput` | Throughput percentil 90 |
| throughput_p95 | `stats.p95_throughput` | Throughput percentil 95 |
| throughput_p99 | `stats.p99_throughput` | Throughput percentil 99 |

**Notas:**
- Latência em milissegundos
- Throughput em tokens por segundo
- Valores podem ser null se não houver dados suficientes

---

## Fluxo de Extração

```
Para cada provider na lista:
  1. GET /author-models?authorSlug={provider}
     → Extrair: slug, name, created_at, context_length, modalities, pricing, permaslug

Para cada modelo:
  2. GET /artificial-analysis-benchmarks?slug={slug}
     → Extrair: todos os benchmarks

  3. GET /stats/endpoint?permaslug={permaslug}
     → Extrair: latency e throughput percentiles

  4. Chatbot Arena CSV
     → Extrair: arena-elo, mt-bench
```

---

## Estratégia de Cache

**IMPORTANTE:** As respostas das APIs são grandes. NUNCA carregar JSON completo em contexto.

**Processo:**
1. Salvar resposta em arquivo temporário
2. Usar `grep` ou `jq` para extrair apenas campos necessários
3. Parsear apenas o snippet extraído
4. Deletar arquivo temporário

**Exemplos de extração:**

```bash
# Author Models - extrair dados de modelo específico
grep -o '"slug":"anthropic/claude-[^"]*"[^}]*"created_at":"[^"]*"' /tmp/author-models.json

# Benchmarks - extrair evaluations
grep -o '"evaluations":{[^}]*}' /tmp/benchmarks.json

# Stats - extrair latência
grep -o '"p[0-9]*_latency":[0-9.]*' /tmp/stats.json
```

---

## Rate Limits

OpenRouter não documenta rate limits específicos para esses endpoints internos.

**Recomendações:**
- Adicionar delay de 100-200ms entre chamadas
- Cachear resultados quando possível
- Implementar retry com exponential backoff

---

## Atualizações

**2026-03-09:** Documento criado com endpoints atuais
- `/author-models` - pricing completo + specs
- `/artificial-analysis-benchmarks` - todos os benchmarks
- `/stats/endpoint` - latency + throughput

**Nota:** Endpoints em `/internal` podem mudar sem aviso prévio.
