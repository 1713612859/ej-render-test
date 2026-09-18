/**
 * EJ 内容完整性：校验每张交易票的「订单信息」与「商品信息」是否配套。
 *
 * audit-ej.mjs 只看结构与排版，audit-amounts.mjs 只看算术；两者都会漏掉
 * 「有订单、没商品」这类内容缺失 —— audit-amounts 的 D 项写的是
 * `if (rows.length && gross !== null)`，商品行为 0 的票直接被跳过，不报错。
 * 本脚本补的就是这个口子。
 *
 * 校验项（口径以真实票面为准）：
 *
 *  1. 商品区存在   每张 SALE/RETURN/VOID 票都必须有 "Description Qty U.Price Amount" 表头。
 *  2. 商品行非空   表头之下必须至少有 1 条商品行 —— 这就是「有订单信息但没有商品信息」。
 *  3. 商品名非空   每条商品行上方必须有非空描述行，且不得是 null/undefined 之类占位。
 *  4. 数量非零     Qty 为 0 的行视为脏数据（退货/作废的负数量是正常的）。
 *  5. 行数勾稽     商品行条数 = "Number of Items"。**仅销售票** ——
 *                  returnReceipt.ts / voidReceipt.ts 模板不输出这两行（已核对输出）。
 *  6. 数量勾稽     各行 Qty 之和 = "Total Qty"。同样仅销售票。
 *  7. 订单头字段   销售票 SI / Billing# / Cashier / TERMINAL# / Exact Date 齐全且非空；
 *                  退货票 RETURN# / SI# / Date&Time，作废票 VOID# / Sales SI# / Date&Time。
 *
 * 用法: node js/audit-content.mjs <txt路径>
 *
 * 重打单与后厨/BILLING 辅助单据不参与校验（见 audit-ignore.mjs）。
 */
import { readFileSync } from 'node:fs';
import { isIgnored } from './audit-ignore.mjs';

const file = process.argv[2];
if (!file) {
  console.error('用法: node js/audit-content.mjs <txt路径>');
  process.exit(1);
}

const text = readFileSync(file, 'utf8').replace(/^﻿/, '');
const blocks = text.split('\n   \n').filter((b) => b.trim());

const num = (s) => parseFloat(String(s).replace(/,/g, ''));

/**
 * 商品行：缩进的 "数量  单价  金额[ V/E/Z]"，与 audit-amounts.mjs 同口径。
 *
 * 数量必须允许小数：称重商品与半份菜会印 0.5 / 0.38 这类值。
 * 2026-08-31 生产核查踩过 —— 只匹配整数会把这类票误判成「0 条商品行」。
 */
const ITEM_ROW =
  /^\s+(-?\d+(?:\.\d+)?)\s{2,}(-?[\d,]+\.\d{2})\s{2,}(-?[\d,]+\.\d{2})\s*[VEZ]?\s*$/;

/** 数量容差。数量可为小数，比较一律走容差，不用 ===。 */
const QTY_EPS = 1e-6;
const SEP = /^-{10,}$/;
const HEADER = /^Description\s+Qty\s+U\.Price\s+Amount\s*$/;
const PLACEHOLDER = /^(null|undefined|NaN|-|--|TBD|N\/A)$/i;

/** 取商品区：表头行之后，到下一条分隔线为止（表头自身下面紧跟一条分隔线，跳过）。 */
function itemRegion(lines) {
  const h = lines.findIndex((l) => HEADER.test(l));
  if (h < 0) return null;
  let start = h + 1;
  if (SEP.test(lines[start])) start++;
  let end = start;
  while (end < lines.length && !SEP.test(lines[end])) end++;
  return lines.slice(start, end);
}

/** 把商品区拆成 { name, qty, price, amount }：商品行之前的非行文本即名称（可跨行）。 */
function parseItems(region) {
  const items = [];
  let nameBuf = [];
  for (const l of region) {
    const m = l.match(ITEM_ROW);
    if (m) {
      items.push({
        name: nameBuf.join('').trim(),
        qty: Number(m[1]),
        price: num(m[2]),
        amount: num(m[3]),
      });
      nameBuf = [];
    } else if (l.trim()) {
      nameBuf.push(l.trim());
    }
  }
  return items;
}

const intOf = (b, label) => {
  const m = b.match(new RegExp(`^${label}\\s+(-?\\d+)\\s*$`, 'm'));
  return m ? Number(m[1]) : null;
};

/**
 * 取「标签 + 数字（可含小数）」行。
 * Total Qty 在称重/半份商品场景会印成 0.5 这类小数，用 intOf 读会拿到 null，
 * 导致「数量合计 = Total Qty」静默跳过而非真的通过。
 */
const decimalOf = (b, label) => {
  const m = b.match(new RegExp(`^${label}\\s+(-?\\d+(?:\\.\\d+)?)\\s*$`, 'm'));
  return m ? Number(m[1]) : null;
};

/** 字段值：取标签后的内容，缺标签返回 null，标签在但值为空返回 ''。 */
function fieldOf(b, label) {
  const m = b.match(new RegExp(`^${label}\\s*(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

/** 票面 SI 号，与 audit-amounts.mjs 同口径，用于问题定位。 */
function siOf(b, idx) {
  const m =
    b.match(/^\s*SI\s+(\d{10,})\s*$/m) ||
    b.match(/^SI#\s+(\d{10,})\s*$/m) ||
    b.match(/^Sales SI#\s+(\d{10,})\s*$/m);
  return m ? m[1].replace(/^0+/, '') || '0' : `块#${idx}`;
}

const stats = {
  sale: 0, ret: 0, void: 0,
  noRegion: 0, noItem: 0, noName: 0, badName: 0, zeroQty: 0,
  cntMismatch: 0, qtyMismatch: 0, missField: 0, lineAmt: 0, signErr: 0, cashBad: 0,
};
const problems = [];
const push = (key, msg) => {
  stats[key]++;
  if (stats[key] <= 10) problems.push(msg);
};

for (const [idx, b] of blocks.entries()) {
  const isSale = /^ *SALES INVOICE *$/m.test(b);
  const isRet = /^ *RETURN TRANSACTION *$/m.test(b);
  const isVoid = /^ *VOID TRANSACTION *$/m.test(b);
  if ((!isSale && !isRet && !isVoid) || isIgnored(b)) continue;

  const type = isSale ? 'SALE' : isRet ? 'RETURN' : 'VOID';
  stats[isSale ? 'sale' : isRet ? 'ret' : 'void']++;
  const tag = `${type} SI ${siOf(b, idx)} (块#${idx})`;

  // ── 1 商品区 ──
  const region = itemRegion(b.split('\n'));
  if (!region) {
    push('noRegion', `[1 无商品区] ${tag}: 整张票没有 Description/Qty/U.Price 表头`);
    continue;
  }

  const items = parseItems(region);

  // ── 2 商品行（核心：有订单信息但没有商品信息）──
  if (items.length === 0) {
    const orphan = region.filter((l) => l.trim()).length;
    push(
      'noItem',
      `[2 无商品行] ${tag}: 有订单头和金额，但商品区 0 条商品行` +
        `（区内残留 ${orphan} 行文本）`,
    );
  }

  for (const it of items) {
    // ── 3 商品名 ──
    if (!it.name) {
      push('noName', `[3 缺商品名] ${tag}: 数量 ${it.qty} 金额 ${it.amount} 的行没有描述`);
    } else if (PLACEHOLDER.test(it.name)) {
      push('badName', `[3 商品名占位] ${tag}: 商品名为 "${it.name}"`);
    }
    // ── 4 数量 ──
    if (Math.abs(it.qty) < QTY_EPS) {
      push('zeroQty', `[4 数量为零] ${tag}: "${it.name}" 数量 0`);
    }
    // 行内勾稽:单价×数量=金额(容差 0.02 容纳票面两位小数舍入)。
    // 2026-09 租户115 A账串单(3×998 替换 1×160 一类)导出到票面后此前全部放行,此检查兜住。
    // 符号规范:销售票行 >=0,退货/作废票行 <=0(票样核实:退废行 qty/amount 均为负)
    if (isSale ? (it.qty < -QTY_EPS || it.amount < -0.005)
               : (it.qty > QTY_EPS || it.amount > 0.005)) {
      push('signErr', `[符号异常] ${tag}: "${it.name}" qty=${it.qty} amount=${it.amount}(${isSale ? '销售' : '退废'}票应为${isSale ? '非负' : '非正'})`);
    }
    // 金额是权威;单价(净额反算两位)/数量(称重舍两位)的合法舍入取比例容差,真脏行照报
    const lineTol = Math.max(0.02, Math.max(Math.abs(it.qty) * 0.0055, it.price * 0.0055));
    if (Math.abs(it.qty * it.price - it.amount) > lineTol) {
      push(
        'lineAmt',
        `[行金额不符] ${tag}: "${it.name}" ${it.qty} × ${it.price} = ` +
          `${(it.qty * it.price).toFixed(3)}，票面 ${it.amount}`,
      );
    }
  }

  // ── 5 / 6 计数勾稽：仅销售票有这两行 ──
  if (isSale) {
    const nItems = intOf(b, 'Number of Items');
    const totalQty = decimalOf(b, 'Total Qty');
    if (nItems !== null && nItems !== items.length) {
      push(
        'cntMismatch',
        `[5 行数不符] ${tag}: 解析出 ${items.length} 条商品行，票面 Number of Items ${nItems}`,
      );
    }
    const qtySum = items.reduce((a, it) => a + it.qty, 0);
    if (totalQty !== null && Math.abs(totalQty - qtySum) > QTY_EPS) {
      push(
        'qtyMismatch',
        `[6 数量不符] ${tag}: 各行 Qty 合计 ${qtySum}，票面 Total Qty ${totalQty}`,
      );
    }
  }

  // ── 7 订单头字段 ──
  const required = isSale
    ? ['SI', 'Billing#:', 'Cashier:', 'TERMINAL#:', 'Exact Date:']
    : isRet
      ? ['RETURN#', 'SI#', 'Date&Time']
      // 作废票印的是 "Sales SI#"，退货票印 "SI#" —— 标签不统一，勿合并
      : ['VOID#', 'Sales SI#', 'Date&Time'];
  for (const f of required) {
    const v = f === 'SI' ? (b.match(/^\s*SI\s+(\S+)\s*$/m) || [])[1] ?? null : fieldOf(b, f);
    if (v === null) push('missField', `[7 缺字段] ${tag}: 没有 "${f}" 行`);
    else if (v === '') push('missField', `[7 空字段] ${tag}: "${f}" 值为空`);
  }
}

const line = '='.repeat(62);
console.log(`\n${line}`);
console.log(` 内容完整性 — 销售 ${stats.sale} / 退货 ${stats.ret} / 作废 ${stats.void} 张`);
console.log(` 文件 ${file.split(/[\\/]/).pop()}`);
console.log(line);
// ── CASH IN / CASH OUT(轻量:金额行存在;SHORT/OVER 恒等式仅提示——实物盘点值) ──
{
  const amountLine = (b2, label) => {
    const m = b2.match(new RegExp(`^${label}\\s+(-?[\\d,]+\\.\\d{2})\\s*$`, 'm'));
    return m ? num(m[1]) : null;
  };
  for (const [idx, b2] of blocks.entries()) {
    const isCashIn = /^ *CASH IN *$/m.test(b2);
    const isCashOut = /^ *CASH OUT *$/m.test(b2);
    if ((!isCashIn && !isCashOut) || isIgnored(b2)) continue;
    if (isCashIn) {
      if (amountLine(b2, 'CASH IN') === null) {
        stats.cashBad++;
        if (stats.cashBad <= 10) problems.push(`[CASH IN] 块#${idx}: 缺金额行 "CASH IN <金额>"`);
      }
    } else {
      const sales = amountLine(b2, 'CASH SALES');
      const out = amountLine(b2, 'CASH OUT');
      const so = (b2.match(/^\(-\)SHORT\/\(\+\)OVER\s*([+-][\d,]+\.\d{2})\s*$/m) || [])[1];
      if (sales === null || out === null || so === undefined) {
        stats.cashBad++;
        if (stats.cashBad <= 10) problems.push(`[CASH OUT] 块#${idx}: 浮点对账行不全`);
      }
    }
  }
}

const rowsOut = [
  ['1 商品区表头存在', stats.noRegion],
  ['2 商品行 ≥ 1（有订单必有商品）', stats.noItem],
  ['3 商品名非空', stats.noName],
  ['3 商品名非占位值', stats.badName],
  ['4 商品数量非零', stats.zeroQty],
  ['4.5 行金额 = 单价×数量', stats.lineAmt],
  ['4.6 符号规范(销售≥0/退废≤0)', stats.signErr],
  ['4.7 CASH IN/OUT 金额行', stats.cashBad],
  ['5 商品行数 = Number of Items（仅销售票）', stats.cntMismatch],
  ['6 数量合计 = Total Qty（仅销售票）', stats.qtyMismatch],
  ['7 订单头关键字段齐全', stats.missField],
];
for (const [label, n] of rowsOut) {
  console.log(`  ${n === 0 ? '✅' : '❌'} ${label.padEnd(42)} 异常 ${n}`);
}
if (problems.length) {
  console.log('\n明细（每类最多 10 条）:');
  problems.forEach((p) => console.log('   ' + p));
}
const total = rowsOut.reduce((a, [, n]) => a + n, 0);
console.log(`\n${line}`);
console.log(total === 0 ? ' 结论: 内容完整，未发现缺失 ✅' : ` 结论: 发现 ${total} 处内容问题 ❌`);
console.log(line);
