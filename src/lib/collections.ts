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
