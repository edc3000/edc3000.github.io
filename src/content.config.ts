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
