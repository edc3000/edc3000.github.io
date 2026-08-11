# edc3000.github.io 个人技术博客实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建并部署 https://edc3000.github.io —— 面向中文技术社区的开源技术博客,四个板块(竞赛/论文/算法实践/skills)各有独立 schema,支持中文全文搜索与 RSS。

**Architecture:** Astro 静态站点。四个 Content Collection 用 Zod schema 在构建时校验 frontmatter。已完成的精排版 HTML 报告放 `public/reports/` 原样保留,Markdown 正文版进入 collection 供搜索/RSS/标签使用,文章页用按钮连接两者。Pagefind 在构建后扫描产物建立 CJK 索引。

**Tech Stack:** Astro 7.2.0 · Sätteri(Astro 7 默认 Markdown 处理器,原生支持 GFM)· @astrojs/rss 4.0.19 · @astrojs/sitemap 3.7.3 · astro-pagefind 2.0.1 · vitest · pnpm · GitHub Actions(withastro/action@v6)

## Global Constraints

- **Node ≥ 22.12.0**(Astro 7 硬性要求)。本机 v25.7.0,满足。
- **包管理器统一用 pnpm**。不要混用 npm/yarn 产生多份 lockfile。
- **不安装 `@astrojs/markdown-remark`**。Astro 7 默认的 Sätteri 已原生支持 GFM(表格、脚注、删除线、任务列表),竞赛报告的表格无需额外插件。只有在确实需要某个 remark/rehype 插件时才回退,且需先记录原因。
- **Astro 7 使用 Rust 编译器,对 HTML 合法性严格**:所有标签必须闭合,不允许 `<div>` 嵌在 `<p>` 内。
- **`compressHTML` 在 Astro 7 默认为 `'jsx'`**,会按 JSX 规则移除内联元素间空白。中英混排若出现粘连,在 `astro.config.mjs` 设 `compressHTML: true` 修正。
- **内容一律手动导入**,禁止编写任何从 `my/kaggle/` 或 obsidian vault 自动同步的脚本(源目录含私密内容,见 spec §4)。
- **配色 token 必须逐字使用**以下值,它们提取自用户已有的报告与简历,是既存的个人视觉标识:
  `--paper: #f8f5ec` · `--paper-light: #fbfaf6` · `--ink: #292a26` · `--muted: #706b60` · `--line: #ded8ca` · `--green: #2c675b` · `--green-dark: #263d38` · `--gold: #b98a3d` · `--blue: #587c98` · `--brick: #c56050`
- **正文宽度 780px**,与现有报告一致。
- **站点语言为 `zh-CN`**,所有页面 `<html lang="zh-CN">`。
- 提交信息用中文,末尾附 `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`。

## 文件结构

```
edc3000.github.io/
├── astro.config.mjs              站点配置、集成注册
├── package.json / tsconfig.json / .gitignore
├── vitest.config.ts              纯函数单元测试配置
├── .github/workflows/deploy.yml  构建并部署到 GitHub Pages
├── public/
│   └── reports/                  精排版 HTML 典藏版(逐字节保留,不经编译)
├── src/
│   ├── content.config.ts         四个 collection 的 loader + Zod schema
│   ├── content/
│   │   ├── competitions/  papers/  algorithms/  skills/
│   ├── lib/
│   │   ├── format.ts             Top% 计算、日期格式化(纯函数,有单测)
│   │   └── collections.ts        跨 collection 聚合查询
│   ├── styles/global.css         设计 token、亮暗主题、正文排版
│   ├── components/
│   │   ├── BaseHead.astro  Header.astro  Footer.astro
│   │   ├── ThemeToggle.astro     无闪烁主题切换
│   │   ├── MedalBadge.astro      奖牌 + Top x% 徽章
│   │   ├── PostCard.astro        列表项卡片
│   │   ├── SectionCard.astro     首页板块入口(含真实篇数)
│   │   └── RichReportLink.astro  「阅读精排版」按钮
│   ├── layouts/
│   │   ├── BaseLayout.astro      html 骨架 + 页头页脚
│   │   └── PostLayout.astro      文章页(正文排版 + 元信息)
│   └── pages/
│       ├── index.astro  about.astro  search.astro  rss.xml.ts
│       ├── competitions/index.astro  competitions/[...slug].astro
│       ├── papers/index.astro        papers/[...slug].astro
│       ├── algorithms/index.astro    algorithms/[...slug].astro
│       ├── skills/index.astro        skills/[...slug].astro
│       └── tags/[tag].astro
└── docs/superpowers/{specs,plans}/
```

**边界原则:** `lib/` 只放不依赖 Astro 运行时的纯函数,因此可被 vitest 直接测试。`components/` 只负责呈现,不做数据查询。`pages/` 负责取数并组装。四个板块的详情页各自独立而非抽象成一个泛型页——它们的元信息展示差异大(竞赛显示奖牌与 LB 分数,论文显示 arXiv 与评价,skills 显示安装命令),强行统一会产生充满条件分支的巨型组件。

## 关于本计划中的待确认项

以下两处的值来自对源报告的**推断**,实现时必须向用户确认,不得直接写入:

1. **FB3 与 MAP 两场比赛的 `metric` 名称。** 源报告只写「公开榜分数」,未注明指标。推断:FB3 为 `MCRMSE`,MAP 为 `MAP@3`。Task 4 中标注为待确认。
2. **FB3 与 MAP 的 `rank` 口径。** 源报告写的是「公开榜名次」,而 Kaggle 奖牌按 private 榜发放。rogii 报告明确区分了 public(101)与 private(177)名次,另两篇没有。因此 schema 增设 `rankNote` 字段记录口径,值需用户确认。

---

### Task 1: 项目脚手架与部署流水线

**交付物:** 一个能本地构建、并经 GitHub Actions 成功部署到 https://edc3000.github.io 的站点(内容为空壳)。这是后续所有任务的地基,先打通部署可避免最后才发现流水线问题。

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/pages/index.astro`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: 无(首个任务)
- Produces: 可运行的 Astro 项目;`pnpm dev` / `pnpm build` / `pnpm preview` 三个脚本;站点根 URL `https://edc3000.github.io`

- [ ] **Step 1: 初始化 Astro 项目**

在 `/Users/liangyan/my/edc3000.github.io` 下执行。该目录已存在且已是 git 仓库(含一次 docs 提交),因此使用 `.` 作为目标而非新建目录:

```bash
cd /Users/liangyan/my/edc3000.github.io
pnpm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --skip-houston
```

若交互式提示目录非空,选择继续(`docs/` 与 `.git/` 不会被覆盖)。

- [ ] **Step 2: 安装依赖**

```bash
pnpm install
pnpm add @astrojs/rss @astrojs/sitemap astro-pagefind
pnpm add -D vitest
```

- [ ] **Step 3: 确认 Astro 版本符合约束**

```bash
pnpm list astro
node -v
```

预期:astro 为 `7.x`,node 为 `v22.12.0` 或更高。若 astro 不是 7.x,停止并向用户报告。

- [ ] **Step 4: 写站点配置**

创建 `astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://edc3000.github.io',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap(), pagefind()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
```

- [ ] **Step 5: 写占位首页**

创建 `src/pages/index.astro`:

```astro
---
---
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>edc3000</title>
  </head>
  <body>
    <h1>站点构建中</h1>
  </body>
</html>
```

- [ ] **Step 6: 本地构建验证**

```bash
pnpm build
```

预期:构建成功,产出 `dist/index.html`。若因 Rust 编译器报 HTML 未闭合错误,补齐标签。

- [ ] **Step 7: 写 .gitignore**

创建 `.gitignore`:

```
dist/
node_modules/
.astro/
.DS_Store
*.log
.env
.env.production
```

- [ ] **Step 8: 写部署工作流**

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v6
        with:
          package-manager: pnpm@latest
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 9: 提交**

```bash
git add -A
git commit -m "feat: Astro 项目脚手架与 Pages 部署流水线

Astro 7 + pnpm,注册 sitemap 与 pagefind 集成。
GitHub Actions 使用 withastro/action@v6。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Step 10: 创建远程仓库并推送**

```bash
gh repo create edc3000.github.io --public --source=. --remote=origin --push
```

- [ ] **Step 11: 开启 Pages 并验证部署**

```bash
gh api -X POST repos/edc3000/edc3000.github.io/pages \
  -f build_type=workflow 2>/dev/null || echo "Pages 可能已启用,继续"
gh run watch
```

部署完成后访问 https://edc3000.github.io ,预期看到「站点构建中」。若 404,检查仓库 Settings → Pages 的 Source 是否为 GitHub Actions。

---

### Task 2: 设计系统与基础布局

**交付物:** 带完整配色、亮暗双主题、页头页脚的站点骨架。首页套用后应呈现米色纸张风格,切换主题无闪烁。

**Files:**
- Create: `src/styles/global.css`
- Create: `src/components/BaseHead.astro`, `Header.astro`, `Footer.astro`, `ThemeToggle.astro`
- Create: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: Task 1 的 Astro 项目
- Produces: `BaseLayout.astro`,props 签名 `{ title: string; description: string; }`,含默认 slot。后续所有页面都套用它。

- [ ] **Step 1: 写设计 token 与全局样式**

创建 `src/styles/global.css`。配色值必须与 Global Constraints 逐字一致:

```css
:root {
  --paper: #f8f5ec;
  --paper-light: #fbfaf6;
  --ink: #292a26;
  --muted: #706b60;
  --line: #ded8ca;
  --green: #2c675b;
  --green-dark: #263d38;
  --gold: #b98a3d;
  --blue: #587c98;
  --brick: #c56050;
  --content-width: 780px;
}

:root[data-theme='dark'] {
  --paper: #1c1e1d;
  --paper-light: #242726;
  --ink: #e8e4d9;
  --muted: #9a948a;
  --line: #3a3d3b;
  --green: #6fae9f;
  --green-dark: #8fc4b6;
  --gold: #d4a95f;
  --blue: #8aa9c4;
  --brick: #d98878;
}

* { box-sizing: border-box; }

html {
  background: var(--paper);
  scroll-behavior: smooth;
  scroll-padding-top: 62px;
}

body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  line-height: 1.72;
}

.container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 20px;
}

a { color: var(--green); }

code:not(pre code) {
  padding: 0.08em 0.28em;
  border-radius: 4px;
  background: color-mix(in srgb, var(--green) 10%, transparent);
  overflow-wrap: anywhere;
}

pre {
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
}

th, td {
  border: 1px solid var(--line);
  padding: 8px 12px;
  text-align: left;
}

img { max-width: 100%; height: auto; }

:root[data-theme='dark'] .astro-code,
:root[data-theme='dark'] .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

- [ ] **Step 2: 写无闪烁主题切换**

创建 `src/components/ThemeToggle.astro`。内联脚本必须在 `<head>` 中同步执行,否则会出现亮色闪烁:

```astro
<button id="theme-toggle" aria-label="切换主题">🌓</button>

<script is:inline>
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = stored ?? (prefersDark ? 'dark' : 'light');
</script>

<script>
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>

<style>
  #theme-toggle {
    background: none;
    border: 1px solid var(--line);
    border-radius: 6px;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 14px;
  }
</style>
```

- [ ] **Step 3: 写 BaseHead**

创建 `src/components/BaseHead.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<link rel="alternate" type="application/rss+xml" title="edc3000" href="/rss.xml" />
```

- [ ] **Step 4: 写 Header 与 Footer**

创建 `src/components/Header.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.astro';
const nav = [
  { href: '/competitions/', label: '竞赛实录' },
  { href: '/papers/', label: '论文精读' },
  { href: '/algorithms/', label: '算法实践' },
  { href: '/skills/', label: 'Agent 技能' },
  { href: '/search/', label: '搜索' },
];
const path = Astro.url.pathname;
---
<header>
  <div class="container inner">
    <a href="/" class="brand">edc3000</a>
    <nav>
      {nav.map((item) => (
        <a href={item.href} class={path.startsWith(item.href) ? 'active' : ''}>{item.label}</a>
      ))}
    </nav>
    <ThemeToggle />
  </div>
</header>

<style>
  header { border-bottom: 1px solid var(--line); background: var(--paper-light); }
  .inner { display: flex; align-items: center; gap: 16px; padding-block: 12px; flex-wrap: wrap; }
  .brand { font-weight: 700; text-decoration: none; color: var(--ink); }
  nav { display: flex; gap: 14px; flex: 1; flex-wrap: wrap; }
  nav a { text-decoration: none; color: var(--muted); font-size: 15px; }
  nav a.active { color: var(--green); font-weight: 600; }
</style>
```

创建 `src/components/Footer.astro`:

```astro
---
const year = new Date().getFullYear();
---
<footer>
  <div class="container">
    <p>© {year} edc3000 · <a href="/rss.xml">RSS</a> · <a href="https://github.com/edc3000">GitHub</a></p>
  </div>
</footer>

<style>
  footer { border-top: 1px solid var(--line); margin-top: 64px; padding-block: 24px; color: var(--muted); font-size: 14px; }
  footer p { margin: 0; }
</style>
```

- [ ] **Step 5: 写 BaseLayout**

创建 `src/layouts/BaseLayout.astro`:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<html lang="zh-CN">
  <head>
    <BaseHead title={title} description={description} />
  </head>
  <body>
    <Header />
    <main class="container">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: 首页套用布局**

覆写 `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="edc3000" description="Kaggle 竞赛复盘、论文精读、算法实践与 AI Agent 技能包">
  <h1>edc3000</h1>
  <p>站点建设中。</p>
</BaseLayout>
```

- [ ] **Step 7: 构建并肉眼验证两种主题**

```bash
pnpm build && pnpm preview
```

打开 http://localhost:4321 ,验证三点:(a) 背景为米色 `#f8f5ec`;(b) 点击 🌓 切换到暗色且刷新后保持;(c) 暗色模式下刷新页面**没有亮色闪烁**。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: 设计系统与基础布局

提取自现有报告的配色 token,亮暗双主题无闪烁切换。
BaseLayout 供后续所有页面复用。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: 内容集合 schema 与格式化工具

**交付物:** 四个 collection 的 Zod schema,以及经单元测试覆盖的 Top% 计算函数。写错 frontmatter 时构建应当失败。

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`(添加 test 脚本)

**Interfaces:**
- Consumes: Task 1 的项目配置
- Produces:
  - 四个 collection:`competitions` / `papers` / `algorithms` / `skills`,通过 `getCollection('competitions')` 查询
  - `formatTopPercent(rank: number, total: number): string` —— 返回如 `"Top 2.89%"`
  - `formatDate(date: Date): string` —— 返回如 `"2026-08-10"`
  - `MEDAL_LABEL: Record<'gold'|'silver'|'bronze', string>` —— 奖牌中文名

- [ ] **Step 1: 配置 vitest**

创建 `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

在 `package.json` 的 `scripts` 中加入:

```json
"test": "vitest run"
```

- [ ] **Step 2: 写失败的测试**

创建 `src/lib/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formatTopPercent, formatDate, MEDAL_LABEL } from './format';

describe('formatTopPercent', () => {
  it('计算 rogii 银牌的百分比', () => {
    expect(formatTopPercent(177, 6125)).toBe('Top 2.89%');
  });

  it('计算 MAP 铜牌的百分比', () => {
    expect(formatTopPercent(94, 1857)).toBe('Top 5.06%');
  });

  it('计算 FB3 铜牌的百分比', () => {
    expect(formatTopPercent(282, 2655)).toBe('Top 10.62%');
  });

  it('第一名为 Top 0.01% 而非 Top 0%', () => {
    expect(formatTopPercent(1, 10000)).toBe('Top 0.01%');
  });

  it('总数为 0 时返回空串而不是 NaN', () => {
    expect(formatTopPercent(5, 0)).toBe('');
  });
});

describe('formatDate', () => {
  it('格式化为 YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-08-10T00:00:00Z'))).toBe('2026-08-10');
  });
});

describe('MEDAL_LABEL', () => {
  it('提供三种奖牌的中文名', () => {
    expect(MEDAL_LABEL.gold).toBe('金牌');
    expect(MEDAL_LABEL.silver).toBe('银牌');
    expect(MEDAL_LABEL.bronze).toBe('铜牌');
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

```bash
pnpm test
```

预期:FAIL,报错为无法解析 `./format` 模块。

- [ ] **Step 4: 实现 format.ts**

创建 `src/lib/format.ts`:

```ts
export const MEDAL_LABEL = {
  gold: '金牌',
  silver: '银牌',
  bronze: '铜牌',
} as const;

export function formatTopPercent(rank: number, total: number): string {
  if (total <= 0) return '';
  const pct = (rank / total) * 100;
  return `Top ${pct.toFixed(2)}%`;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
```

- [ ] **Step 5: 运行测试确认通过**

```bash
pnpm test
```

预期:PASS,7 个测试全绿。

- [ ] **Step 6: 写四个 collection 的 schema**

创建 `src/content.config.ts`。注意 `privateLB` 与 `rank` 相关字段的可选性——两篇铜牌报告只记录了公开榜数据:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const base = {
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
};

const competitions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/competitions' }),
  schema: z.object({
    ...base,
    platform: z.literal('kaggle'),
    medal: z.enum(['gold', 'silver', 'bronze']).nullable(),
    rank: z.number().int().positive(),
    totalTeams: z.number().int().positive(),
    rankNote: z.string().optional(),
    metric: z.string(),
    publicLB: z.number(),
    privateLB: z.number().optional(),
    competitionUrl: z.string().url(),
    richReport: z.string().optional(),
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/papers' }),
  schema: z.object({
    ...base,
    paperTitle: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    year: z.number().int(),
    arxivUrl: z.string().url().optional(),
    codeUrl: z.string().url().optional(),
    verdict: z.string(),
  }),
});

const algorithms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/algorithms' }),
  schema: z.object({
    ...base,
    language: z.string(),
    repoUrl: z.string().url().optional(),
    complexity: z.string().optional(),
  }),
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skills' }),
  schema: z.object({
    ...base,
    skillName: z.string(),
    installCommand: z.string(),
    repoUrl: z.string().url(),
    originalAuthor: z.string().optional(),
  }),
});

export const collections = { competitions, papers, algorithms, skills };
```

- [ ] **Step 7: 建立四个内容目录**

Astro 的 glob loader 在目录不存在时会报错,四个目录都需存在:

```bash
mkdir -p src/content/{competitions,papers,algorithms,skills}
touch src/content/{papers,algorithms,skills}/.gitkeep
```

- [ ] **Step 8: 验证 schema 会拦截错误 frontmatter**

写一个故意违规的临时文件:

```bash
cat > src/content/competitions/__schema-probe.md <<'EOF'
---
title: 探针
date: 2026-01-01
description: 用于验证 schema 校验生效
platform: kaggle
medal: platinum
rank: 1
totalTeams: 100
metric: RMSE
publicLB: 1.0
competitionUrl: https://example.com
---
正文
EOF
pnpm build
```

预期:构建**失败**,报错指向 `medal` 不是合法枚举值。若构建成功,说明 schema 未生效,必须排查后再继续。

- [ ] **Step 9: 删除探针并确认构建恢复**

```bash
rm src/content/competitions/__schema-probe.md
pnpm build
```

预期:构建成功。

- [ ] **Step 10: 提交**

```bash
git add -A
git commit -m "feat: 四板块 content collection schema 与格式化工具

竞赛 schema 中 privateLB 设为可选:两篇铜牌报告只记录了公开榜
分数,并注明 private 与 leaderboard 口径不同。新增 rankNote
字段记录名次口径。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: 竞赛板块与精排版双轨

**交付物:** 竞赛列表页与详情页,导入 3 篇竞赛报告,银牌文章可跳转到逐字节保留的精排版 HTML。这是站点上线时唯一有实质内容的板块。

**Files:**
- Create: `src/content/competitions/rogii-wellbore-geology.md`, `fb3-english-writing.md`, `map-math-misunderstandings.md`
- Create: `public/reports/rogii-wellbore-geology.html`
- Create: `src/components/MedalBadge.astro`, `RichReportLink.astro`, `PostCard.astro`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/pages/competitions/index.astro`, `src/pages/competitions/[...slug].astro`

**Interfaces:**
- Consumes: `BaseLayout`(Task 2);`formatTopPercent` / `formatDate` / `MEDAL_LABEL`(Task 3);`competitions` collection(Task 3)
- Produces:
  - `MedalBadge.astro`,props `{ medal: 'gold'|'silver'|'bronze'|null; rank: number; totalTeams: number; }`
  - `RichReportLink.astro`,props `{ href: string; }`
  - `PostCard.astro`,props `{ href: string; title: string; description: string; date: Date; tags: string[]; }`
  - `PostLayout.astro`,props `{ title: string; description: string; date: Date; tags: string[]; }`,含默认 slot 与名为 `meta` 的具名 slot

- [ ] **Step 1: 向用户确认两处推断值**

在写入 frontmatter 前,必须问用户这两个问题,不得自行填写:

1. FB3(Feedback Prize - English Language Learning)的评价指标是否为 `MCRMSE`?MAP(Charting Student Math Misunderstandings)是否为 `MAP@3`?
2. FB3 的 `282 / 2655` 与 MAP 的 `94 / 1857` 是公开榜名次。是否有对应的 private 榜名次?若无,`rankNote` 统一填「公开榜名次」。

拿到答复后再进行 Step 2。

- [ ] **Step 2: 复制精排版 HTML 到 public**

```bash
mkdir -p public/reports
cp "/Users/liangyan/my/kaggle/competitions/rogii-wellbore-geology-prediction/final_solution_report.html" \
   public/reports/rogii-wellbore-geology.html
shasum -a 256 \
  "/Users/liangyan/my/kaggle/competitions/rogii-wellbore-geology-prediction/final_solution_report.html" \
  public/reports/rogii-wellbore-geology.html
```

预期:两个 SHA256 完全相同。不一致则说明复制出错,必须重来。

- [ ] **Step 3: 导入银牌报告正文**

```bash
cp "/Users/liangyan/my/kaggle/competitions/rogii-wellbore-geology-prediction/final_solution_report.md" \
   src/content/competitions/rogii-wellbore-geology.md
```

在文件**开头**插入 frontmatter(以下数值取自报告正文,已核对):

```yaml
---
title: "ROGII 井眼地质预测:银牌方案完整解读"
date: 2026-08-10
description: "Kaggle ROGII Wellbore Geology Prediction 银牌方案复盘,私榜 177/6125。粒子滤波父模型加前缀门控修正,以及公私榜最优方案不一致的成因分析。"
tags: ["kaggle", "时序预测", "粒子滤波", "地质建模"]
platform: kaggle
medal: silver
rank: 177
totalTeams: 6125
rankNote: "私榜最终名次;公开榜为 101/6125"
metric: RMSE
publicLB: 6.100
privateLB: 8.074
competitionUrl: "https://www.kaggle.com/competitions/rogii-wellbore-geology-prediction"
richReport: "/reports/rogii-wellbore-geology.html"
---
```

同时删除正文中重复的一级标题(`# ROGII Wellbore Geology Prediction 最终方案报告`),因为 `PostLayout` 已渲染标题。

- [ ] **Step 4: 导入两篇铜牌报告**

```bash
cp "/Users/liangyan/my/kaggle/history_competition_reports/kaggle_fb3_english_writing_bronze_report.md" \
   src/content/competitions/fb3-english-writing.md
cp "/Users/liangyan/my/kaggle/history_competition_reports/kaggle_map_math_misunderstandings_bronze_report.md" \
   src/content/competitions/map-math-misunderstandings.md
```

`fb3-english-writing.md` 的 frontmatter(`metric` 与 `rankNote` 用 Step 1 的确认值):

```yaml
---
title: "FB3 英语写作评分:铜牌复盘"
date: 2026-06-09
description: "Kaggle Feedback Prize - English Language Learning 铜牌方案复盘,282/2655。六维度作文评分任务的建模思路与提交策略。"
tags: ["kaggle", "nlp", "回归", "教育"]
platform: kaggle
medal: bronze
rank: 282
totalTeams: 2655
rankNote: "公开榜名次"
metric: MCRMSE
publicLB: 0.437237
competitionUrl: "https://www.kaggle.com/competitions/feedback-prize-english-language-learning"
---
```

`map-math-misunderstandings.md` 的 frontmatter:

```yaml
---
title: "MAP 数学误解识别:铜牌复盘"
date: 2026-06-09
description: "Kaggle MAP - Charting Student Math Misunderstandings 铜牌方案复盘,94/1857。教育 NLP 分类排序任务的方案与 91 次提交的迭代过程。"
tags: ["kaggle", "nlp", "分类", "教育"]
platform: kaggle
medal: bronze
rank: 94
totalTeams: 1857
rankNote: "公开榜名次"
metric: "MAP@3"
publicLB: 0.94980
competitionUrl: "https://www.kaggle.com/competitions/map-charting-student-math-misunderstandings"
---
```

两个文件同样删除正文中重复的一级标题。

- [ ] **Step 5: 写 MedalBadge 组件**

创建 `src/components/MedalBadge.astro`:

```astro
---
import { formatTopPercent, MEDAL_LABEL } from '../lib/format';

interface Props {
  medal: 'gold' | 'silver' | 'bronze' | null;
  rank: number;
  totalTeams: number;
}
const { medal, rank, totalTeams } = Astro.props;
const pct = formatTopPercent(rank, totalTeams);
---
<span class:list={['badge', medal]}>
  {medal && <strong>{MEDAL_LABEL[medal]}</strong>}
  <span>{rank} / {totalTeams}</span>
  {pct && <span class="pct">{pct}</span>}
</span>

<style>
  .badge {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 14px;
    background: var(--paper-light);
  }
  .badge.gold strong { color: var(--gold); }
  .badge.silver strong { color: var(--blue); }
  .badge.bronze strong { color: var(--brick); }
  .pct { color: var(--muted); }
</style>
```

- [ ] **Step 6: 写 RichReportLink 组件**

创建 `src/components/RichReportLink.astro`:

```astro
---
interface Props {
  href: string;
}
const { href } = Astro.props;
---
<a class="rich-report" href={href}>📄 阅读精排版</a>

<style>
  .rich-report {
    display: inline-block;
    padding: 8px 16px;
    border: 1px solid var(--green);
    border-radius: 6px;
    color: var(--green);
    text-decoration: none;
    font-size: 15px;
  }
  .rich-report:hover { background: var(--green); color: var(--paper); }
</style>
```

- [ ] **Step 7: 写 PostCard 组件**

创建 `src/components/PostCard.astro`:

```astro
---
import { formatDate } from '../lib/format';

interface Props {
  href: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
}
const { href, title, description, date, tags } = Astro.props;
---
<article class="card">
  <a href={href}><h3>{title}</h3></a>
  <p class="desc">{description}</p>
  <p class="meta">
    <time datetime={date.toISOString()}>{formatDate(date)}</time>
    {tags.map((t) => <a class="tag" href={`/tags/${t}/`}>#{t}</a>)}
    <slot name="badge" />
  </p>
</article>

<style>
  .card { padding-block: 20px; border-bottom: 1px solid var(--line); }
  .card h3 { margin: 0 0 6px; color: var(--ink); }
  .card a { text-decoration: none; }
  .desc { margin: 0 0 8px; color: var(--muted); }
  .meta { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 14px; color: var(--muted); margin: 0; }
  .tag { color: var(--green); text-decoration: none; }
</style>
```

- [ ] **Step 8: 写 PostLayout**

创建 `src/layouts/PostLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import { formatDate } from '../lib/format';

interface Props {
  title: string;
  description: string;
  date: Date;
  tags: string[];
}
const { title, description, date, tags } = Astro.props;
---
<BaseLayout title={title} description={description}>
  <article data-pagefind-body>
    <h1>{title}</h1>
    <p class="meta">
      <time datetime={date.toISOString()}>{formatDate(date)}</time>
      {tags.map((t) => <a class="tag" href={`/tags/${t}/`}>#{t}</a>)}
    </p>
    <slot name="meta" />
    <div class="prose">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 14px; color: var(--muted); }
  .tag { color: var(--green); text-decoration: none; }
  .prose { margin-top: 32px; }
  .prose :global(h2) { margin-top: 40px; padding-bottom: 6px; border-bottom: 1px solid var(--line); }
  .prose :global(blockquote) {
    margin: 0; padding: 8px 16px;
    border-left: 3px solid var(--green);
    background: var(--paper-light); color: var(--muted);
  }
</style>
```

`data-pagefind-body` 是 Task 7 建立搜索索引的依据,必须保留。

- [ ] **Step 9: 写竞赛列表页**

创建 `src/pages/competitions/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import MedalBadge from '../../components/MedalBadge.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('competitions', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="竞赛实录 · edc3000" description="Kaggle 竞赛完整复盘:方案、迭代过程与失败记录。">
  <h1>竞赛实录</h1>
  <p>每篇都是完整复盘,包含最终方案、迭代路径,以及没能奏效的尝试。</p>
  {entries.map((entry) => (
    <PostCard
      href={`/competitions/${entry.id}/`}
      title={entry.data.title}
      description={entry.data.description}
      date={entry.data.date}
      tags={entry.data.tags}
    >
      <MedalBadge
        slot="badge"
        medal={entry.data.medal}
        rank={entry.data.rank}
        totalTeams={entry.data.totalTeams}
      />
    </PostCard>
  ))}
</BaseLayout>
```

- [ ] **Step 10: 写竞赛详情页**

创建 `src/pages/competitions/[...slug].astro`:

```astro
---
import PostLayout from '../../layouts/PostLayout.astro';
import MedalBadge from '../../components/MedalBadge.astro';
import RichReportLink from '../../components/RichReportLink.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('competitions', ({ data }) => !data.draft);
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<PostLayout title={d.title} description={d.description} date={d.date} tags={d.tags}>
  <div slot="meta" class="comp-meta">
    <MedalBadge medal={d.medal} rank={d.rank} totalTeams={d.totalTeams} />
    {d.rankNote && <p class="note">{d.rankNote}</p>}
    <dl>
      <div><dt>指标</dt><dd>{d.metric}</dd></div>
      <div><dt>公开榜</dt><dd>{d.publicLB}</dd></div>
      {d.privateLB !== undefined && <div><dt>私榜</dt><dd>{d.privateLB}</dd></div>}
    </dl>
    <p><a href={d.competitionUrl}>比赛主页 ↗</a></p>
    {d.richReport && <RichReportLink href={d.richReport} />}
  </div>
  <Content />
</PostLayout>

<style>
  .comp-meta {
    margin-top: 20px; padding: 20px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--paper-light);
  }
  .note { font-size: 14px; color: var(--muted); margin: 10px 0 0; }
  dl { display: flex; gap: 24px; flex-wrap: wrap; margin: 16px 0; }
  dt { font-size: 13px; color: var(--muted); }
  dd { margin: 0; font-weight: 600; }
</style>
```

- [ ] **Step 11: 构建并验证**

```bash
pnpm build
```

预期:构建成功。随后:

```bash
ls dist/competitions/
shasum -a 256 dist/reports/rogii-wellbore-geology.html \
  "/Users/liangyan/my/kaggle/competitions/rogii-wellbore-geology-prediction/final_solution_report.html"
```

预期:三个竞赛目录都存在;两个 SHA256 一致(证明典藏版逐字节保留)。

- [ ] **Step 12: 浏览器验证**

```bash
pnpm preview
```

检查 http://localhost:4321/competitions/ 列出 3 篇且徽章显示 `Top 2.89%` / `Top 5.06%` / `Top 10.62%`;进入银牌文章,点击「📄 阅读精排版」能打开原始报告;文中表格正常渲染(验证 Sätteri 的 GFM 支持)。

- [ ] **Step 13: 提交**

```bash
git add -A
git commit -m "feat: 竞赛板块与精排版双轨

导入 3 篇竞赛报告(1 银 2 铜)。精排版 HTML 逐字节保留在
public/reports/,正文版进 collection 供检索,详情页以按钮连接两者。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: 其余三板块与诚实空状态

**交付物:** 论文、算法实践、skills 三个板块的列表页与详情页。空板块展示具体写作路线图而非「敬请期待」。

**Files:**
- Create: `src/components/EmptySection.astro`
- Create: `src/pages/papers/index.astro`, `papers/[...slug].astro`
- Create: `src/pages/algorithms/index.astro`, `algorithms/[...slug].astro`
- Create: `src/pages/skills/index.astro`, `skills/[...slug].astro`

**Interfaces:**
- Consumes: `BaseLayout`、`PostCard`、`PostLayout`(Task 2/4);三个 collection(Task 3)
- Produces: `EmptySection.astro`,props `{ heading: string; reading: string[]; nextUp: string; }`

- [ ] **Step 1: 向用户索取路线图内容**

空状态要展示真实计划,不能编造。必须问用户:

1. 论文板块:你目前在读哪些论文?第一篇精读预计写哪篇?
2. 算法实践板块:第一篇预计写什么?(建议方向:`rogii-*/src/` 下的半马尔可夫解码、粒子滤波、GRU 路径模型或成本体建模)

若用户暂时不确定,使用兜底文案:「正在整理中,近期上线」——但**必须先问过**。

- [ ] **Step 2: 写 EmptySection 组件**

创建 `src/components/EmptySection.astro`:

```astro
---
interface Props {
  heading: string;
  reading: string[];
  nextUp: string;
}
const { heading, reading, nextUp } = Astro.props;
---
<div class="empty">
  <p class="tag">筹备中</p>
  <h2>{heading}</h2>
  {reading.length > 0 && (
    <>
      <p class="label">正在读 / 正在做</p>
      <ul>{reading.map((r) => <li>{r}</li>)}</ul>
    </>
  )}
  <p class="label">第一篇预计</p>
  <p class="next">{nextUp}</p>
</div>

<style>
  .empty {
    padding: 32px; margin-top: 24px;
    border: 1px dashed var(--line); border-radius: 8px;
    background: var(--paper-light);
  }
  .tag {
    display: inline-block; margin: 0 0 12px; padding: 3px 10px;
    border-radius: 999px; background: var(--gold); color: var(--paper);
    font-size: 13px;
  }
  .empty h2 { margin: 0 0 20px; border: none; }
  .label { margin: 20px 0 6px; font-size: 13px; color: var(--muted); }
  .next { margin: 0; font-weight: 600; }
  ul { margin: 0; padding-left: 20px; }
</style>
```

- [ ] **Step 3: 写论文列表页**

创建 `src/pages/papers/index.astro`。将 `reading` 与 `nextUp` 替换为 Step 1 拿到的真实内容:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import EmptySection from '../../components/EmptySection.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('papers', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="论文精读 · edc3000" description="LLM、强化学习与多模态方向的论文精读笔记。">
  <h1>论文精读</h1>
  {entries.length === 0 ? (
    <EmptySection
      heading="论文精读板块正在筹备"
      reading={['GRPO 系列', 'vLLM PagedAttention', '多模态对齐']}
      nextUp="待定 —— 见 Step 1 用户答复"
    />
  ) : (
    entries.map((entry) => (
      <PostCard
        href={`/papers/${entry.id}/`}
        title={entry.data.title}
        description={entry.data.description}
        date={entry.data.date}
        tags={entry.data.tags}
      />
    ))
  )}
</BaseLayout>
```

- [ ] **Step 4: 写论文详情页**

创建 `src/pages/papers/[...slug].astro`:

```astro
---
import PostLayout from '../../layouts/PostLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('papers', ({ data }) => !data.draft);
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<PostLayout title={d.title} description={d.description} date={d.date} tags={d.tags}>
  <div slot="meta" class="paper-meta">
    <p class="paper-title">{d.paperTitle}</p>
    <p class="authors">{d.authors.join(', ')} · {d.venue} {d.year}</p>
    <p class="verdict">{d.verdict}</p>
    <p class="links">
      {d.arxivUrl && <a href={d.arxivUrl}>arXiv ↗</a>}
      {d.codeUrl && <a href={d.codeUrl}>代码 ↗</a>}
    </p>
  </div>
  <Content />
</PostLayout>

<style>
  .paper-meta {
    margin-top: 20px; padding: 20px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--paper-light);
  }
  .paper-title { margin: 0; font-weight: 600; }
  .authors { margin: 6px 0 0; font-size: 14px; color: var(--muted); }
  .verdict {
    margin: 16px 0 0; padding-left: 12px;
    border-left: 3px solid var(--green); font-style: italic;
  }
  .links { display: flex; gap: 16px; margin: 16px 0 0; }
</style>
```

- [ ] **Step 5: 写算法实践列表页与详情页**

创建 `src/pages/algorithms/index.astro`(结构同 Step 3,替换 collection 名、标题与空状态文案):

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import EmptySection from '../../components/EmptySection.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('algorithms', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="算法实践 · edc3000" description="算法与工程实践:实现细节、性能取舍与踩坑记录。">
  <h1>算法实践</h1>
  {entries.length === 0 ? (
    <EmptySection
      heading="算法实践板块正在筹备"
      reading={['半马尔可夫解码', '粒子滤波状态估计', 'GRU 路径模型']}
      nextUp="待定 —— 见 Step 1 用户答复"
    />
  ) : (
    entries.map((entry) => (
      <PostCard
        href={`/algorithms/${entry.id}/`}
        title={entry.data.title}
        description={entry.data.description}
        date={entry.data.date}
        tags={entry.data.tags}
      />
    ))
  )}
</BaseLayout>
```

创建 `src/pages/algorithms/[...slug].astro`:

```astro
---
import PostLayout from '../../layouts/PostLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('algorithms', ({ data }) => !data.draft);
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<PostLayout title={d.title} description={d.description} date={d.date} tags={d.tags}>
  <div slot="meta" class="algo-meta">
    <dl>
      <div><dt>语言</dt><dd>{d.language}</dd></div>
      {d.complexity && <div><dt>复杂度</dt><dd>{d.complexity}</dd></div>}
    </dl>
    {d.repoUrl && <p><a href={d.repoUrl}>源码仓库 ↗</a></p>}
  </div>
  <Content />
</PostLayout>

<style>
  .algo-meta {
    margin-top: 20px; padding: 20px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--paper-light);
  }
  dl { display: flex; gap: 24px; flex-wrap: wrap; margin: 0; }
  dt { font-size: 13px; color: var(--muted); }
  dd { margin: 0; font-weight: 600; }
</style>
```

- [ ] **Step 6: 写 skills 列表页与详情页**

创建 `src/pages/skills/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import EmptySection from '../../components/EmptySection.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('skills', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="Agent 技能包 · edc3000" description="Claude Code / AI Agent 技能包的设计与实现。">
  <h1>Agent 技能包</h1>
  {entries.length === 0 ? (
    <EmptySection
      heading="技能包板块正在筹备"
      reading={[]}
      nextUp="待定 —— 见 Step 1 用户答复"
    />
  ) : (
    entries.map((entry) => (
      <PostCard
        href={`/skills/${entry.id}/`}
        title={entry.data.title}
        description={entry.data.description}
        date={entry.data.date}
        tags={entry.data.tags}
      />
    ))
  )}
</BaseLayout>
```

创建 `src/pages/skills/[...slug].astro`。注意 `originalAuthor` 存在时**必须**渲染署名:

```astro
---
import PostLayout from '../../layouts/PostLayout.astro';
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const entries = await getCollection('skills', ({ data }) => !data.draft);
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;
---
<PostLayout title={d.title} description={d.description} date={d.date} tags={d.tags}>
  <div slot="meta" class="skill-meta">
    <p class="name">{d.skillName}</p>
    {d.originalAuthor && (
      <p class="attribution">原作者:{d.originalAuthor}</p>
    )}
    <pre class="install"><code>{d.installCommand}</code></pre>
    <p><a href={d.repoUrl}>仓库 ↗</a></p>
  </div>
  <Content />
</PostLayout>

<style>
  .skill-meta {
    margin-top: 20px; padding: 20px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--paper-light);
  }
  .name { margin: 0; font-weight: 600; }
  .attribution {
    margin: 8px 0 0; padding: 6px 10px;
    border-left: 3px solid var(--gold);
    font-size: 14px; color: var(--muted);
  }
  .install { margin: 16px 0; }
</style>
```

- [ ] **Step 7: 构建验证**

```bash
pnpm build && pnpm preview
```

检查三个板块页均可访问,且论文/算法实践/skills 显示筹备中卡片(而非空白页)。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat: 论文、算法实践、skills 三板块页面

空板块渲染写作路线图而非占位文案。skills 详情页在
originalAuthor 存在时强制渲染署名。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: 标签聚合与 RSS

**交付物:** 跨四个 collection 的标签聚合页,以及包含全部非草稿文章的 RSS。

**Files:**
- Create: `src/lib/collections.ts`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/rss.xml.ts`

**Interfaces:**
- Consumes: 四个 collection(Task 3);`PostCard`(Task 4)
- Produces: `getAllPosts(): Promise<UnifiedPost[]>`,其中
  `UnifiedPost = { id: string; href: string; title: string; description: string; date: Date; tags: string[]; section: 'competitions'|'papers'|'algorithms'|'skills' }`

- [ ] **Step 1: 写跨集合聚合函数**

创建 `src/lib/collections.ts`:

```ts
import { getCollection } from 'astro:content';

export type Section = 'competitions' | 'papers' | 'algorithms' | 'skills';

export interface UnifiedPost {
  id: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  section: Section;
}

const SECTIONS: Section[] = ['competitions', 'papers', 'algorithms', 'skills'];

export const SECTION_LABEL: Record<Section, string> = {
  competitions: '竞赛实录',
  papers: '论文精读',
  algorithms: '算法实践',
  skills: 'Agent 技能',
};

export async function getAllPosts(): Promise<UnifiedPost[]> {
  const groups = await Promise.all(
    SECTIONS.map(async (section) => {
      const entries = await getCollection(section, ({ data }) => !data.draft);
      return entries.map((entry) => ({
        id: entry.id,
        href: `/${section}/${entry.id}/`,
        title: entry.data.title,
        description: entry.data.description,
        date: entry.data.date,
        tags: entry.data.tags,
        section,
      }));
    })
  );
  return groups.flat().sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export async function countBySection(): Promise<Record<Section, number>> {
  const posts = await getAllPosts();
  const counts = { competitions: 0, papers: 0, algorithms: 0, skills: 0 };
  for (const p of posts) counts[p.section] += 1;
  return counts;
}
```

- [ ] **Step 2: 写标签页**

创建 `src/pages/tags/[tag].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';
import { getAllPosts } from '../../lib/collections';

export async function getStaticPaths() {
  const posts = await getAllPosts();
  const tags = [...new Set(posts.flatMap((p) => p.tags))];
  return tags.map((tag) => ({
    params: { tag },
    props: { tag, posts: posts.filter((p) => p.tags.includes(tag)) },
  }));
}

const { tag, posts } = Astro.props;
---
<BaseLayout title={`#${tag} · edc3000`} description={`标签 ${tag} 下的全部文章`}>
  <h1>#{tag}</h1>
  <p>{posts.length} 篇</p>
  {posts.map((p) => (
    <PostCard href={p.href} title={p.title} description={p.description} date={p.date} tags={p.tags} />
  ))}
</BaseLayout>
```

- [ ] **Step 3: 写 RSS**

创建 `src/pages/rss.xml.ts`:

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '../lib/collections';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  return rss({
    title: 'edc3000',
    description: 'Kaggle 竞赛复盘、论文精读、算法实践与 AI Agent 技能包',
    site: context.site!,
    items: posts.map((p) => ({
      title: p.title,
      description: p.description,
      pubDate: p.date,
      link: p.href,
      categories: p.tags,
    })),
    customData: '<language>zh-CN</language>',
  });
}
```

- [ ] **Step 4: 构建并验证 RSS 合法性**

```bash
pnpm build
cat dist/rss.xml | head -30
grep -c '<item>' dist/rss.xml
```

预期:输出合法 XML,`<item>` 数量等于当前非草稿文章总数(此时为 3)。

- [ ] **Step 5: 验证标签页生成**

```bash
ls dist/tags/
```

预期:出现 `kaggle`、`nlp`、`教育` 等目录,与 Task 4 导入的 tags 对应。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: 跨板块标签聚合与 RSS 订阅

getAllPosts 统一四个 collection 的字段形态,标签页与 RSS 共用。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: 中文全文搜索

**交付物:** `/search/` 页面,搜索中文技术词能命中正确文章。

**Files:**
- Create: `src/pages/search.astro`
- Modify: `astro.config.mjs`(确认 pagefind 集成已注册)

**Interfaces:**
- Consumes: `BaseLayout`(Task 2);`PostLayout` 中的 `data-pagefind-body` 标记(Task 4)
- Produces: `/search/` 路由

- [ ] **Step 1: 写搜索页**

创建 `src/pages/search.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Search from 'astro-pagefind/components/Search';
---
<BaseLayout title="搜索 · edc3000" description="全站全文搜索">
  <h1>搜索</h1>
  <Search id="search" className="pagefind-ui" uiOptions={{ showImages: false }} />
</BaseLayout>

<style is:global>
  .pagefind-ui {
    --pagefind-ui-primary: var(--green);
    --pagefind-ui-text: var(--ink);
    --pagefind-ui-background: var(--paper);
    --pagefind-ui-border: var(--line);
    --pagefind-ui-tag: var(--paper-light);
  }
</style>
```

- [ ] **Step 2: 构建(Pagefind 在构建后建索引)**

```bash
pnpm build
ls dist/pagefind/
```

预期:出现 `pagefind.js` 与 `fragment/`、`index/` 等目录。若 `dist/pagefind/` 不存在,说明集成未生效,检查 `astro.config.mjs` 的 integrations 数组。

- [ ] **Step 3: 验证中文检索实际命中**

搜索必须在 `preview` 下测试,`dev` 模式没有索引:

```bash
pnpm preview
```

打开 http://localhost:4321/search/ ,依次搜索:

| 关键词 | 预期命中 |
|--------|----------|
| `粒子滤波` | ROGII 银牌文章 |
| `作文` 或 `写作` | FB3 铜牌文章 |
| `数学` | MAP 铜牌文章 |

三个都命中才算通过。若中文完全搜不到,检查 `PostLayout.astro` 的 `data-pagefind-body` 是否还在。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: Pagefind 中文全文搜索

依赖 PostLayout 的 data-pagefind-body 标记建索引,
配色变量对齐站点 token。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: 首页与关于页

**交付物:** 展示四板块入口(含真实篇数)与最新文章的首页,以及关于页。

**Files:**
- Create: `src/components/SectionCard.astro`
- Create: `src/pages/about.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getAllPosts` / `countBySection` / `SECTION_LABEL`(Task 6);`PostCard`(Task 4)
- Produces: `SectionCard.astro`,props `{ href: string; label: string; count: number; blurb: string; }`

- [ ] **Step 1: 写 SectionCard**

创建 `src/components/SectionCard.astro`。`count` 为 0 时显示「筹备中」而非「0 篇」:

```astro
---
interface Props {
  href: string;
  label: string;
  count: number;
  blurb: string;
}
const { href, label, count, blurb } = Astro.props;
---
<a class="section-card" href={href}>
  <h3>{label}</h3>
  <p class="blurb">{blurb}</p>
  <p class="count">{count > 0 ? `${count} 篇` : '筹备中'}</p>
</a>

<style>
  .section-card {
    display: block; padding: 20px;
    border: 1px solid var(--line); border-radius: 8px;
    background: var(--paper-light); text-decoration: none; color: var(--ink);
  }
  .section-card:hover { border-color: var(--green); }
  .section-card h3 { margin: 0 0 8px; }
  .blurb { margin: 0; font-size: 14px; color: var(--muted); }
  .count { margin: 12px 0 0; font-size: 13px; color: var(--green); font-weight: 600; }
</style>
```

- [ ] **Step 2: 写首页**

覆写 `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionCard from '../components/SectionCard.astro';
import PostCard from '../components/PostCard.astro';
import { getAllPosts, countBySection, SECTION_LABEL } from '../lib/collections';

const posts = await getAllPosts();
const counts = await countBySection();
const latest = posts.slice(0, 5);

const blurbs = {
  competitions: 'Kaggle 完整复盘,含没能奏效的尝试',
  papers: 'LLM、强化学习与多模态方向的精读笔记',
  algorithms: '实现细节、性能取舍与踩坑记录',
  skills: 'Claude Code / AI Agent 技能包',
} as const;

const sections = (['competitions', 'papers', 'algorithms', 'skills'] as const);
---
<BaseLayout title="edc3000" description="Kaggle 竞赛复盘、论文精读、算法实践与 AI Agent 技能包">
  <section class="hero">
    <h1>edc3000</h1>
    <p>算法工程师。这里记录 Kaggle 竞赛的完整复盘、论文精读、算法实现与 AI Agent 技能包。</p>
    <p class="sub">所有竞赛复盘都包含失败的尝试,不只是最终方案。</p>
  </section>

  <section class="grid">
    {sections.map((s) => (
      <SectionCard href={`/${s}/`} label={SECTION_LABEL[s]} count={counts[s]} blurb={blurbs[s]} />
    ))}
  </section>

  <section>
    <h2>最新</h2>
    {latest.map((p) => (
      <PostCard href={p.href} title={p.title} description={p.description} date={p.date} tags={p.tags} />
    ))}
  </section>
</BaseLayout>

<style>
  .hero { padding-block: 40px 24px; }
  .hero h1 { margin: 0 0 12px; }
  .hero p { margin: 0 0 8px; color: var(--muted); }
  .sub { font-size: 14px; }
  .grid {
    display: grid; gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-block: 32px;
  }
</style>
```

- [ ] **Step 3: 写关于页**

创建 `src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="关于 · edc3000" description="关于这个站点与作者">
  <h1>关于</h1>
  <p>算法工程师,关注 LLM 后训练、强化学习、多模态与推理基础设施。</p>
  <h2>这个站点</h2>
  <p>四个板块:竞赛实录记录 Kaggle 的完整复盘;论文精读是读后的结构化笔记;算法实践写实现细节与取舍;Agent 技能包是 Claude Code 相关的工具建设。</p>
  <p>竞赛复盘会写进失败的尝试与判断失误,因为只写成功路径的复盘对读者没有价值。</p>
  <h2>联系</h2>
  <p><a href="https://github.com/edc3000">GitHub</a> · <a href="https://www.kaggle.com/liangyan0322">Kaggle</a> · <a href="/rss.xml">RSS</a></p>
</BaseLayout>
```

- [ ] **Step 4: 构建并验证篇数正确**

```bash
pnpm build && pnpm preview
```

打开首页,验证:竞赛卡片显示「3 篇」,其余三个显示「筹备中」;最新区块列出 3 篇。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: 首页与关于页

板块卡片显示真实篇数,0 篇显示筹备中而非 0。

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: 上线前完整验证

**交付物:** 通过 spec §10 全部验证项的线上站点。

**Files:**
- Modify: 视验证结果修复的任意文件

**Interfaces:**
- Consumes: Task 1–8 的全部产出
- Produces: 可公开分享的站点

- [ ] **Step 1: 类型与构建检查**

```bash
pnpm astro check
pnpm build
pnpm test
```

预期:三条命令均零错误。`astro check` 若报 content collection 类型缺失,先跑 `pnpm astro sync`。

- [ ] **Step 2: 死链检查**

```bash
grep -rhoE 'href="/[^"]*"' dist --include=*.html \
  | sed 's/href="//; s/"//' | sort -u > /tmp/links.txt
while read -r l; do
  case "$l" in
    *.xml|*.js|*.css|*.html) f="dist$l" ;;
    */) f="dist${l}index.html" ;;
    *) f="dist$l/index.html" ;;
  esac
  [ -e "$f" ] || echo "死链: $l"
done < /tmp/links.txt
```

预期:无输出。有输出则逐条修复。

- [ ] **Step 3: 移动端验证**

```bash
pnpm preview
```

浏览器切到 375px 宽度,检查首页、竞赛列表、银牌文章三个页面:页面本身**不出现横向滚动**;文章内的宽表格在自己的容器内横向滚动(`global.css` 已给 `table` 设 `overflow-x: auto`)。

- [ ] **Step 4: 暗色模式验证**

切到暗色,检查同样三个页面:无不可读文本(深色底深色字);代码块配色正确切换到 `github-dark`;徽章与卡片边框可见。

- [ ] **Step 5: 中英混排空白检查**

Astro 7 的 `compressHTML: 'jsx'` 会移除内联元素间空白。检查文章正文中形如 `使用 <code>pnpm</code> 安装` 的位置是否粘连成 `使用pnpm安装`。若粘连,在 `astro.config.mjs` 中加 `compressHTML: true` 后重新构建验证。

- [ ] **Step 6: 精排版典藏版最终校验**

```bash
shasum -a 256 dist/reports/rogii-wellbore-geology.html \
  "/Users/liangyan/my/kaggle/competitions/rogii-wellbore-geology-prediction/final_solution_report.html"
```

预期:两个哈希一致。

- [ ] **Step 7: 推送并验证线上**

```bash
git add -A
git commit -m "chore: 上线前验证修复

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push
gh run watch
```

部署完成后逐项检查线上站点:

| 检查 | URL |
|------|-----|
| 首页篇数 | https://edc3000.github.io/ |
| 竞赛列表 | https://edc3000.github.io/competitions/ |
| 银牌文章 | https://edc3000.github.io/competitions/rogii-wellbore-geology/ |
| 精排版典藏版 | https://edc3000.github.io/reports/rogii-wellbore-geology.html |
| 中文搜索 | https://edc3000.github.io/search/ 搜「粒子滤波」 |
| RSS | https://edc3000.github.io/rss.xml |
| 空板块 | https://edc3000.github.io/papers/ |

- [ ] **Step 8: 向用户汇报**

汇报实际验证结果,包括未通过项。不得在未实际访问线上 URL 的情况下声称站点可用。
