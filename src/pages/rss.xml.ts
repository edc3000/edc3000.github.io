import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '../lib/collections';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  return rss({
    title: 'Leo',
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
