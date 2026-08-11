# edc3000.github.io — 个人技术博客设计文档

- **日期**:2026-08-11
- **状态**:已批准,待实现
- **站点地址**:https://edc3000.github.io

## 1. 目标与定位

面向**中文技术社区的同行开发者**的开源技术博客。内容以深度长文为主,覆盖 Kaggle
竞赛复盘、论文精读、算法实践、AI Agent 技能包四个方向。

**不是**求职作品集,**不是**私人知识库。首页不做项目墙,而是服务于"同行订阅、检索、
引用"这三种行为。因此 RSS、全文搜索、标签体系是一等公民。

**语言**:中文为主。现有 3 篇竞赛报告均为中文,零翻译成本。

## 2. 现有内容盘点(截至 2026-08-11)

| 板块 | 存货 | 来源 |
|------|------|------|
| 竞赛 | 6 篇 | rogii 银牌报告(HTML+MD)、FB3 铜牌、MAP 铜牌、rogii 工作流复盘、`kaggle_medal_workflow.md`、`kaggle_competition_search.md` |
| skills | 约 2 篇 | `feng-ge-perspective`(原创)、`kami`(疑似原创) |
| 论文 | 0 篇 | 无现成笔记。`research/` 下 117 项是竞赛内公开方案研究,不是论文精读 |
| 算法实践 | 0 篇 | 无现成文章,但 `rogii-*/src/` 下 22 个模块(半马尔可夫、粒子滤波、GRU 路径模型、成本体)是第一篇的原料 |

**已知风险**:`~/.claude/skills/` 下绝大多数 skill 来自 superpowers 与官方插件,
vault 内 8 个来自 kepano/obsidian-skills。**只有原创 skill 可进 skills 板块**,
转述他人作品必须署名(见 §5 的 schema 约束)。

**已知取舍**:四板块并列上线时,论文与算法实践为空。已向用户提示"空栏目对同行社区
是减分项",用户明确选择四板块全开。据此在 §7 设计诚实的空状态方案。

## 3. 技术选型

**Astro + 自定义主题**。

选它的两个决定性理由:

1. **Content Collections 支持每板块独立 schema 且构建时校验**。四个板块的元数据
   结构差异极大(竞赛要奖牌/名次/LB 分数,论文要 arXiv 链接/会议,skills 要安装
   命令/仓库)。Zod schema 让 frontmatter 写错在构建时失败,而非上线后才发现。
2. **能保住已有的精排版 HTML**(见 §6)。

已否决的方案:

- **Hugo + 现成主题**:上线最快,但板块差异化 schema 难做,Go template 定制成本高,
  且现成主题会覆盖用户已有的视觉标识(见 §8)。
- **Quartz**:面向 Obsidian 双链与图谱。用户内容不在 vault 内,博客也不需要双链。
  强行套用会别扭。

具体 Astro 大版本与 Content Layer API 形态以安装时的稳定版为准。

## 4. 仓库与部署

| 项 | 值 |
|---|---|
| 仓库 | `edc3000/edc3000.github.io`(公开,用户主站点仓库) |
| 本地路径 | `/Users/liangyan/my/edc3000.github.io` |
| 源码分支 | `main` |
| 构建部署 | GitHub Actions(`withastro/action`)→ GitHub Pages |
| Astro 配置 | `site: 'https://edc3000.github.io'`,`base: '/'` |

**内容不做自动同步。** 用户的 `my/kaggle/` 与 obsidian vault 内混有私密内容(实验
数据、简历、work/perf 笔记),任何自动化管道都构成泄露风险。内容一律手动挑选、
手动导入。这是刻意的安全约束,不是待优化项。

## 5. 信息架构与 Content Collections

### URL 结构

```
/                       首页:精选 + 最新 + 四板块入口
/competitions/          竞赛实录
/competitions/[slug]/
/papers/                论文精读
/papers/[slug]/
/algorithms/            算法实践
/algorithms/[slug]/
/skills/                Agent 技能包
/skills/[slug]/
/tags/[tag]/            标签聚合
/about/                 关于
/search/                Pagefind 全文搜索
/rss.xml                RSS 订阅
```

### Schema 定义

四个 collection 共享 `title` / `date` / `description` / `tags` / `draft`,各自扩展:

```ts
competitions: {
  platform: 'kaggle',
  medal: 'gold' | 'silver' | 'bronze' | null,
  rank: number,
  totalTeams: number,        // 与 rank 一起在渲染时计算 Top x%
  rankNote?: string,         // 名次口径说明,例:'公开榜名次'
  metric: string,            // 例:'RMSE'
  publicLB: number,
  privateLB?: number,        // 可选,原因见下
  competitionUrl: string,
  richReport?: string,       // 精排版 HTML 的 public 路径,见 §6
}

papers: {
  paperTitle: string,
  authors: string[],
  venue: string,
  year: number,
  arxivUrl?: string,
  codeUrl?: string,
  verdict: string,           // 作者本人的一句话评价,论文页的核心价值
}

algorithms: {
  repoUrl?: string,
  language: string,
  complexity?: string,
}

skills: {
  skillName: string,
  installCommand: string,
  repoUrl: string,
  originalAuthor?: string,   // 非原创时必填
}
```

`competitions.privateLB` 为**可选**(2026-08-11 修正,原定必填):核对源报告后发现,
两篇铜牌报告只记录了公开榜分数,并明确注明「提交历史中的 public/private score 与
leaderboard 展示口径不同」。强制必填会迫使实现者编造数据。同理增设 `rankNote`
记录名次口径——rogii 报告区分了公开榜(101)与私榜(177)名次,另两篇只有公开榜名次。

`skills.originalAuthor` 是针对 §2 已知风险的**结构性约束**:转述他人 skill 时,
schema 强制填写署名,不依赖作者自觉。

## 6. 精排版 HTML 双轨方案

`final_solution_report.html`(48K,零外部依赖,自带完整配色与排版)是已完成的成品。
静态站点生成器默认会用主题重新渲染 Markdown,导致这份排版作废。反之若只挂 HTML,
则该文进不了搜索索引、进不了 RSS、挂不上标签。

**双轨解决:**

```
final_solution_report.md   → src/content/competitions/rogii-wellbore-geology.md
                             正文版:进 Pagefind 索引、进 RSS、挂标签、响应式布局

final_solution_report.html → public/reports/rogii-wellbore-geology.html
                             典藏版:原样保留,不改一个字节
```

文章页顶部渲染「📄 阅读精排版」按钮,链接到典藏版。条件是 frontmatter 的
`richReport` 字段存在;不存在则不渲染该按钮。

此方案对后续文章同样适用:任何精排版产出都可挂 `richReport`。

## 7. 空板块处理

论文与算法实践上线时为 0 篇。空状态页**不使用"敬请期待"一类无信息量文案**,改为
展示具体写作路线图:

```
论文精读 · 筹备中
正在读:GRPO 系列、vLLM PagedAttention、多模态对齐
第一篇预计:<具体标题>
```

路线图内容由用户在实现阶段提供具体条目。首页板块卡片显示真实篇数,0 篇标注「筹备中」。

理由:对同行社区而言,诚实的路线图本身有信息量,优于伪装成有内容的空栏目。

## 8. 视觉系统

直接沿用用户现有 HTML 报告与简历中已建立的视觉标识(kami 风格),不引入陌生主题:

```css
--paper:  #f8f5ec    --ink:   #292a26    --green: #2c675b
--gold:   #b98a3d    --blue:  #587c98    --brick: #c56050
--line:   #ded8ca    --muted: #706b60
```

正文宽度 780px,与现有报告一致。

**暗色模式必须实现**——目标受众深夜阅读是常态。暗色方案采用同色相降明度反转,保持
品牌识别度,不切换到无关配色。

## 9. 搜索与订阅

- **搜索:Pagefind**。构建后扫描产出的静态 HTML 建立索引,**CJK 分词开箱可用**。
  明确排除 Lunr.js——其中文分词能力不足以支撑中文站点。
- **RSS:`@astrojs/rss`**。聚合四个 collection,按 `date` 倒序,`draft: true` 的
  条目排除。

## 10. 验证标准

| 检查项 | 手段 | 通过标准 |
|--------|------|----------|
| frontmatter 合规 | `astro check` | 零错误 |
| 构建 | `astro build` | 成功且无警告 |
| 死链 | 构建后扫描内部链接 | 零死链 |
| 移动端 | 375px 视口实际渲染 | 无横向滚动,表格可独立横滚 |
| 暗色模式 | 两种主题各截图核对 | 对比度达标,无不可读文本 |
| 中文搜索 | 实际检索「粒子滤波」「半马尔可夫」 | 命中对应文章 |
| 典藏版链接 | 访问 `/reports/rogii-wellbore-geology.html` | 与源文件逐字节一致 |
| RSS | 校验 `/rss.xml` | 格式合法,条目数与非草稿文章数一致 |

## 11. 范围外

以下明确不在本次实现范围:

- 评论系统(giscus / utterances)
- 站点分析(统计脚本)
- 自定义域名
- 英文版 / i18n
- 内容自动同步管道(见 §4,刻意排除)

以上均可在站点上线且内容稳定后另行评估。
