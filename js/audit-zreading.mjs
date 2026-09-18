/**
 * EJ Z-READING 勾稽（与 EjAudit.auditZReading 同口径，JS 侧补齐）。
 *
 * 报表内部自洽：
 *   Z1 税分解   VATable+VAT+Exempt+Zero = GROSS − LESS RET − LESS VOID − LESS VAT ADJ − OTHER DISC
 *   Z2 净额     GROSS − LESS DISCOUNT − LESS RETURN − LESS VOID − LESS VAT ADJUSTMENT = NET AMOUNT
 *   Z3 日销售   Present Accumulated − Previous Accumulated = Sales for the Day
 *   Z4 折扣     LESS DISCOUNT = DISCOUNT SUMMARY 各项之和（SC/PWD/NAAC/SP/MOV/OTHER）
 *   Z5 销售调整 SALES ADJUSTMENT 的 RETURN:/VOID: = LESS RETURN:/LESS VOID:
 *   Z6 VAT调整  LESS VAT ADJUSTMENT = VAT ADJUSTMENT 各项之和
 *   Z10 日期段  Start/End 同一天且 00:00:00~23:59:59
 * 跨报表连续：Z7 Counter 递增 / Z8 累计链接轨 / Z9 SI 号段不重叠 / Z11 号段无缺号
 * 明细交叉：   Z12 毛额 / Z13 作废含税 / Z14 退货含税（含税 = 票面 Gross + LessVAT 冲回）
 *
 * 忽略口径同 audit-ignore.mjs（重打 Z 不参与）。
 */
import { readFileSync } from 'node:fs';
import { isIgnored } from './audit-ignore.mjs';

const file = process.argv[2];
if (!file) {
  console.error('用法: node js/audit-zreading.mjs <txt路径>');
  process.exit(1);
}
const raw = readFileSync(file, 'utf8');
const text = raw.replace(/^﻿/, '');
const blocks = text.split('\n   \n').filter((b) => b.trim().length > 0);

const EPS = 0.1;
const num = (s) => parseFloat(String(s).replace(/,/g, ''));
const amt = (b, l) => {
  const m = b.match(new RegExp(`^${l} *(-?[\\d,]+\\.\\d{2}) *$`, 'm'));
  return m ? num(m[1]) : null;
};
const nz = (v) => (v === null ? 0 : v);

// ── 解析 Z 报表 ──
const DISC_ITEMS = ['SC DISC:', 'PWD DISC:', 'NAAC DISC:', 'SP DISC:', 'MOV DISC:', 'OTHER DISC:'];
const VATADJ_ITEMS = ['SC TRANS:', 'PWD TRANS:', 'NAAC TRANS:', 'SP TRANS:', 'MOV TRANS:',
  'DIPLOMATIC TRANS:', 'REG DISC TRANS:', 'ZERO-RATED TRANS:', 'VAT ON RETURN:',
  'VAT ON VOID:', 'OTHER VAT Adjustment:'];

const zs = [];
for (const [idx, b] of blocks.entries()) {
  if (!/^ *Z-READING REPORT *$/m.test(b) || isIgnored(b)) continue;
  zs.push({
    idx, body: b,
    bd: (b.match(/Start Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || null,
    time: (b.match(/Report Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1] || null,
    gross: nz(amt(b, 'GROSS AMOUNT:')),
    vatable: nz(amt(b, 'VATABLE SALES:')), vat: nz(amt(b, 'VAT AMOUNT:')),
    exempt: nz(amt(b, 'VAT EXEMPT SALES:')), zero: nz(amt(b, 'ZERO RATED SALES:')),
    lessDisc: nz(amt(b, 'LESS DISCOUNT:')), otherDisc: nz(amt(b, 'OTHER DISC:')),
    lessRet: nz(amt(b, 'LESS RETURN:')), lessVoid: nz(amt(b, 'LESS VOID:')),
    vatAdj: nz(amt(b, 'LESS VAT ADJUSTMENT:')),
    net: nz(amt(b, 'NET AMOUNT:')),
    vatOnRet: nz(amt(b, 'VAT ON RETURN:')), vatOnVoid: nz(amt(b, 'VAT ON VOID:')),
    present: nz(amt(b, 'Present Accumulated Sales')),
    previous: nz(amt(b, 'Previous Accumulated Sales:')),
    dayS: nz(amt(b, 'Sales for the Day:')),
    zc: (b.match(/^ *Z Counter\.\s+(\d+)\s*$/m) || [])[1],
  });
}
zs.sort((a, b) => (a.bd || '').localeCompare(b.bd || '') || (a.time || '').localeCompare(b.time || '') || a.idx - b.idx);

// ── 当日明细票汇总（含税口径：退货/作废 = Gross + LessVAT 冲回；双联按单号去重）──
const days = new Map();
const seen = new Set();
const siSeen = new Set(); const voidSeen = new Set(); const retSeen = new Set();
for (const b of blocks) {
  const isSale = /^ *SALES INVOICE *$/m.test(b);
  const isRet = /^ *RETURN TRANSACTION *$/m.test(b);
  const isVoid = /^ *VOID TRANSACTION *$/m.test(b);
  if ((!isSale && !isRet && !isVoid) || isIgnored(b)) continue;
  const no = isSale
    ? (b.match(/^\s*SI\s+(\d{10,})\s*$/m) || [])[1]
    : isRet ? (b.match(/^RETURN#\s+(\d{10,})/m) || [])[1]
      : (b.match(/^VOID#\s+(\d{10,})/m) || [])[1];
  if (no) (isSale ? siSeen : isRet ? retSeen : voidSeen).add(Number(no));
  const date = (b.match(/Exact Date:\s*(\d{4}-\d{2}-\d{2})/) || b.match(/Date ?& ?Time\s+(\d{4}-\d{2}-\d{2})/) || [])[1];
  const gross = amt(b, 'Gross Sales');
  if (!date || !no || seen.has((isSale ? 'S' : isRet ? 'R' : 'V') + no) || gross === null) continue;
  seen.add((isSale ? 'S' : isRet ? 'R' : 'V') + no);
  const lessVat = amt(b, 'LESS 12% VAT') || 0;
  const d = days.get(date) || { sale: 0, ret: 0, void: 0, voidSc: 0 };
  if (isSale) d.sale += gross;
  else if (isRet) {
    // Z14 退货含税(与A账一致,折前不含SC): Gross + LessVAT
    d.ret += gross + lessVat;
  } else {
    // Z13 作废含税 = 票面 Amount:含 SC、按折扣冲回后的实冲净额
    // (2026-09-18 LUOJIA 实测:Z@09-15 = ΣAmount 9177.20,Σ(gross+lessVat) 8452.00
    //  差 725.20 恰为作废票 SC 合计;VOID6 gross -16592 折扣 15000,Z 按 -1592 计)
    const amount = amt(b, 'Amount');
    const sc = (b.match(/^Service Charge(?:\([^)]*\))? *(-?[\d,]+\.\d{2}) *$/m) || [])[1];
    d.void += amount !== null ? amount : gross + lessVat + (sc ? num(sc) : 0);
    if (sc) d.voidSc += Math.abs(num(sc)); // 作废票 SC 印负值,加回 Z1 基数取绝对值
  }
  days.set(date, d);
}

// ── 逐张校验 ──
const stats = { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0, z6: 0, z7: 0, z8: 0, z9: 0, z10: 0, z11: 0, z12: 0, z13: 0, z14: 0, z15: 0, xSeq: 0, xRange: 0 };
const problems = [];
const push = (k, msg) => { stats[k]++; if (stats[k] <= 5) problems.push(msg); };

// ── Z15 文件级覆盖：每张交易票（去重）的票面时间应落在某 Z 窗口 [Start, End] 内 ──
// 中段漏 Z / 漏导票在此暴露；末张 Z 之后的票属未结账期，不计。
{
  const wins = zs.map((z) => ({
    start: (z.body.match(/Start Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1],
    end: (z.body.match(/End Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1],
  })).filter((w) => w.start && w.end);
  const lastEnd = wins.length ? wins[wins.length - 1].end : null;
  const covSeen = new Set();
  for (const [idx, body] of blocks.entries()) {
    const isSale = /^ *SALES INVOICE *$/m.test(body);
    const isRet = /^ *RETURN TRANSACTION *$/m.test(body);
    const isVoid = /^ *VOID TRANSACTION *$/m.test(body);
    if ((!isSale && !isRet && !isVoid) || isIgnored(body)) continue;
    const time = (body.match(/Exact Date:?\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1]
      || (body.match(/Date ?& ?Time:?\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1];
    if (!time) continue;
    const no = isSale
      ? (body.match(/^\s*SI\s+(\d{10,})\s*$/m) || [])[1]
      : isRet
        ? (body.match(/^RETURN#\s+(\d{10,})\s*$/m) || [])[1]
        : (body.match(/^VOID#\s+(\d{10,})\s*$/m) || [])[1];
    const key = 'T' + (no || idx);
    if (covSeen.has(key)) continue;
    covSeen.add(key);
    const covered = wins.some((w) => time >= w.start && time <= w.end);
    if (!covered && lastEnd && time <= lastEnd) {
      stats.z15++;
      if (stats.z15 <= 5) push('z15', `[Z 覆盖] ${time} 不在任何 Z 窗口内（块#${idx}）`);
    }
  }
}

const longOf = (b, label) => {
  const m = b.match(new RegExp(`^${label}\\s+(\\d+)\\s*$`, 'm'));
  return m ? Number(m[1]) : null;
};
const checkGap = (tag, b, label, set) => {
  const beg = longOf(b, `Beg\\. ${label} #:`);
  const end = longOf(b, `End\\. ${label} #:`);
  if (beg === null || end === null || beg === 0 || end < beg) return 0;
  if (beg === end && !set.has(beg)) return 0; // 当日无该类单据，计数器不推进
  let missing = 0;
  for (let n = beg; n <= end; n++) {
    if (!set.has(n)) {
      missing++;
      if (missing <= 5) push('z11', `[Z11 缺号] ${tag}: 声明 ${label}# ${beg}~${end}，明细找不到 ${label}#${n}`);
    }
  }
  return missing;
};

for (let i = 0; i < zs.length; i++) {
  const z = zs[i];
  const tag = `Z@${z.bd || '?'}`;
  const b = z.body;

  // Z1 税分解。LESS VOID 含作废单的 SC(见 Z13 口径注释),而税分解四项不随之扣减,
  // 所以基数要加回当日作废票的 SC —— 2026-09-18 LUOJIA 实测:Z@09-15 差 725.20、
  // Z@09-16 差 53.00,均恰为当日作废票 SC 合计,加回后逐分吻合。
  const bk = z.vatable + z.vat + z.exempt + z.zero;
  const day1 = days.get(z.bd) || { sale: 0, ret: 0, void: 0, voidSc: 0 };
  const bkExpect = z.gross - z.lessRet - z.lessVoid - z.vatAdj - z.otherDisc + day1.voidSc;
  if (Math.abs(bk - bkExpect) > EPS) push('z1', `[Z1 税分解] ${tag}: 四项合计 ${bk.toFixed(2)}，基数 ${bkExpect.toFixed(2)}，差 ${(bk - bkExpect).toFixed(2)}`);

  // Z2 净额：GROSS − LESS DISCOUNT − LESS RETURN − LESS VOID − LESS VAT ADJUSTMENT = NET AMOUNT
  const netExpect = z.gross - z.lessDisc - z.lessRet - z.lessVoid - z.vatAdj;
  if (Math.abs(z.net - netExpect) > EPS) push('z2', `[Z2 净额] ${tag}: NET ${z.net.toFixed(2)}，应为 ${netExpect.toFixed(2)}`);

  // Z3 日销售
  if (Math.abs(z.present - z.previous - z.dayS) > EPS) push('z3', `[Z3 日销] ${tag}: ${z.present.toFixed(2)}−${z.previous.toFixed(2)}=${(z.present - z.previous).toFixed(2)}，票面 ${z.dayS.toFixed(2)}`);

  // Z4 折扣明细合计 = LESS DISCOUNT
  const discSum = DISC_ITEMS.reduce((a, l) => a + nz(amt(b, l)), 0);
  if (Math.abs(discSum - z.lessDisc) > EPS) push('z4', `[Z4 折扣] ${tag}: 明细合计 ${discSum.toFixed(2)}，LESS DISCOUNT ${z.lessDisc.toFixed(2)}`);

  // Z5 销售调整
  if (Math.abs(nz(amt(b, 'RETURN:')) - z.lessRet) > EPS || Math.abs(nz(amt(b, 'VOID:')) - z.lessVoid) > EPS) {
    push('z5', `[Z5 销售调整] ${tag}: RETURN ${nz(amt(b, 'RETURN:')).toFixed(2)}/${z.lessRet.toFixed(2)}，VOID ${nz(amt(b, 'VOID:')).toFixed(2)}/${z.lessVoid.toFixed(2)}`);
  }

  // Z6 VAT 调整明细合计 = LESS VAT ADJUSTMENT
  const vatAdjSum = VATADJ_ITEMS.reduce((a, l) => a + nz(amt(b, l)), 0);
  if (Math.abs(vatAdjSum - z.vatAdj) > EPS) push('z6', `[Z6 VAT调整] ${tag}: 明细合计 ${vatAdjSum.toFixed(2)}，LESS VAT ADJUSTMENT ${z.vatAdj.toFixed(2)}`);

  // Z10 日期段
  const start = (b.match(/Start Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1];
  const end = (b.match(/End Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1];
  if (!start || !end || start.slice(0, 10) !== end.slice(0, 10)
    || !start.endsWith('00:00:00') || !end.endsWith('23:59:59')
    || (z.time && z.time < start)) {
    push('z10', `[Z10 日期段] ${tag}: Start ${start} / End ${end} / Report ${z.time}`);
  }

  // Z11 号段缺号
  stats.z11 += checkGap(tag, b, 'SI', siSeen);
  stats.z11 += checkGap(tag, b, 'VOID', voidSeen);
  stats.z11 += checkGap(tag, b, 'RETURN', retSeen);

  // Z12/Z13/Z14 明细交叉（含税口径）
  const d = days.get(z.bd) || { sale: 0, ret: 0, void: 0 };
  if (Math.abs(z.gross - d.sale) > EPS) push('z12', `[Z12 毛额] ${tag}: Z ${z.gross.toFixed(2)}，当日销售票合计 ${d.sale.toFixed(2)}，差 ${(z.gross - d.sale).toFixed(2)}`);
  const retFull = z.lessRet + z.vatOnRet;
  if (Math.abs(retFull - Math.abs(d.ret)) > EPS) push('z14', `[Z14 退货] ${tag}: Z 含税 ${retFull.toFixed(2)}，当日退货票合计 ${Math.abs(d.ret).toFixed(2)}，差 ${(retFull - Math.abs(d.ret)).toFixed(2)}`);
  const voidFull = z.lessVoid + z.vatOnVoid;
  if (Math.abs(voidFull - Math.abs(d.void)) > EPS) push('z13', `[Z13 作废] ${tag}: Z 含税 ${voidFull.toFixed(2)}，当日作废票合计 ${Math.abs(d.void).toFixed(2)}，差 ${(voidFull - Math.abs(d.void)).toFixed(2)}`);

  // Z7/Z8/Z9 跨报表连续性
  if (i > 0) {
    const p = zs[i - 1];
    if (z.zc && p.zc && Number(z.zc) !== Number(p.zc) + 1) push('z7', `[Z7 计数器] ${tag}: 上期 ${p.zc} → 本期 ${z.zc}，非连续`);
    // Z-counter 按天维度累加:每日恰好一张 Z,营业日逐日连续(2026-09-18 业务确认)
    if (z.bd && p.bd && z.bd !== '?') {
      if (z.bd === p.bd) {
        push('z7', `[Z7 计数器] ${tag}: 营业日 ${z.bd} 出现第二张 Z（应每日一张）`);
      } else {
        const d0 = Date.parse(p.bd);
        const d1 = Date.parse(z.bd);
        if (!Number.isNaN(d0) && !Number.isNaN(d1) && d1 - d0 !== 86400000) {
          push('z7', `[Z7 计数器] ${tag}: 营业日 ${p.bd} → ${z.bd} 跳档（counter 按天累加，日期应逐日连续）`);
        }
      }
    }
    if (Math.abs(z.previous - p.present) > EPS) push('z8', `[Z8 累计链] ${tag}: 本期上期累计 ${z.previous.toFixed(2)} ≠ 上期本期累计 ${p.present.toFixed(2)}`);
    const begSi = longOf(b, 'Beg\\. SI #:');
    const prevEnd = longOf(p.body, 'End\\. SI #:');
    if (begSi !== null && prevEnd !== null && prevEnd !== 0 && z.dayS !== 0 && begSi <= prevEnd) {
      push('z9', `[Z9 SI 段] ${tag}: 上期 End ${prevEnd} ≥ 本期 Beg ${begSi}，号段重叠`);
    }
  }
}

// ── 输出 ──
const line = '='.repeat(62);
console.log(`\n${line}`);
console.log(` Z-READING 勾稽 — ${zs.length} 张 Z 报表 / 覆盖 ${new Set(zs.map((z) => z.bd)).size} 个营业日`);
console.log(` 文件 ${file.split(/[\\/]/).pop()}`);
console.log(line);
// ── X-READING(班次切分):同日 SI 段首尾相接 + 落在 Z 号段(允许跨午夜班次/无销售班次沿用上期末号) ──
{
  const longOf2 = (b2, label) => {
    const m = b2.match(new RegExp(`^${label}\s+(\d+)\s*$`, 'm'));
    return m ? Number(m[1]) : null;
  };
  const xByDay = new Map();
  for (const [idx, b2] of blocks.entries()) {
    if (!/^ *X-READING *$/m.test(b2) || isIgnored(b2)) continue;
    const sd = (b2.match(/Start Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || '?';
    const time = (b2.match(/Report Date ?& ?Time:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/) || [])[1] || '';
    if (!xByDay.has(sd)) xByDay.set(sd, []);
    xByDay.get(sd).push({ time, body: b2 });
  }
  for (const [sd, dayX] of xByDay) {
    dayX.sort((a2, b3) => a2.time.localeCompare(b3.time));
    let prevEnd = null;
    for (const x of dayX) {
      const beg = longOf2(x.body, 'Beg\. SI #:');
      const end = longOf2(x.body, 'End\. SI #:');
      if (beg === null || end === null || end < beg) continue;
      if (prevEnd !== null && beg !== prevEnd + 1 && beg !== prevEnd) {
        stats.xSeq++;
        if (stats.xSeq <= 5) push('xSeq', `[X 衔接] ${sd} X@${x.time}: SI ${beg} 接不上前班次末号 ${prevEnd}`);
      }
      prevEnd = end;
    }
    const z = zs.find((z2) => z2.bd === sd);
    if (!z) continue;
    const zBeg = longOf2(z.body, 'Beg\. SI #:');
    if (zBeg === null) continue;
    // 终值默认取当日 Z 自己的 End;末班次跨午夜且止日 Z 已存在时才延伸为止日 Z 的 End。
    // 踩过(2026-09-18 SANNIU):末班次 X@09-11 00:56 跨午夜,止日 Z@09-11 未结账不存在,
    // 旧实现退化成 zBeg → X 10945~10966 被误判越出 Z 段 10931~10931。
    let zEndFinal = longOf2(z.body, 'End\. SI #:') ?? zBeg;
    const lastDay = dayX.length && dayX[dayX.length - 1].time
      ? dayX[dayX.length - 1].time.slice(0, 10) : sd;
    if (lastDay !== sd) {
      for (const z2 of zs) {
        if (z2.bd === lastDay) {
          const e2 = longOf2(z2.body, 'End\. SI #:');
          if (e2 !== null) zEndFinal = e2;
        }
      }
    }
    for (const x of dayX) {
      const beg = longOf2(x.body, 'Beg\. SI #:');
      const end = longOf2(x.body, 'End\. SI #:');
      if (beg === null || end === null) continue;
      let ok = (beg >= zBeg && end <= zEndFinal) || (beg === zBeg - 1 && end === beg);
      // X-READING 支持跨天班次(业务确认): X报表时间在另一天 = 跨天班次,放宽
      if (!ok && x.time && sd !== x.time.slice(0, 10)) ok = true;
      if (!ok) {
        stats.xRange++;
        if (stats.xRange <= 5) push('xRange', `[X 号段] ${sd} X@${x.time}: SI ${beg}~${end} 越出 Z 号段 ${zBeg}~${zEndFinal}`);
      }
    }
  }
}

const rows = [
  ['Z1 税分解 = 毛额-退货-作废-VAT调整-其他折扣', stats.z1],
  ['Z2 净额 = 毛额-折扣-退货-作废-VAT调整', stats.z2],
  ['Z3 日销售 = 本期累计-上期累计', stats.z3],
  ['Z4 折扣明细合计 = LESS DISCOUNT', stats.z4],
  ['Z5 销售调整 = LESS RETURN / LESS VOID', stats.z5],
  ['Z6 VAT调整明细合计 = LESS VAT ADJUSTMENT', stats.z6],
  ['Z7 Z Counter 逐日+1 且营业日连续（每日一张）', stats.z7],
  ['Z8 累计销售链首尾相接', stats.z8],
  ['Z9 SI 号段不重叠', stats.z9],
  ['Z10 报表日期段规范', stats.z10],
  ['Z11 号段内无缺号（SI/VOID/RETURN）', stats.z11],
  ['Z12 毛额 = 当日销售票合计', stats.z12],
  ['Z13 作废额 = 当日作废票合计（含税）', stats.z13],
  ['Z14 退货额 = 当日退货票合计（含税）', stats.z14],
  ['Z15 交易票均在 Z 窗口内（末日之前）', stats.z15],
  ['X 班次 SI 段首尾相接（同日内）', stats.xSeq],
  ['X 班次 SI 段 ⊆ Z 号段（跨日班次允许）', stats.xRange],
];
for (const [label, n] of rows) {
  console.log(`  ${n === 0 ? '✅' : '❌'} ${label.padEnd(44)} 异常 ${n}`);
}
if (problems.length) {
  console.log('\n明细（每类最多 5 条）:');
  problems.forEach((p) => console.log('   ' + p));
}
const total = rows.reduce((a, [, n]) => a + n, 0);
console.log(`\n${line}`);
console.log(total === 0 ? ' 结论: Z-READING 勾稽全部通过 ✅' : ` 结论: 发现 ${total} 处 Z 勾稽问题 ❌`);
console.log(line);
