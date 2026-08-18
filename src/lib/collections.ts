import { getCollection } from 'astro:content';
import { SECTIONS, SECTION_LABEL, SECTION_BLURB, type Section } from './sections';

export { SECTION_LABEL, SECTION_BLURB, type Section };

export interface UnifiedPost {
  id: string;
  href: string;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  section: Section;
}

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
