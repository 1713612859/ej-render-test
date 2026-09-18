/**
 * 批量扫描 B账「现金找零向上取整」规则执行情况。
 *
 * 规则：CHANGE > 0 且 CASH 有小数 → CASH 应向上取整并重算找零；
 *       CHANGE = 0 或 CASH 已是整数 → 保持不变。
 * 违规 = CHANGE > 0 且 CASH 有小数（票面未执行取整）。
 *
 * 用法:
 *   node js/scan-cash-rounding.mjs [txt...]   # 显式指定文件
 *   node js/scan-cash-rounding.mjs            # 自动发现：out/EJournal*.txt
 *                                             # + MuMu共享文件夹递归 EJournal*.txt
 * 相同内容（md5 一致）的重复导出只统计一次。
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename } from 'node:path';
import { execSync } from 'node:child_process';

const PAY = ['CASH', 'GCASH', 'CREDIT', 'DEBIT', 'MAYA', 'PAYMAYA', 'QRPH',
  'WECHAT', 'ALIPAY', 'STORED VALUE CARD', 'GIFT CHECK', 'POINTS', 'MEMBER BALANCE'];
const num = (s) => parseFloat(String(s).replace(/,/g, ''));
const hasDec = (v) => Math.abs(v - Math.round(v)) > 1e-9;
const amt = (b, label) => {
  const m = b.match(new RegExp(`^${label} +(-?[\\d,]+\\.\\d{2}) *$`, 'm'));
  return m ? num(m[1]) : null;
};

/** 自动发现所有 EJ 文件。 */
function discover() {
  const files = new Set();
  for (const f of readdirSync('out')) {
    if (/^EJournal.*\.txt$/.test(f)) files.add(join('out', f));
  }
  const muMu = 'C:/Users/Administrator/Documents/MuMu共享文件夹';
  if (existsSync(muMu)) {
    // Git Bash 环境用 find 递归，避开逐层 readdir 的复杂性
    try {
      const out = execSync(`find "${muMu}" -name "EJournal*.txt" 2>/dev/null`, { encoding: 'utf8' });
      for (const l of out.split('\n').filter(Boolean)) files.add(l);
    } catch { /* 找不到就算了 */ }
  }
  return [...files];
}

function scanFile(file) {
  const raw = readFileSync(file, 'utf8');
  const blocks = raw.replace(/^\uFEFF/, '').split('\n   \n').filter((b) => b.trim().length > 0);
  const seen = new Set();
  const rows = [];
  for (const [idx, b] of blocks.entries()) {
    if (!/^ *SALES INVOICE *$/m.test(b)) continue;
    if (/^ *REPRINT *$/m.test(b)) continue;
    const si = (b.match(/^\s*SI\s+(\d{10,})\s*$/m) || [])[1];
    if (!si || seen.has(si)) continue;
    seen.add(si);
    const due = amt(b, 'Amount Due');
    const cash = amt(b, 'CASH');
    if (cash === null || due === null) continue;
    const change = amt(b, 'CHANGE') ?? 0;
    const date = (b.match(/Exact Date:\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || '?';
    rows.push({ si, date, idx, due, cash, change });
  }
  return rows;
}

// ── 汇总入口 ──
const args = process.argv.slice(2);
const files = args.length ? args : discover();
if (!files.length) {
  console.error('没有找到任何 EJournal*.txt');
  process.exit(1);
}

const md5 = (f) => createHash('md5').update(readFileSync(f)).digest('hex');
const seenHash = new Map(); // md5 -> 首个文件名
const results = [];
let dupFiles = 0;

for (const f of files) {
  let h;
  try { h = md5(f); } catch { continue; }
  if (seenHash.has(h)) { dupFiles++; continue; }
  seenHash.set(h, f);
  const rows = scanFile(f);
  const violation = rows.filter((r) => r.change > 0 && hasDec(r.cash));
  const compliant = rows.filter((r) => r.change > 0 && !hasDec(r.cash));
  const noChange = rows.filter((r) => r.change === 0);
  const cents = violation.reduce((a, r) => a + Math.ceil(r.cash) - r.cash, 0);
  const firstLine = (readFileSync(f, 'utf8').replace(/^\uFEFF/, '').split('\n').find((l) => l.trim()) || '').trim();
  results.push({
    file: basename(f), dir: f.includes('MuMu') ? 'MuMu共享' : 'out',
    store: firstLine.slice(0, 30), rows, violation, compliant, noChange, cents,
    period: (basename(f).match(/(\d{4}-\d{2}-\d{2})[_~](\d{4}-\d{2}-\d{2})/) || ['', '?', '?']).slice(1).join('~'),
  });
}

console.log(`扫描 ${files.length} 个文件，去重后 ${results.length} 份独立数据（跳过重复导出 ${dupFiles} 个）\n`);
console.log('门店                          期间                  现金票   违规   合规  无找零  违规率   分币影响');
console.log('-'.repeat(100));
let tRows = 0; let tViol = 0; let tCents = 0;
for (const r of results.sort((a, b) => a.store.localeCompare(b.store) || a.period.localeCompare(b.period))) {
  tRows += r.rows.length; tViol += r.violation.length; tCents += r.cents;
  const rate = r.rows.length ? (r.violation.length / r.rows.length * 100).toFixed(1) + '%' : '-';
  console.log(
    `${r.store.padEnd(28)} ${r.period.padEnd(20)} ${String(r.rows.length).padStart(5)} ${String(r.violation.length).padStart(6)} ${String(r.compliant.length).padStart(6)} ${String(r.noChange.length).padStart(6)} ${rate.padStart(7)} ${r.cents.toFixed(2).padStart(9)}  [${r.dir}]`,
  );
}
console.log('-'.repeat(100));
console.log(
  `合计 ${results.length} 份数据                          ${String(tRows).padStart(5)} ${String(tViol).padStart(6)}${' '.repeat(19)}${(tRows ? (tViol / tRows * 100).toFixed(1) : 0) + '%'.padStart(6)} ${tCents.toFixed(2).padStart(9)}`,
);

// 合并违规 CSV
const out = ['文件,门店,SI,日期,AmountDue,CASH,CHANGE,规则后CASH,规则后CHANGE,块#'];
for (const r of results) {
  for (const v of r.violation.sort((a, b) => a.si.localeCompare(b.si))) {
    const nc = Math.ceil(v.cash);
    out.push(`${r.file},${r.store},${v.si},${v.date},${v.due.toFixed(2)},${v.cash.toFixed(2)},${v.change.toFixed(2)},${nc},${(nc - v.due).toFixed(2)},${v.idx}`);
  }
}
writeFileSync('out/现金取整违规明细.csv', '\uFEFF' + out.join('\n'));
console.log(`\n合并违规明细（${out.length - 1} 行）已写 out/现金取整违规明细.csv`);
