import { describe, it, expect } from 'vitest';
import { formatTopPercent, formatDate, MEDAL_LABEL } from './format';

describe('formatTopPercent', () => {
  it('计算 rogii 银牌的百分比', () => {
    expect(formatTopPercent(177, 6125)).toBe('Top 2.89%');
  });

  it('计算 MAP 铜牌的百分比', () => {
    expect(formatTopPercent(94, 1857)).toBe('Top 5.06%');
  });

  it('计算 FB3 铜牌的百分比', () => {
    expect(formatTopPercent(282, 2655)).toBe('Top 10.62%');
  });

  it('第一名为 Top 0.01% 而非 Top 0%', () => {
    expect(formatTopPercent(1, 10000)).toBe('Top 0.01%');
  });

  it('总数为 0 时返回空串而不是 NaN', () => {
    expect(formatTopPercent(5, 0)).toBe('');
  });
});

describe('formatDate', () => {
  it('格式化为 YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-08-10T00:00:00Z'))).toBe('2026-08-10');
  });
});

describe('MEDAL_LABEL', () => {
  it('提供三种奖牌的中文名', () => {
    expect(MEDAL_LABEL.gold).toBe('金牌');
    expect(MEDAL_LABEL.silver).toBe('银牌');
    expect(MEDAL_LABEL.bronze).toBe('铜牌');
  });
});
