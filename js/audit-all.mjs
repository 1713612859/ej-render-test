/**
 * 一键跑全部 EJ 离线校验：结构 → 内容 → 金额。
 *
 * 用法:
 *   node js/audit-all.mjs                 # 自动取 out/ 下最新的 EJournal*.txt
 *   node js/audit-all.mjs <txt路径>       # 指定文件
 *   node js/audit-all.mjs --quiet         # 只打汇总，不打各脚本的完整输出
 *
 * 判定口径：子脚本输出里出现 "❌" 即判该项不通过。四个脚本的结论行都用
 * ✅/❌ 标记，不额外约定退出码，避免改动既有脚本。
 * audit-ej 的口味备注超宽行标的是 ⚠ 不是 ❌，属已知刻意行为，不计入失败。
 *
 * 全部通过退出码 0，任一失败退出码 1（可直接接 CI）。
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
let file = args.find((a) => !a.startsWith('--'));

if (!file) {
  const dir = 'out';
  if (!existsSync(dir)) {
    console.error('out/ 不存在，请显式传入 txt 路径');
    process.exit(1);
  }
  const cands = readdirSync(dir)
    .filter((f) => /^EJournal.*\.txt$/.test(f))
    .map((f) => ({ f: join(dir, f), t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  if (!cands.length) {
    console.error('out/ 下没有 EJournal*.txt，请先生成或显式传入路径');
    process.exit(1);
  }
  file = cands[0].f;
  console.log(`未指定文件，自动选用最新的: ${file}`);
}

if (!existsSync(file)) {
  console.error(`文件不存在: ${file}`);
  process.exit(1);
}

const SUITE = [
  ['结构 / 排序 / 排版', 'js/audit-ej.mjs'],
  ['内容完整性', 'js/audit-content.mjs'],
  ['金额勾稽', 'js/audit-amounts.mjs'],
  ['Z-READING 勾稽', 'js/audit-zreading.mjs'],
];

const results = [];
for (const [name, script] of SUITE) {
  const r = spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  if (!quiet) process.stdout.write(out);
  const fails = out.split('❌').length - 1;
  const crashed = r.status !== 0 && r.status !== null;
  results.push({ name, script, fails, crashed });
}

const line = '='.repeat(62);
console.log(`\n${line}`);
console.log(` 汇总 — ${file.split(/[\\/]/).pop()}`);
console.log(line);
// 汇总对齐：中文按 2 列宽算显示宽度（padEnd 按字符数，中文列必歪）
const dw = (s) => { let w = 0; for (const c of s) w += /[\u2E80-\u9FFF\uF900-\uFAFF\uFF01-\uFF60\u3000-\u303F✅❌💥⚠]/.test(c) ? 2 : 1; return w; };
const padL = (s, w) => s + ' '.repeat(Math.max(1, w - dw(s)));
for (const r of results) {
  const mark = r.crashed ? '💥' : r.fails === 0 ? '✅' : '❌';
  const note = r.crashed ? '脚本异常退出' : r.fails === 0 ? '通过' : `${r.fails} 项不通过`;
  console.log(`  ${mark} ${padL(r.name, 26)} ${padL(note, 16)} ${r.script}`);
}
const bad = results.filter((r) => r.fails > 0 || r.crashed).length;
console.log(line);
console.log(bad === 0 ? ' 结论: 全部校验通过 ✅' : ` 结论: ${bad} 项校验未通过 ❌`);
console.log(line);
process.exit(bad === 0 ? 0 : 1);
