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
richReport: "/reports/xxx.html"
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

## 已有 HTML 页面怎么办

`public/` 下的文件原样复制,不经 Astro 处理。列表页、RSS、标签页只读
`src/content/` 下的 Markdown,搜索则依赖文章页上的 `data-pagefind-body`
标记。Pagefind 的规则是:**站点上只要有任一页面带该标记,不带的页面一律不索引**。

因此直接放进 `public/` 的 HTML 不会进列表、不进 RSS、没有标签、搜不到,
只能靠手动贴链接访问。三种处理方式:

| 场景 | 做法 |
|------|------|
| HTML 由 Markdown 生成(两者都有) | Markdown 放 `src/content/`,HTML 放 `public/reports/`,frontmatter 填 `richReport` 指向它。功能完整,含全文搜索 |
| 只有 HTML | 写一个仅含 frontmatter 与摘要的 `.md`,`richReport` 指向 HTML。可进列表/RSS/标签,搜索只覆盖摘要 |
| 临时页面,不需要被发现 | 直接放 `public/`,手动贴链接 |

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
