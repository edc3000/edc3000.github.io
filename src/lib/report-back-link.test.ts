import { describe, it, expect } from 'vitest';
import { sectionOfReportPath, injectBackLink, BACK_LINK_MARK } from './report-back-link';

describe('sectionOfReportPath', () => {
  it('从 reports 下的路径取出板块', () => {
    expect(sectionOfReportPath('reports/papers/dapd.html')).toBe('papers');
    expect(sectionOfReportPath('reports/competitions/rogii.html')).toBe('competitions');
  });

  it('接受 Windows 风格的分隔符', () => {
    expect(sectionOfReportPath('reports\\skills\\kaggle-autopilot.html')).toBe('skills');
  });

  it('目录名不是已知板块时返回 undefined', () => {
    expect(sectionOfReportPath('reports/misc/foo.html')).toBeUndefined();
  });

  it('直接放在 reports 根下的 HTML 返回 undefined', () => {
    expect(sectionOfReportPath('reports/foo.html')).toBeUndefined();
  });
});

describe('injectBackLink', () => {
  const page = '<html><body><h1>正文</h1></body></html>';

  it('在 </body> 之前插入返回条', () => {
    const out = injectBackLink(page, 'papers');
    expect(out).toContain(BACK_LINK_MARK);
    expect(out.indexOf(BACK_LINK_MARK)).toBeLessThan(out.indexOf('</body>'));
    expect(out).toContain('<h1>正文</h1>');
  });

  it('已知板块时链接指向板块列表页并带中文名', () => {
    const out = injectBackLink(page, 'papers');
    expect(out).toContain('href="/papers/"');
    expect(out).toContain('论文精读');
  });

  it('板块未知时退回首页', () => {
    const out = injectBackLink(page, undefined);
    expect(out).toContain('href="/"');
    expect(out).toContain('aria-label="返回 Leo"');
  });

  it('窄屏只剩箭头,所以文字之外还要给出无障碍名称', () => {
    const out = injectBackLink(page, 'competitions');
    expect(out).toContain('aria-label="返回竞赛实录"');
    expect(out).toContain('<span class="site-back-label">Leo · 竞赛实录</span>');
  });

  it('板块名以拉丁字母开头时,无障碍名称补空格', () => {
    expect(injectBackLink(page, 'skills')).toContain('aria-label="返回 Agent 技能包"');
  });

  it('重复注入不会叠加第二份', () => {
    const once = injectBackLink(page, 'papers');
    const twice = injectBackLink(once, 'papers');
    expect(twice).toBe(once);
  });

  it('没有 </body> 时追加到末尾', () => {
    const out = injectBackLink('<h1>裸片段</h1>', 'skills');
    expect(out.startsWith('<h1>裸片段</h1>')).toBe(true);
    expect(out).toContain(BACK_LINK_MARK);
  });

  it('只替换最后一个 </body>,不碰正文里写到的 </body> 文本', () => {
    const withText = '<body><code>&lt;/body&gt;</code></body>';
    const out = injectBackLink(withText, 'papers');
    expect(out).toContain('<code>&lt;/body&gt;</code>');
    expect(out.match(/<\/body>/g)).toHaveLength(1);
  });
});
