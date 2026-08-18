import { SECTION_LABEL, SECTIONS, type Section } from './sections';

/** 幂等标记:重复构建时据此跳过已注入的页面 */
export const BACK_LINK_MARK = '<!--site-back-link-->';

/** 'reports/papers/dapd.html' -> 'papers';目录名不是已知板块时 undefined */
export function sectionOfReportPath(relPath: string): Section | undefined {
  const [root, dir, ...rest] = relPath.split(/[/\\]/);
  if (root !== 'reports' || rest.length === 0) return undefined;
  return (SECTIONS as string[]).includes(dir) ? (dir as Section) : undefined;
}

/**
 * 精排版 HTML 是手写后直接放进 public/ 的,自身没有站内导航,
 * 且列表页直接链到它(见 collections.ts 的 href),读者进去后没有出口。
 * 这里在构建产物上补一个返回条,源文件保持单文件自包含。
 */
export function injectBackLink(html: string, section: Section | undefined): string {
  if (html.includes(BACK_LINK_MARK)) return html;

  const href = section ? `/${section}/` : '/';
  const name = section ? SECTION_LABEL[section] : 'Leo';
  const label = section ? `Leo · ${name}` : '返回 Leo';
  // 窄屏下只剩箭头,无障碍名称要独立成立;板块名以拉丁字母开头时补一个空格
  const aria = `返回${/^[A-Za-z0-9]/.test(name) ? ' ' : ''}${name}`;
  const snippet = `${BACK_LINK_MARK}
<style>
a.site-back-link{position:fixed; right:20px; bottom:20px; z-index:9999;
  display:inline-flex; align-items:center; gap:7px; padding:9px 15px; border-radius:999px;
  background:rgba(28,28,30,.88); color:#fff; text-decoration:none; box-shadow:0 2px 14px rgba(0,0,0,.22);
  font:500 14px/1 system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);}
a.site-back-link:hover{background:#1c1c1e; color:#fff;}
a.site-back-link .site-back-arrow{font-size:15px; line-height:1;}
/* 窄屏正文占满屏宽,完整胶囊会压住行尾,收成只剩箭头的圆钮 */
@media (max-width:640px){
  a.site-back-link{right:12px; bottom:12px; gap:0; width:40px; height:40px; padding:0;
    justify-content:center; opacity:.9;}
  a.site-back-link .site-back-label{display:none;}
  a.site-back-link .site-back-arrow{font-size:17px;}
}
@media print{a.site-back-link{display:none;}}
</style>
<a class="site-back-link" href="${href}" aria-label="${aria}" title="${aria}"><span class="site-back-arrow" aria-hidden="true">←</span><span class="site-back-label">${label}</span></a>
`;

  const close = html.lastIndexOf('</body>');
  if (close === -1) return `${html}\n${snippet}`;
  return html.slice(0, close) + snippet + html.slice(close);
}
