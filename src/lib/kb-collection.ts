import { getCollection } from 'astro:content';
import { buildTree, type KbCategory } from './knowledge-base';

/** LLMs八股侧栏树:构建期从 collection 读出,布局与首页共用 */
export async function getKbTree(): Promise<KbCategory[]> {
  const entries = await getCollection('interview', ({ data }) => !data.draft);
  return buildTree(entries.map((e) => ({ id: e.id, title: e.data.title, order: e.data.order, group: e.data.group })));
}
