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
  skills: 'Agent 技能包',
};

export const SECTION_BLURB: Record<Section, string> = {
  competitions: 'Kaggle 完整复盘,含没能奏效的尝试',
  papers: 'LLM、强化学习与多模态方向的精读笔记',
  algorithms: '实现细节、性能取舍与踩坑记录',
  skills: 'Claude Code / AI Agent 技能包',
};

function richReportOf(data: unknown): string | undefined {
  return typeof data === 'object' && data !== null && 'richReport' in data
    ? ((data as { richReport?: string }).richReport ?? undefined)
    : undefined;
}

/**
 * 档案卡条目(Markdown 正文为空,正文写在 richReport 指向的 HTML 里)不生成详情页:
 * 那样的详情页没有任何入口,却仍带 data-pagefind-body 被搜索索引,
 * 使同一篇内容出现两条命中,其中一条点开是空页。
 *
 * 正文为空但没有 richReport 时照常生成——否则列表页链接会指向不存在的页面。
 */
export function needsDetailPage(entry: { body?: string; data: unknown }): boolean {
  const hasBody = (entry.body ?? '').trim().length > 0;
  return hasBody || richReportOf(entry.data) === undefined;
}

export async function getAllPosts(): Promise<UnifiedPost[]> {
  const groups = await Promise.all(
    SECTIONS.map(async (section) => {
      const entries = await getCollection(section, ({ data }) => !data.draft);
      return entries.map((entry) => ({
        id: entry.id,
        // 有精排版的文章,对外链接直接指向精排版;Markdown 详情页仍构建,承载全文搜索索引
        href: richReportOf(entry.data) ?? `/${section}/${entry.id}/`,
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
