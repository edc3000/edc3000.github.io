/**
 * 板块常量单独成文件:collections.ts 依赖 astro:content,
 * 构建期 integration 与 vitest 都无法 import 它。
 */
export type Section = 'competitions' | 'papers' | 'algorithms' | 'skills';

export const SECTIONS: Section[] = ['competitions', 'papers', 'algorithms', 'skills'];

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
