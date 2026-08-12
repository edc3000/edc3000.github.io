# edc3000.github.io

个人技术博客源码。站点:https://edc3000.github.io

## 部署

推送到 `main` 即自动部署,约 1–2 分钟生效:

```bash
git add .
git commit -m "新增:xxx"
git push
```

无需本地构建,无需 `gh-pages` 分支。frontmatter 不合规时构建会失败,
线上保持上一个可用版本不受影响。

## 新增文章

在对应目录新建 `.md` 文件即可,无需在任何索引中登记:

| 板块 | 目录 |
|------|------|
| 竞赛实录 | `src/content/competitions/` |
| 论文精读 | `src/content/papers/` |
| 算法实践 | `src/content/algorithms/` |
| Agent 技能包 | `src/content/skills/` |

新增后自动出现在:板块列表页、首页「最新」、RSS、标签页、全文搜索。

正文是 HTML 而非 Markdown 时,见下方[用 HTML 发布内容](#用-html-发布内容)。

### 各板块 frontmatter

竞赛(`privateLB` / `rankNote` / `richReport` 可选):

```yaml
---
title: "标题"
date: 2026-08-10
description: "约 150 字的摘要,用于列表页与 RSS"
tags: ["kaggle", "nlp"]
platform: kaggle
medal: silver        # gold | silver | bronze | null
rank: 177
totalTeams: 6125
rankNote: "私榜最终名次"
metric: RMSE
publicLB: 6.100
privateLB: 8.074
competitionUrl: "https://www.kaggle.com/competitions/xxx"
richReport: "/reports/competitions/xxx.html"
---
```

论文(`arxivUrl` / `codeUrl` 可选):

```yaml
---
title: "标题"
date: 2026-08-10
description: "摘要"
tags: ["llm"]
paperTitle: "论文原标题"
authors: ["作者甲", "作者乙"]
venue: "NeurIPS"
year: 2025
arxivUrl: "https://arxiv.org/abs/xxxx.xxxxx"
codeUrl: "https://github.com/xxx"
verdict: "一句话评价,会以引文样式展示"
---
```

算法实践(`repoUrl` / `complexity` 可选):

```yaml
---
title: "标题"
date: 2026-08-10
description: "摘要"
tags: ["算法"]
language: Python
repoUrl: "https://github.com/xxx"
complexity: "O(n log n)"
---
```

Agent 技能包(`originalAuthor` 可选,但转述他人作品时应当填写——schema 不强制,遗漏不会导致构建失败):

```yaml
---
title: "标题"
date: 2026-08-10
description: "摘要"
tags: ["claude-code"]
skillName: "skill-name"
installCommand: "npx xxx"
repoUrl: "https://github.com/xxx"
originalAuthor: "原作者名"
---
```

## 下线或删除文章

- **临时下线**:frontmatter 加 `draft: true` 后推送。文件保留,站点不再显示,可随时恢复。
- **彻底删除**:`git rm` 该文件后推送。

## 用 HTML 发布内容

正文写成 HTML(而非 Markdown)时,走「HTML 是正文 + Markdown 是档案卡」这套流程。

### 目录

HTML 放在对应板块下,与 Astro 生成的路由分开,避免排查问题时混淆谁生成的:

```
public/reports/competitions/    竞赛方案
public/reports/papers/          论文精读
public/reports/algorithms/      算法实践
public/reports/skills/          技能包
```

目录用时再建,不预先占位——`public/` 下的一切都会原样发布,空目录里的占位文件
也会上线:

```bash
mkdir -p public/reports/papers
cp ~/somewhere/我的论文笔记.html public/reports/papers/attention-is-all-you-need.html
```

`public/` 原样复制进 `dist/`,不经 Astro 处理,所以 `public/reports/competitions/x.html`
的线上地址就是 `/reports/competitions/x.html`,没有 `public` 这一层。

### 两步

**1. HTML 的 `<body>` 必须带 `data-pagefind-body`**,否则搜不到:

```html
<body data-pagefind-body>
```

Pagefind 的规则是:**站点上只要有任一页面带该标记,不带的页面一律不索引**。
本站文章页(`PostLayout.astro`)带了这个标记,所以 `public/` 下不带标记的 HTML
会被静默跳过——构建不报错,只是永远搜不到。用 AI 生成 HTML 时把这个属性写进要求里。

**2. 配一个档案卡 `.md`**,放进 `src/content/<板块>/`,只写 frontmatter,不写正文:

```yaml
---
title: "标题"
date: 2026-08-10
description: "一句话摘要,显示在列表页与 RSS"
tags: ["kaggle"]
platform: kaggle
medal: silver
rank: 177
totalTeams: 6125
metric: RMSE
publicLB: 6.100
competitionUrl: "https://www.kaggle.com/competitions/xxx"
richReport: "/reports/competitions/xxx.html"
---
```

档案卡是**网站知道这篇文章存在的唯一途径**。有了它,列表页、首页「最新」、
标签页、RSS 全部自动更新,永远不用手改列表页。`richReport` 一填,点击标题
就直接打开 HTML,不走 Markdown 详情页。

### 一条不能违反的规则:正文只能有一份

同一篇内容,**要么 Markdown 有正文、要么 HTML 带索引标记,不能都占**——
否则搜索会对同一篇返回两条命中。

| 模式 | Markdown | HTML | 适用 |
|------|----------|------|------|
| **档案卡**(HTML 发布默认走这个) | 只有 frontmatter | 带 `data-pagefind-body` | 正文是 HTML |
| **双轨** | 完整正文 | **不带**标记 | 同一内容两种格式都要保留,且 HTML 不可改动 |
| 纯 Markdown | 完整正文 | 无 | 直接写 Markdown |

现存的 `rogii-wellbore-geology` 走的是**双轨**:那份 HTML 需保持与原始产出逐字节
一致(`shasum -a 256` 可校验),不加标记,搜索命中的是 Markdown 详情页,
该页顶部有「📄 阅读精排版」按钮跳转过去。

### 不需要被发现的临时页面

直接放 `public/` 下任意位置,不建档案卡,手动贴链接访问即可。

## 本地开发

```bash
pnpm install
pnpm dev        # 开发服务器
pnpm build      # 构建
pnpm preview    # 预览构建产物(搜索功能只在此模式下可用)
pnpm test       # 单元测试
pnpm astro check  # 类型与 schema 校验
```

注意:全文搜索索引在构建后生成,`pnpm dev` 下搜索页为空属正常,
须用 `pnpm preview` 验证。

## 设计与实现文档

- 设计:`docs/superpowers/specs/2026-08-11-github-io-blog-design.md`
- 实现计划:`docs/superpowers/plans/2026-08-11-github-io-blog.md`
