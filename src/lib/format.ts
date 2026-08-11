export const MEDAL_LABEL = {
  gold: '金牌',
  silver: '银牌',
  bronze: '铜牌',
} as const;

export function formatTopPercent(rank: number, total: number): string {
  if (total <= 0) return '';
  const pct = (rank / total) * 100;
  return `Top ${pct.toFixed(2)}%`;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
