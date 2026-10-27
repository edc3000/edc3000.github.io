/**
 * LLMs八股知识库的分类与侧栏结构。纯函数、不依赖 astro:content,便于 vitest 测试;
 * 读 collection 的部分在 kb-collection.ts。
 *
 * 分类由条目所在文件夹决定(src/content/interview/<分类>/<条目>.md),
 * 这里是分类的唯一登记处:中文名、简介和侧栏顺序都以此为准。
 */
export const INTERVIEW_CATEGORIES = [
  { key: 'basics', label: '基础知识', blurb: 'Norm、初始化、优化器、Attention 原理、位置编码、解码与评估' },
  { key: 'architecture', label: '模型架构', blurb: 'MHA/GQA、MoE、线性注意力、MTP、模型家族演进' },
  { key: 'algorithms', label: '算法', blurb: 'SFT 与 LoRA、DPO/PPO/GRPO、蒸馏、scaling 与超参' },
  { key: 'infra', label: 'Infra', blurb: 'KV Cache、FlashAttention、数值精度、训练框架、推理延迟' },
  { key: 'agent', label: 'Agent', blurb: 'RAG、Agent 架构、工具调用' },
  { key: 'scenarios', label: '场景题', blurb: '业务场景设计与项目追问' },
] as const;

export type CategoryKey = (typeof INTERVIEW_CATEGORIES)[number]['key'];

export interface KbEntry {
  id: string;
  title: string;
  order: number;
  group?: string;
}

export interface KbGroup {
  /** undefined 表示未分组,侧栏不显示组名 */
  name?: string;
  entries: KbEntry[];
}

export interface KbCategory {
  key: CategoryKey;
  label: string;
  blurb: string;
  count: number;
  groups: KbGroup[];
}

export function categoryOf(id: string): CategoryKey {
  const [dir, ...rest] = id.split('/');
  const known = INTERVIEW_CATEGORIES.find((c) => c.key === dir);
  if (rest.length === 0 || !known) {
    const keys = INTERVIEW_CATEGORIES.map((c) => c.key).join(' / ');
    throw new Error(`LLMs八股条目 "${id}" 不在已知分类文件夹里(${keys}),请放进其中之一`);
  }
  return known.key;
}

const byOrderThenTitle = (a: KbEntry, b: KbEntry) => a.order - b.order || a.title.localeCompare(b.title, 'zh');

export function buildTree(entries: KbEntry[]): KbCategory[] {
  return INTERVIEW_CATEGORIES.map((cat) => {
    const mine = entries.filter((e) => categoryOf(e.id) === cat.key).sort(byOrderThenTitle);
    const groups = new Map<string | undefined, KbEntry[]>();
    for (const e of mine) groups.set(e.group, [...(groups.get(e.group) ?? []), e]);
    // 已排序,所以 Map 的插入顺序就是"组内最小 order"的顺序;未分组的提到最前
    const ordered = [...groups].sort(([a], [b]) => Number(a !== undefined) - Number(b !== undefined));
    return {
      ...cat,
      count: mine.length,
      groups: ordered.map(([name, list]) => ({ name, entries: list })),
    };
  });
}

type Neighbor = { id: string; title: string };

export function neighbors(tree: KbCategory[], id: string): { prev?: Neighbor; next?: Neighbor } {
  const flat = tree.flatMap((c) => c.groups.flatMap((g) => g.entries));
  const i = flat.findIndex((e) => e.id === id);
  const pick = (e?: KbEntry) => (e ? { id: e.id, title: e.title } : undefined);
  return { prev: i > 0 ? pick(flat[i - 1]) : undefined, next: pick(flat[i + 1]) };
}

/**
 * 精排版 HTML 的页内目录:取每个带 id 的 <section> 里的第一个 <h2>。
 * 嵌入页在构建期读 HTML 生成右栏,不依赖 iframe 加载完成。
 */
export function sectionsFromHtml(html: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const m of html.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)) {
    const h2 = m[2].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/);
    if (h2) out.push({ id: m[1], text: h2[1].replace(/<[^>]+>/g, '').trim() });
  }
  return out;
}
