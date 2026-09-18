/**
 * EJ 文件体检：结构、排序、日期归属、脏值、排版。
 * 用法: node js/audit-ej.mjs <txt路径>
 */
import { readFileSync } from 'node:fs';
import { isReprint, isIgnored } from './audit-ignore.mjs';

const file = process.argv[2];
if (!file) {
  console.error('用法: node js/audit-ej.mjs <txt路径>');
  process.exit(1);
}

const raw = readFileSync(file, 'utf8');
const text = raw.replace(/^﻿/, '');
const hadBom = raw.charCodeAt(0) === 0xfeff;

// 每张票之间由 "\n   \n" 分隔（编排器 finish() 的拼接格式）
const blocks = text.split('\n   \n').filter((b) => b.trim().length > 0);

/**
 * 视觉宽度：与 base.ts getTextLength() 同口径 —— CJK / 全角算 2，其余算 1。
 * 字符区间对齐 templates/base.ts:267 的正则。
 */
const CJK = /[一-鿿　-〿＀-￯]/;
const width = (s) => {
  let w = 0;
  for (const c of s) w += CJK.test(c) ? 2 : 1;
  return w;
};

const TYPES = [
  ['CASH IN', 0],
  ['SALES INVOICE', 1],
  ['RETURN TRANSACTION', 1],
  ['VOID TRANSACTION', 1],
  ['PICK UP CASH', 2],
  ['CASH OUT', 3],
  ['X-READING', 4],
  ['Z-READING REPORT', 5],
];

function classify(b) {
  for (const [label, seq] of TYPES) {
    if (new RegExp(`^ *${label.replace(/[-]/g, '\\-')} *$`, 'm').test(b)) {
      return { type: label, seq };
    }
  }
  return { type: 'UNKNOWN', seq: 9 };
}

/** 取该票的事件时间：优先 Exact Date，其次 Report Date&Time / Date&Time。 */
function eventTime(b) {
  // 各模板的日期标签不统一：销售单 "Exact Date:"、X/Z "Report Date & Time:"、
  // 退货/作废 "Date&Time"（无冒号）、现金票 "Date&Time:"。冒号一律可选。
  const pats = [
    /Exact Date:?\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/,
    /Report Date ?& ?Time:?\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/,
    /Date ?& ?Time:?\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/,
  ];
  for (const p of pats) {
    const m = b.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Z 票的营业日：Start Date & Time 的日期部分。 */
function businessDate(b) {
  const m = b.match(/Start Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

// 重打单与后厨/BILLING 辅助单据不参与校验（口径见 audit-ignore.mjs）
const nReprint = blocks.filter(isReprint).length;
const nAux = blocks.filter((b) => !isReprint(b) && isIgnored(b)).length;
const items = blocks
  .map((b, i) => ({ b, i }))
  .filter(({ b }) => !isIgnored(b))
  .map(({ b, i }) => ({
    idx: i,
    ...classify(b),
    time: eventTime(b),
    bd: businessDate(b),
    body: b,
  }));

console.log(`\n${'='.repeat(58)}`);
console.log(` 文件      ${file.split(/[\\/]/).pop()}`);
console.log(` 大小      ${(raw.length / 1024).toFixed(0)} KB / ${text.split('\n').length} 行`);
console.log(` BOM       ${hadBom ? '✅ 有 (UTF-8 BOM)' : '❌ 缺失'}`);
console.log(` 小票块数  ${blocks.length}（校验 ${items.length}）`);
console.log(` 忽略      重打 ${nReprint} 张 / 后厨·点菜·BILLING 等辅助单据 ${nAux} 张`);
console.log('='.repeat(58));

// ── 1. 类型分布 ──
console.log('\n【1】票据类型分布');
const byType = {};
for (const it of items) byType[it.type] = (byType[it.type] || 0) + 1;
for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${k.padEnd(22)} ${String(v).padStart(4)}${k === 'UNKNOWN' ? '  ⚠ 无法识别类型' : ''}`);
}

// ── 2. 排序 ──
console.log('\n【2】排序正确性 (time 升序，同 time 按 seq)');
let orderErr = 0;
const timed = items.filter((i) => i.time);
for (let i = 1; i < timed.length; i++) {
  const a = timed[i - 1];
  const b = timed[i];
  if (a.time > b.time || (a.time === b.time && a.seq > b.seq)) {
    orderErr++;
    if (orderErr <= 5) {
      console.log(`   ⚠ 逆序: #${a.idx} ${a.type}(seq${a.seq}) ${a.time}`);
      console.log(`             → #${b.idx} ${b.type}(seq${b.seq}) ${b.time}`);
    }
  }
}
console.log(
  `   带时间戳的票 ${timed.length}/${items.length}` +
    `   逆序 ${orderErr} 处 ${orderErr === 0 ? '✅' : '❌'}`,
);

// ── 3. 日期范围 ──
const m = file.match(/(\d{4}-\d{2}-\d{2})[_~](\d{4}-\d{2}-\d{2})/);
console.log('\n【3】日期归属');
if (m) {
  const [, sd, ed] = m;
  console.log(`   声明范围 ${sd} ~ ${ed}`);
  let oob = 0;
  for (const it of items) {
    const d = it.type === 'Z-READING REPORT' ? it.bd : it.time?.slice(0, 10);
    if (d && (d < sd || d > ed)) {
      oob++;
      if (oob <= 5) console.log(`   ⚠ 越界: #${it.idx} ${it.type} ${d}`);
    }
  }
  console.log(`   越界票 ${oob} ${oob === 0 ? '✅' : '❌'}`);

  const zs = items.filter((i) => i.type === 'Z-READING REPORT');
  const cross = zs.filter((z) => z.bd && z.time && z.time.slice(0, 10) !== z.bd);
  console.log(
    `   Z-READING ${zs.length} 张，其中跨午夜 ${cross.length} 张` +
      `（按 businessDate 归属，未被日期过滤误杀）`,
  );
}

// ── 4. 双联配对 ──
console.log('\n【4】副本配对');
for (const t of ['RETURN TRANSACTION', 'VOID TRANSACTION']) {
  const g = items.filter((i) => i.type === t);
  const cashier = g.filter((i) => /Cashier Copy/.test(i.body)).length;
  const customer = g.filter((i) => /Customer Copy/.test(i.body)).length;
  const ok = cashier === customer && cashier * 2 === g.length;
  console.log(
    `   ${t.padEnd(20)} ${g.length} 张 = Cashier ${cashier} + Customer ${customer} ${ok ? '✅' : '❌ 不配对'}`,
  );
}
const sales = items.filter((i) => i.type === 'SALES INVOICE');
const govSales = sales.filter((i) => /Cashier Copy|Customer Copy/.test(i.body));

// ── 4.5 双联内容一致：Cashier/Customer 副本除标记行外应逐行一致 ──
let pairDiff = 0;
const normCopyLines = (body) =>
  body
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.trim() !== 'Cashier Copy' && l.trim() !== 'Customer Copy');
for (let i = 0; i < items.length; i++) {
  const a = items[i];
  if (!/Cashier Copy/.test(a.body || '')) continue;
  for (let j = i + 1; j < items.length; j++) {
    const c = items[j];
    if (c.type !== a.type) continue;
    if (!/Customer Copy/.test(c.body || '')) break;
    const la = normCopyLines(a.body);
    const lc = normCopyLines(c.body);
    const n = Math.max(la.length, lc.length);
    for (let k = 0; k < n; k++) {
      const x = k < la.length ? la[k] : '(缺行)';
      const y = k < lc.length ? lc[k] : '(缺行)';
      if (x !== y) {
        pairDiff++;
        if (pairDiff <= 5) {
          console.log(`   [双联不一致] 块#${a.idx} vs #${c.idx} 第${k + 1}行: "${x}" / "${y}"`);
        }
        break;
      }
    }
    break;
  }
}
console.log(`   双联内容一致: ${pairDiff === 0 ? '✅' : '❌'} ${pairDiff} 对不一致`);
console.log(
  `   SALES INVOICE        ${sales.length} 张，其中双联 ${govSales.length} 张` +
    `（政府折扣单）${govSales.length % 2 === 0 ? '✅' : '❌ 奇数，存在落单'}`,
);

// ── 5. 脏值 ──
console.log('\n【5】脏值扫描');
let dirty = 0;
for (const p of ['null', 'undefined', 'NaN', 'TBD', 'Infinity', '[object', '{{', '}}']) {
  const n = text.split(p).length - 1;
  if (n > 0) dirty += n;
  console.log(`   ${p.padEnd(12)} ${n}${n > 0 ? '  ⚠' : ''}`);
}

// ── 6. 排版 ──
// 行宽只校验交易票的非商品名区域：商品名/备注是客户数据（菜名、口味、留言），
// 长度不受模板控制，超宽不算缺陷；后厨类单据与重打单整体不参与。
console.log('\n【6】排版（行宽 48）');
const HEADER_ROW = /^Description\s+Qty\s+U\.Price\s+Amount\s*$/;
const SEP_ROW = /^-{10,}$/;
const over = [];
let nameOver = 0;
let lineNo = 1;
for (const b of blocks) {
  const lines = b.split('\n');
  const skip = isIgnored(b);
  let inItems = false;
  let seenContent = false;
  for (const l of lines) {
    if (HEADER_ROW.test(l)) {
      inItems = true;
      seenContent = false;
    } else if (inItems && SEP_ROW.test(l)) {
      if (seenContent) inItems = false; // 表头下紧跟的分隔线不算商品区结束
    } else if (inItems && l.trim()) {
      seenContent = true;
    }
    if (!skip && width(l) > 48) {
      if (inItems || /Memo|Spice|Spicy|辣/.test(l)) nameOver++;
      else over.push({ i: lineNo, w: width(l), l });
    }
    lineNo++;
  }
  lineNo++; // 块分隔 "\n   \n" 的 3 空格行
}
console.log(
  `   超宽行 ${over.length}${over.length === 0 ? ' ✅' : ''}` +
    `，另有商品名/备注等客户数据超宽 ${nameOver} 行（不计）`,
);
for (const o of over.slice(0, 5)) {
  console.log(`     L${o.i} 宽${o.w}: ${o.l.slice(0, 44)}...`);
}

// ── 7. 结构完整性 ──
console.log('\n【7】小票结构完整性');
let noHeader = 0;
let noFooter = 0;
for (const it of items) {
  if (!/VAT-REG TIN|TIN:/.test(it.body)) noHeader++;
  if (it.type === 'SALES INVOICE' && !/THIS SERVES AS YOUR SALES INVOICE/.test(it.body)) noFooter++;
}
console.log(`   缺税号头部  ${noHeader} ${noHeader === 0 ? '✅' : '⚠'}`);
console.log(`   销售票缺尾部 ${noFooter} ${noFooter === 0 ? '✅' : '⚠'}`);

const emptyAmount = items.filter((i) =>
  /^(Gross Sales|Amount Due)\s*$/m.test(i.body),
).length;
console.log(`   金额行为空  ${emptyAmount} ${emptyAmount === 0 ? '✅' : '⚠'}`);

console.log(`\n${'='.repeat(58)}`);
// ── 不可渲染字符：增补平面(emoji)/C1 控制/私用区 —— 仅警告不计失败(TxtToPdf 已有 □ 兜底) ──
let badGlyph = 0;
const glyphDetail = [];
for (const ch of text) {
  const cp = ch.codePointAt(0);
  const bad = cp > 0xffff || (cp >= 0xe000 && cp <= 0xf8ff)
    || (cp >= 0x7f && cp <= 0x9f)
    || (cp < 0x20 && ch !== '\n' && ch !== '\r' && ch !== '\t');
  if (bad) {
    badGlyph++;
    if (glyphDetail.length < 5) glyphDetail.push('U+' + cp.toString(16).toUpperCase());
  }
}
if (badGlyph) console.log(`   不可渲染字符 ${badGlyph} 个 ⚠ ${glyphDetail.join(' ')}`);

const problems = orderErr + dirty + (byType.UNKNOWN || 0);
console.log(problems === 0 ? ' 结论: 未发现结构性问题 ✅' : ` 结论: 发现 ${problems} 处待确认 ⚠`);
console.log('='.repeat(58));
