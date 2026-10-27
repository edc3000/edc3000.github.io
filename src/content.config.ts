import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const base = {
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // 精排版 HTML 的 public 路径。各板块通用:填了它,列表/首页/标签/RSS
  // 的链接就直接指向该 HTML。未声明在此处的板块会被 Zod 静默 strip 掉该字段。
  richReport: z.string().optional(),
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

// 分类由所在文件夹决定(见 src/lib/knowledge-base.ts),不写进 frontmatter
const interview = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/interview' }),
  schema: z.object({
    ...base,
    order: z.number().default(100),
    // 侧栏里分类下的小标题,不成页、不进 URL
    group: z.string().optional(),
    // 正文是自包含 HTML 时填它的 public 路径,条目页在侧栏布局里嵌入显示;
    // 与 richReport 不同,链接仍指向带侧栏的条目页
    embed: z.string().optional(),
  }),
});

export const collections = { competitions, papers, algorithms, skills, interview };
