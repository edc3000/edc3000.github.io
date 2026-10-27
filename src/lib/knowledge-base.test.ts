import { describe, it, expect } from 'vitest';
import { categoryOf, buildTree, neighbors, sectionsFromHtml, INTERVIEW_CATEGORIES } from './knowledge-base';

const e = (id: string, title: string, order = 100, group?: string) => ({ id, title, order, group });

describe('categoryOf', () => {
  it('取条目 id 的第一段作为分类', () => {
    expect(categoryOf('architecture/qwen3-to-qwen3-5')).toBe('architecture');
  });

  it('不在分类表里的文件夹直接报错,避免条目静默消失', () => {
    expect(() => categoryOf('misc/foo')).toThrow(/misc/);
  });

  it('直接放在 interview 根下的条目报错', () => {
    expect(() => categoryOf('foo')).toThrow();
  });
});

describe('buildTree', () => {
  it('六个分类全部列出,空分类 count 为 0', () => {
    const tree = buildTree([]);
    expect(tree.map((c) => c.key)).toEqual(INTERVIEW_CATEGORIES.map((c) => c.key));
    expect(tree.every((c) => c.count === 0)).toBe(true);
  });

  it('分类内按 order 再按标题排序', () => {
    const tree = buildTree([e('infra/b', 'B', 20), e('infra/c', 'C', 10), e('infra/a', 'A', 20)]);
    const infra = tree.find((c) => c.key === 'infra')!;
    expect(infra.groups.flatMap((g) => g.entries.map((x) => x.id))).toEqual(['infra/c', 'infra/a', 'infra/b']);
    expect(infra.count).toBe(3);
  });

  it('未分组的条目排在最前,分组按组内最小 order 排列', () => {
    const tree = buildTree([
      e('algorithms/dpo', 'DPO', 30, '对齐与 RL'),
      e('algorithms/lora', 'LoRA', 10, 'SFT 与微调'),
      e('algorithms/misc', '杂项', 50),
    ]);
    const groups = tree.find((c) => c.key === 'algorithms')!.groups;
    expect(groups.map((g) => g.name)).toEqual([undefined, 'SFT 与微调', '对齐与 RL']);
  });
});

describe('neighbors', () => {
  const tree = buildTree([e('basics/a', 'A', 1), e('architecture/b', 'B', 1), e('architecture/c', 'C', 2)]);

  it('按侧栏顺序跨分类取上一条和下一条', () => {
    expect(neighbors(tree, 'architecture/b')).toEqual({
      prev: { id: 'basics/a', title: 'A' },
      next: { id: 'architecture/c', title: 'C' },
    });
  });

  it('首尾条目只有一侧', () => {
    expect(neighbors(tree, 'basics/a').prev).toBeUndefined();
    expect(neighbors(tree, 'architecture/c').next).toBeUndefined();
  });
});

describe('sectionsFromHtml', () => {
  it('取带 id 的 section 及其第一个 h2 作为页内目录,去掉内部标签', () => {
    const html = `
      <section id="recite" class="stack"><div><h2>30 秒<b>背诵版</b></h2></div><h3>x</h3></section>
      <section class="no-id"><h2>无 id</h2></section>
      <section id="qwen3"><h2>Qwen3 文本模型</h2></section>`;
    expect(sectionsFromHtml(html)).toEqual([
      { id: 'recite', text: '30 秒背诵版' },
      { id: 'qwen3', text: 'Qwen3 文本模型' },
    ]);
  });

  it('section 内没有 h2 时跳过,不吞掉下一个 section 的标题', () => {
    const html = '<section id="a"><p>无标题</p></section><section id="b"><h2>B</h2></section>';
    expect(sectionsFromHtml(html)).toEqual([{ id: 'b', text: 'B' }]);
  });
});
