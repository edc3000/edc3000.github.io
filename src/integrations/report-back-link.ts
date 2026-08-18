import type { AstroIntegration } from 'astro';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { injectBackLink, sectionOfReportPath } from '../lib/report-back-link';

/**
 * 给 dist/reports 下的精排版 HTML 注入返回站内的入口。
 * 放在构建期而不是改源文件:public/ 里的 HTML 是手写后整份放进来的,
 * 保持它单文件自包含,同时新增一篇不必记得手动补导航。
 */
export default function reportBackLink(): AstroIntegration {
  return {
    name: 'report-back-link',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const reportsDir = path.join(fileURLToPath(dir), 'reports');
        let entries: string[];
        try {
          entries = await readdir(reportsDir, { recursive: true });
        } catch {
          logger.info('没有 reports 目录,跳过');
          return;
        }

        let count = 0;
        for (const entry of entries.filter((e) => e.endsWith('.html'))) {
          const file = path.join(reportsDir, entry);
          const html = await readFile(file, 'utf8');
          const out = injectBackLink(html, sectionOfReportPath(path.join('reports', entry)));
          if (out !== html) {
            await writeFile(file, out);
            count += 1;
          }
        }
        logger.info(`已注入返回条:${count} 个精排版页面`);
      },
    },
  };
}
