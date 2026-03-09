export { benchmarks as scoreBenchmarks } from "./benchmarks";
export type { BenchmarkId as ScoreBenchmarkId, Benchmark as BenchmarkFull } from "./benchmarks";

export type CategoryId =
  | "all"
  | "agentic"
  | "multiagent"
  | "coding"
  | "general"
  | "reasoning";

export type BenchmarkId =
  | "sweBenchDesc"
  | "humanEvalDesc"
  | "mmluDesc"
  | "gpqaDesc"
  | "mathDesc"
  | "tauDesc"
  | "gaiaDesc"
  | "webArenaDesc"
  | "arenaDesc"
  | "mtBenchDesc"
  | "liveCodeDesc"
  | "agentBenchDesc"
  | "ifEvalDesc"
  | "simpleQADesc";

export type BenchmarkWhatId =
  | "sweBenchWhat"
  | "humanEvalWhat"
  | "mmluWhat"
  | "gpqaWhat"
  | "mathWhat"
  | "tauWhat"
  | "gaiaWhat"
  | "webArenaWhat"
  | "arenaWhat"
  | "mtBenchWhat"
  | "liveCodeWhat"
  | "agentBenchWhat"
  | "ifEvalWhat"
  | "simpleQAWhat";

export type TranslationKey =
  | "role"
  | "eyebrow"
  | "h1"
  | "subtitle"
  | "sectionBench"
  | "sectionSummary"
  | "all"
  | "agentic"
  | "multiagent"
  | "coding"
  | "general"
  | "reasoning"
  | "tagAgentic"
  | "tagCoding"
  | "tagGeneral"
  | "tagReasoning"
  | "tagMulti"
  | "measures"
  | "relevance"
  | "summaryMulti"
  | "summaryGeneral"
  | "summaryReasoning"
  | "footnote1"
  | "footnote2"
  | "statBenchmarks"
  | "statCategories"
  | "statLanguages"
  | "nav_home"
  | "nav_models"
  | "nav_compare"
  | "models_page_title"
  | "models_filter_label"
  | "models_sort_label"
  | "model_best_for"
  | "model_scores_from"
  | "model_deprecated"
  | "model_price_input"
  | "model_price_output"
  | "model_context_window"
  | "model_latency"
  | "model_compare_cta"
  | "compare_page_title"
  | "compare_select_prompt"
  | "compare_add_model"
  | "compare_max_models"
  | BenchmarkId
  | BenchmarkWhatId;

export interface Category {
  id: CategoryId;
  colorToken: string;
  labelKey: TranslationKey;
  icon: string;
}

export interface Benchmark {
  name: string;
  categories: Exclude<CategoryId, "all">[];
  descriptionKey: BenchmarkId;
  whatKey: BenchmarkWhatId;
  relevanceScores: Record<Exclude<CategoryId, "all">, number>;
  tagKeys: TranslationKey[];
}

export interface SummaryCard {
  category: Exclude<CategoryId, "all">;
  titleKey?: TranslationKey;
  icon: string;
  items: string[];
}

export const categories: Category[] = [
  { id: "all", colorToken: "--text", labelKey: "all", icon: "" },
  { id: "agentic", colorToken: "--agentic", labelKey: "agentic", icon: "" },
  { id: "multiagent", colorToken: "--multiagent", labelKey: "multiagent", icon: "" },
  { id: "coding", colorToken: "--coding", labelKey: "coding", icon: "" },
  { id: "general", colorToken: "--general", labelKey: "general", icon: "" },
  { id: "reasoning", colorToken: "--reasoning", labelKey: "reasoning", icon: "" }
];

export const benchmarks: Benchmark[] = [
  {
    name: "SWE-bench",
    categories: ["agentic", "coding"],
    descriptionKey: "sweBenchDesc",
    whatKey: "sweBenchWhat",
    relevanceScores: { agentic: 5, multiagent: 3, coding: 5, general: 1, reasoning: 2 },
    tagKeys: ["tagAgentic", "tagCoding"]
  },
  {
    name: "HumanEval / MBPP",
    categories: ["coding"],
    descriptionKey: "humanEvalDesc",
    whatKey: "humanEvalWhat",
    relevanceScores: { agentic: 1, multiagent: 0, coding: 4, general: 1, reasoning: 2 },
    tagKeys: ["tagCoding"]
  },
  {
    name: "MMLU",
    categories: ["general"],
    descriptionKey: "mmluDesc",
    whatKey: "mmluWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 1, general: 5, reasoning: 2 },
    tagKeys: ["tagGeneral"]
  },
  {
    name: "GPQA (Diamond)",
    categories: ["reasoning"],
    descriptionKey: "gpqaDesc",
    whatKey: "gpqaWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 1, general: 2, reasoning: 5 },
    tagKeys: ["tagReasoning"]
  },
  {
    name: "MATH / AIME",
    categories: ["reasoning"],
    descriptionKey: "mathDesc",
    whatKey: "mathWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 2, general: 1, reasoning: 5 },
    tagKeys: ["tagReasoning"]
  },
  {
    name: "TAU-bench",
    categories: ["agentic", "multiagent"],
    descriptionKey: "tauDesc",
    whatKey: "tauWhat",
    relevanceScores: { agentic: 5, multiagent: 4, coding: 1, general: 2, reasoning: 1 },
    tagKeys: ["tagAgentic", "tagMulti"]
  },
  {
    name: "GAIA",
    categories: ["agentic", "multiagent"],
    descriptionKey: "gaiaDesc",
    whatKey: "gaiaWhat",
    relevanceScores: { agentic: 4, multiagent: 5, coding: 2, general: 2, reasoning: 3 },
    tagKeys: ["tagAgentic", "tagMulti"]
  },
  {
    name: "WebArena",
    categories: ["agentic"],
    descriptionKey: "webArenaDesc",
    whatKey: "webArenaWhat",
    relevanceScores: { agentic: 5, multiagent: 2, coding: 1, general: 1, reasoning: 2 },
    tagKeys: ["tagAgentic"]
  },
  {
    name: "Chatbot Arena (LMSYS)",
    categories: ["general"],
    descriptionKey: "arenaDesc",
    whatKey: "arenaWhat",
    relevanceScores: { agentic: 2, multiagent: 1, coding: 2, general: 5, reasoning: 2 },
    tagKeys: ["tagGeneral"]
  },
  {
    name: "MT-Bench",
    categories: ["general"],
    descriptionKey: "mtBenchDesc",
    whatKey: "mtBenchWhat",
    relevanceScores: { agentic: 2, multiagent: 1, coding: 2, general: 4, reasoning: 2 },
    tagKeys: ["tagGeneral"]
  },
  {
    name: "LiveCodeBench",
    categories: ["coding"],
    descriptionKey: "liveCodeDesc",
    whatKey: "liveCodeWhat",
    relevanceScores: { agentic: 1, multiagent: 0, coding: 5, general: 1, reasoning: 3 },
    tagKeys: ["tagCoding"]
  },
  {
    name: "AgentBench",
    categories: ["multiagent"],
    descriptionKey: "agentBenchDesc",
    whatKey: "agentBenchWhat",
    relevanceScores: { agentic: 3, multiagent: 5, coding: 2, general: 1, reasoning: 1 },
    tagKeys: ["tagMulti"]
  },
  {
    name: "IFEval",
    categories: ["general", "agentic"],
    descriptionKey: "ifEvalDesc",
    whatKey: "ifEvalWhat",
    relevanceScores: { agentic: 4, multiagent: 2, coding: 1, general: 4, reasoning: 1 },
    tagKeys: ["tagGeneral", "tagAgentic"]
  },
  {
    name: "SimpleQA",
    categories: ["general"],
    descriptionKey: "simpleQADesc",
    whatKey: "simpleQAWhat",
    relevanceScores: { agentic: 0, multiagent: 0, coding: 0, general: 3, reasoning: 1 },
    tagKeys: ["tagGeneral"]
  }
];

export const summaryCards: SummaryCard[] = [
  { category: "agentic", icon: "", items: ["SWE-bench Verified", "TAU-bench", "WebArena / VisualWebArena", "GAIA", "IFEval"] },
  { category: "multiagent", titleKey: "summaryMulti", icon: "", items: ["GAIA", "AgentBench", "TAU-bench", "SWE-bench"] },
  { category: "coding", icon: "", items: ["SWE-bench", "LiveCodeBench", "HumanEval / MBPP", "BigCodeBench"] },
  { category: "general", titleKey: "summaryGeneral", icon: "", items: ["Chatbot Arena", "MT-Bench", "MMLU", "SimpleQA", "IFEval"] },
  { category: "reasoning", titleKey: "summaryReasoning", icon: "", items: ["GPQA Diamond", "AIME 2024/2025", "MATH-500", "ARC-Challenge"] }
];

export const translations = {
  pt: {
    role: "Especialista em IA & Agentes Inteligentes",
    eyebrow: "referência técnica",
    h1: 'Guia de <span class="accent-word">Benchmarks</span> de LLMs',
    subtitle: "O que cada benchmark realmente mede — e qual usar como referência dependendo do seu caso de uso.",
    sectionBench: "benchmarks — clique nos filtros para destacar",
    sectionSummary: "resumo por caso de uso — benchmarks prioritários",
    all: "Todos",
    agentic: "Agentic",
    multiagent: "Multi-Agente",
    coding: "Vibe Coding",
    general: "Assistente Geral",
    reasoning: "Raciocínio",
    tagAgentic: "Agentic",
    tagCoding: "Coding",
    tagGeneral: "Assistente Geral",
    tagReasoning: "Raciocínio",
    tagMulti: "Multi-Agente",
    measures: "Mede:",
    relevance: "Relevância",
    summaryMulti: "Multi-Agente",
    summaryGeneral: "Assistente Geral",
    summaryReasoning: "Raciocínio",
    sweBenchDesc: "O modelo recebe um repositório GitHub real com um bug reportado e precisa escrever o patch que resolve o issue — sem dicas de onde está o problema.",
    sweBenchWhat: "capacidade de navegar codebases complexas, entender contexto amplo, planejar edições multi-arquivo e executar ações sequenciais de forma autônoma.",
    humanEvalDesc: "Problemas de programação isolados: dado um enunciado, gere a função correta. HumanEval usa Python, MBPP inclui problemas de nível iniciante a médio.",
    humanEvalWhat: 'síntese de código em uma única função. Não testa raciocínio agentic nem edição de arquivos reais. Bom para "o modelo sabe programar básico?"',
    mmluDesc: "57 áreas de conhecimento: medicina, direito, história, física, matemática, ética... O modelo responde perguntas de múltipla escolha de nível universitário/pós-grad.",
    mmluWhat: 'amplitude do conhecimento factual do modelo. Ótimo indicador de se o modelo é um bom "assistente generalista" culto. Não testa raciocínio profundo.',
    gpqaDesc: "Perguntas criadas por PhDs em física, biologia e química — tão difíceis que especialistas não-da-área erram 30% mesmo com acesso à internet. Diamond = subconjunto mais duro.",
    gpqaWhat: "raciocínio científico profundo e rigoroso. Indica capacidade de pesquisa técnica avançada. Não testa código nem capacidade agentic diretamente.",
    mathDesc: "MATH: 12.500 problemas de competição (álgebra, cálculo, probabilidade). AIME: prova americana de olimpíada — 15 problemas por competição, sem múltipla escolha.",
    mathWhat: "raciocínio matemático passo a passo, rigor lógico e resolução de problemas com múltiplas etapas. Referência direta para modelos de raciocínio (o1, R1, etc).",
    tauDesc: "Simula agentes de atendimento ao cliente com ferramentas reais (banco de dados, APIs). O agente precisa resolver tasks multi-etapa conversando com um usuário simulado.",
    tauWhat: "uso de ferramentas (tool use), tomada de decisão em ambientes reativos, seguimento de políticas e resiliência a erros. Referência para agentes em produção.",
    gaiaDesc: "Tasks do mundo real que humanos resolveriam em minutos mas exigem que o agente use buscas na web, leia PDFs, execute código e combine múltiplas fontes de informação.",
    gaiaWhat: "orquestração de ferramentas heterogêneas, planejamento de longo prazo e grounding no mundo real. Muito usado para avaliar assistentes agentic como Deep Research.",
    webArenaDesc: "O agente controla um navegador real e executa tasks em sites simulados (Reddit, GitLab, e-commerce, mapas). VisualWebArena adiciona percepção visual (screenshots).",
    webArenaWhat: "navegação web autônoma, interação com UI real, planejamento de ações sequenciais. Referência para computer-use agents e agentes de automação.",
    arenaDesc: "Humanos reais comparam dois modelos anônimos em conversas livres e votam no melhor. O ranking ELO é calculado com milhares de preferências reais.",
    arenaWhat: 'preferência humana real em uso cotidiano — escrita, conversação, instrução-seguimento, tom. Melhor proxy para "qual modelo as pessoas gostam mais de usar".',
    mtBenchDesc: '80 conversas de múltiplos turnos em 8 categorias (escrita, roleplay, extração, raciocínio, matemática, código, etc.). GPT-4 avalia as respostas como "juiz".',
    mtBenchWhat: "instrução-seguimento em contexto de chat real e coerência de múltiplos turnos. Mais próximo do uso real de chatbot do que benchmarks de múltipla escolha.",
    liveCodeDesc: "Problemas de programação competitiva coletados após o cutoff dos modelos (LeetCode, Codeforces, AtCoder) — evita contaminação de dados de treino.",
    liveCodeWhat: 'capacidade de resolver problemas novos de algoritmos e estruturas de dados. Mais confiável que HumanEval por ser a "prova ao vivo" do modelo.',
    agentBenchDesc: "Suite de 8 ambientes: OS, banco de dados, web, jogos, compras, e mais. O modelo age como agente autônomo em cada ambiente interativo.",
    agentBenchWhat: "generalização do comportamento agentic em ambientes diversificados — crucial para avaliar frameworks como AutoGPT, CrewAI e similares.",
    ifEvalDesc: 'Instruções com restrições verificáveis explicitamente: "responda em menos de 100 palavras", "use exatamente 3 seções com heading", "não use a palavra X".',
    ifEvalWhat: "seguimento preciso de instruções e restrições — habilidade crítica tanto para assistentes quanto para agentes que recebem system prompts detalhados.",
    simpleQADesc: 'Perguntas factuais de resposta curta e verificável sobre o mundo real. Projetado para medir calibração: o modelo não deve "alucinar" confiante quando não sabe.',
    simpleQAWhat: "honestidade factual e calibração de confiança. Um modelo com alta taxa de alucinação vai mal aqui mesmo com MMLU alto.",
    footnote1: "<strong>Atenção ao marketing:</strong> empresas escolhem quais benchmarks reportar. Um modelo pode ter SWE-bench alto mas Chatbot Arena mediano — escolha o benchmark alinhado ao SEU uso.",
    footnote2: "<strong>Contaminação de dados</strong> é um problema real: modelos podem ter sido treinados em dados que incluem os benchmarks. LiveCodeBench e GPQA Diamond são mais resistentes a isso.",
    statBenchmarks: "benchmarks",
    statCategories: "categorias",
    statLanguages: "idiomas",
    nav_home: "Home",
    nav_models: "Modelos",
    nav_compare: "Comparar",
    models_page_title: "Modelos de IA",
    models_filter_label: "Filtrar por:",
    models_sort_label: "Ordenar por:",
    model_best_for: "Melhor para:",
    model_scores_from: "Scores de",
    model_deprecated: "Descontinuado",
    model_price_input: "Entrada",
    model_price_output: "Saída",
    model_context_window: "Janela de contexto",
    model_latency: "Latência",
    model_compare_cta: "Comparar este modelo →",
    compare_page_title: "Comparar Modelos",
    compare_select_prompt: "Selecione modelos para comparar",
    compare_add_model: "Adicionar modelo",
    compare_max_models: "Máximo 4 modelos"
  },
  en: {
    role: "AI & Intelligent Agents Specialist",
    eyebrow: "technical reference",
    h1: 'LLM <span class="accent-word">Benchmarks</span> Guide',
    subtitle: "What each benchmark truly measures — and which one to use depending on your use case.",
    sectionBench: "benchmarks — click filters to highlight",
    sectionSummary: "summary by use case — priority benchmarks",
    all: "All",
    agentic: "Agentic",
    multiagent: "Multi-Agent",
    coding: "Vibe Coding",
    general: "General Assistant",
    reasoning: "Reasoning",
    tagAgentic: "Agentic",
    tagCoding: "Coding",
    tagGeneral: "General Assistant",
    tagReasoning: "Reasoning",
    tagMulti: "Multi-Agent",
    measures: "Measures:",
    relevance: "Relevance",
    summaryMulti: "Multi-Agent",
    summaryGeneral: "General Assistant",
    summaryReasoning: "Reasoning",
    sweBenchDesc: "The model receives a real GitHub repo with a reported bug and must write the patch that fixes it — no hints about where the problem is.",
    sweBenchWhat: "ability to navigate complex codebases, understand broad context, plan multi-file edits and execute sequential actions autonomously.",
    humanEvalDesc: "Isolated programming problems: given a description, generate the correct function. HumanEval uses Python; MBPP includes beginner-to-intermediate problems.",
    humanEvalWhat: 'code synthesis in a single function. Does not test agentic reasoning or real file editing. Good for "can the model code at all?"',
    mmluDesc: "57 knowledge domains: medicine, law, history, physics, math, ethics... The model answers multiple-choice questions at university/grad level.",
    mmluWhat: "breadth of factual knowledge. Great indicator of whether the model is a well-rounded generalist. Does not test deep reasoning.",
    gpqaDesc: "Questions created by PhDs in physics, biology, and chemistry — so hard that non-domain experts get 30% wrong even with internet access. Diamond = hardest subset.",
    gpqaWhat: "deep and rigorous scientific reasoning. Signals advanced technical research capability. Does not directly test code or agentic behavior.",
    mathDesc: "MATH: 12,500 competition problems (algebra, calculus, probability). AIME: US math olympiad — 15 problems per competition, no multiple-choice.",
    mathWhat: "step-by-step mathematical reasoning, logical rigor, and multi-step problem solving. Direct benchmark for reasoning models (o1, R1, etc).",
    tauDesc: "Simulates customer support agents with real tools (databases, APIs). The agent must solve multi-step tasks by conversing with a simulated user.",
    tauWhat: "tool use, decision-making in reactive environments, policy following, and error resilience. Benchmark for production agents.",
    gaiaDesc: "Real-world tasks humans could solve in minutes but that require the agent to web search, read PDFs, run code, and combine multiple information sources.",
    gaiaWhat: "orchestration of heterogeneous tools, long-term planning, and real-world grounding. Widely used to evaluate agentic assistants like Deep Research.",
    webArenaDesc: "The agent controls a real browser and performs tasks on simulated sites (Reddit, GitLab, e-commerce, maps). VisualWebArena adds visual perception (screenshots).",
    webArenaWhat: "autonomous web navigation, real UI interaction, sequential action planning. Reference for computer-use agents and automation agents.",
    arenaDesc: "Real humans compare two anonymous models in open-ended conversations and vote for the best. The ELO ranking is computed from thousands of real preferences.",
    arenaWhat: 'real human preference in everyday use — writing, conversation, instruction following, tone. Best proxy for "which model do people actually prefer".',
    mtBenchDesc: '80 multi-turn conversations across 8 categories (writing, roleplay, extraction, reasoning, math, code, etc.). GPT-4 acts as a judge evaluating responses.',
    mtBenchWhat: "instruction following in real chat context and multi-turn coherence. Closer to real chatbot use than multiple-choice benchmarks.",
    liveCodeDesc: "Competitive programming problems collected after model cutoffs (LeetCode, Codeforces, AtCoder) — avoids training data contamination.",
    liveCodeWhat: "ability to solve novel algorithm and data structure problems. More reliable than HumanEval because it is the live test of the model.",
    agentBenchDesc: "Suite of 8 environments: OS, database, web, games, shopping, and more. The model acts as an autonomous agent in each interactive environment.",
    agentBenchWhat: "generalization of agentic behavior across diverse environments — crucial for evaluating frameworks like AutoGPT, CrewAI and similar.",
    ifEvalDesc: 'Instructions with explicitly verifiable constraints: "respond in under 100 words", "use exactly 3 sections with headings", "do not use the word X".',
    ifEvalWhat: "precise instruction and constraint following — critical skill for both assistants and agents receiving detailed system prompts.",
    simpleQADesc: "Short, verifiable factual questions about the real world. Designed to measure calibration: the model should not confidently hallucinate when it does not know.",
    simpleQAWhat: "factual honesty and confidence calibration. A model with a high hallucination rate will score poorly here even with a high MMLU.",
    footnote1: "<strong>Beware of marketing:</strong> companies choose which benchmarks to report. A model can have a high SWE-bench but a mediocre Chatbot Arena score — pick the benchmark aligned with YOUR use case.",
    footnote2: "<strong>Data contamination</strong> is a real issue: models may have been trained on data that includes the benchmarks. LiveCodeBench and GPQA Diamond are more resistant due to being newer or expert-curated.",
    statBenchmarks: "benchmarks",
    statCategories: "categories",
    statLanguages: "languages",
    nav_home: "Home",
    nav_models: "Models",
    nav_compare: "Compare",
    models_page_title: "AI Models",
    models_filter_label: "Filter by:",
    models_sort_label: "Sort by:",
    model_best_for: "Best for:",
    model_scores_from: "Scores from",
    model_deprecated: "Deprecated",
    model_price_input: "Input",
    model_price_output: "Output",
    model_context_window: "Context window",
    model_latency: "Latency",
    model_compare_cta: "Compare this model →",
    compare_page_title: "Compare Models",
    compare_select_prompt: "Select models to compare",
    compare_add_model: "Add model",
    compare_max_models: "Maximum 4 models"
  }
} as const;
