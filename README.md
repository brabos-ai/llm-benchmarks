<p align="center">
  <img src="public/favicon.svg" alt="LLM Benchmarks" width="80" />
</p>

<h1 align="center">LLM Benchmarks</h1>

<p align="center">
  Visual dashboard for comparing AI model benchmarks — open-source, transparent, and community-driven.
</p>

<p align="center">
  <a href="https://benchmarks.brabos.ai">
    <img src="https://img.shields.io/badge/Live%20Demo-benchmarks.brabos.ai-blue?style=flat-square&logo=googlechrome&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://pages.cloudflare.com">
    <img src="https://img.shields.io/badge/Hosted%20on-Cloudflare%20Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Pages" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Astro-5.5-BC52EE?style=flat-square&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/ECharts-6.0-AA344D?style=flat-square&logo=apacheecharts&logoColor=white" alt="ECharts" />
</p>

---

## About

**LLM Benchmarks** is an open-source dashboard that aggregates and visualizes benchmark scores for leading AI language models. Compare models side-by-side, explore individual profiles with radar charts, and track performance across standardized benchmarks.

**[View Live Dashboard →](https://benchmarks.brabos.ai)**

### Features

- **Model Comparison** — Select multiple models and compare across all benchmarks with interactive bar charts
- **Model Profiles** — Individual pages with radar charts showing strengths and weaknesses
- **Real Data** — Benchmark scores fetched from OpenRouter at build time
- **Dark/Light Theme** — Full theme support with smooth transitions
- **Responsive** — Works on desktop, tablet, and mobile
- **Static & Fast** — Built with Astro for zero JavaScript by default, interactive where needed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) (SSG) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Charts | [Apache ECharts](https://echarts.apache.org) via CDN |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) |
| CI/CD | [cloudflare/wrangler-action v3](https://github.com/cloudflare/wrangler-action) |
| Data Source | [OpenRouter API](https://openrouter.ai) (build-time) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/xmaiconx/llm-benchmarks.git
cd llm-benchmarks

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist` |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run Astro type checking |

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ModelCard.astro
│   ├── ModelProfile.astro
│   ├── ModelSelector.astro
│   ├── RadarChart.astro
│   ├── BarChart.astro
│   └── ComparisonDashboard.astro
├── data/              # Data sources and types
│   ├── models.json    # Model benchmark scores
│   ├── benchmarks.ts  # Benchmark definitions
│   ├── providers.ts   # Provider metadata
│   └── openrouter.ts  # Build-time API fetch
├── layouts/           # Page layouts
├── pages/             # Route pages
│   ├── index.astro
│   ├── models/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── compare.astro
└── styles/            # Global styles
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/xmaiconx">@xmaiconx</a>
</p>
