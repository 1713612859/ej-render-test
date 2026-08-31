/**
 * EJ 金额勾稽：逐张校验小票内部的算术关系是否自洽。
 *
 * 各校验项的口径（均以真实票面核对过，勿凭直觉修改）：
 *
 *  A. 应付   Amount(Due) = Gross - LESS 12% VAT - Discount + Add 12% VAT + Service Charge
 *            注意 Service Charge 在销售票上带百分比 "Service Charge(10%)"，
 *            在作废/退货票上不带 —— 正则必须两者都吃。
 *
 *  B. 税分解 VATable + VAT + Exempt + Zero = Gross - LESS VAT + Add VAT
 *            **不减折扣**。SC/PWD 的口径是先剥 VAT（336→300）再对 300 打 20%，
 *            所以税分解的基数是"剥完 VAT 的毛额"，折扣不参与。
 *
 *  C. 收付   支付合计 - 找零 = 应付
 *            **仅对销售票成立**。voidReceipt.ts / returnReceipt.ts 模板不输出
 *            CHANGE 行（已核对源码），作废/退货票的支付行是原单全额冲销，
 *            与应付天然不等，不参与本项校验。
 *
 *  D. 行合计 各商品行 Amount 之和 = Gross Sales
 *            退货票会列出原单全部商品（含未退的），部分退货时不等，单独统计。
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const text = readFileSync(file, 'utf8').replace(/^﻿/, '');
const blocks = text.split('\n   \n').filter((b) => b.trim());

// 容忍分位四舍五入。放宽到 0.1 是为了放过政府折扣单的分组舍入累积误差：
// 多组 SC/PWD 时 LESS 12% VAT 按组各自四舍五入，合计后与整单基数可差到 0.04
// （已见于 SI 26 的税分解），组数更多时还会继续累积。
// 代价：0.1 以内的真实算错不会再报出，排查个案时可临时调小此值复查。
const EPS = 0.1;

const num = (s) => parseFloat(String(s).replace(/,/g, ''));

function amountOf(block, label) {
  const re = new RegExp(
    `^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+(-?[\\d,]+\\.\\d{2})\\s*$`,
    'm',
  );
  const m = block.match(re);
  return m ? num(m[1]) : null;
}

const amountDue = (b) => {
  const m = b.match(/^(?:Amount Due|Amount)\s+(-?[\d,]+\.\d{2})\s*$/m);
  return m ? num(m[1]) : null;
};

/** 服务费：销售票 "Service Charge(10%)"，作废/退货票 "Service Charge" */
const serviceCharge = (b) => {
  const m = b.match(/^Service Charge(?:\([^)]*\))?\s+(-?[\d,]+\.\d{2})\s*$/m);
  return m ? num(m[1]) : 0;
};

/** 票面 SI 号：只认独占一行的 "SI <16位>"，避免误抓 Billing#/VOID#/RETURN# */
function siOf(b, idx) {
  const m =
    b.match(/^\s*SI\s+(\d{10,})\s*$/m) ||
    b.match(/^Sales SI#\s+(\d{10,})\s*$/m) ||
    b.match(/^SI#\s+(\d{10,})\s*$/m);
  return m ? m[1].replace(/^0+/, '') || '0' : `块#${idx}`;
}

/** 票面实际印的支付方式标签。注意是 MAYA 不是 PAYMAYA —— 漏了会误判分账支付不平。 */
const PAY_METHODS = [
  'CASH', 'GCASH', 'CREDIT', 'DEBIT', 'MAYA', 'PAYMAYA', 'QRPH',
  'WECHAT', 'ALIPAY', 'STORED VALUE CARD', 'GIFT CHECK', 'POINTS',
  'MEMBER BALANCE',
];

const stats = { sale: 0, ret: 0, void: 0, a: 0, b: 0, c: 0, d: 0, dPartial: 0 };
const problems = [];

for (const [idx, b] of blocks.entries()) {
  const isSale = /^ *SALES INVOICE *$/m.test(b);
  const isRet = /^ *RETURN TRANSACTION *$/m.test(b);
  const isVoid = /^ *VOID TRANSACTION *$/m.test(b);
  if (!isSale && !isRet && !isVoid) continue;

  const type = isSale ? 'SALE' : isRet ? 'RETURN' : 'VOID';
  stats[isSale ? 'sale' : isRet ? 'ret' : 'void']++;
  const si = siOf(b, idx);
  const tag = `${type} SI ${si} (块#${idx})`;

  const gross = amountOf(b, 'Gross Sales');
  const due = amountDue(b);
  const svc = serviceCharge(b);

  // 多组政府折扣时 LESS/ADD VAT 与 Discount NN% 会各出现多行，必须全部累加
  const sumAll = (re) =>
    [...b.matchAll(re)].reduce((a, m) => a + num(m[1]), 0);
  const lessVat = sumAll(/^LESS 12% VAT\s+(-?[\d,]+\.\d{2})\s*$/gm);
  const addVat = sumAll(/^Add 12% VAT\s+(-?[\d,]+\.\d{2})\s*$/gm);
  const govDisc = sumAll(/^Discount \d+%\s+(-?[\d,]+\.\d{2})\s*$/gm);
  const regDisc = sumAll(/^Regular Discount\s+(-?[\d,]+\.\d{2})\s*$/gm);

  // 退货/作废票上金额整体取负，但折扣行仍印正数(模板取绝对值)，
  // 所以折扣对总额是"冲回"(加)而非"扣减"(减)。
  const ds = isSale ? -1 : +1;

  // ── A 应付 ──
  if (gross !== null && due !== null) {
    const expect = gross - lessVat + addVat + ds * (govDisc + regDisc) + svc;
    if (Math.abs(expect - due) > EPS) {
      stats.a++;
      if (stats.a <= 10) {
        problems.push(
          `[A 应付] ${tag}: Gross ${gross} - LessVAT ${lessVat} + AddVAT ${addVat}` +
            ` ${ds > 0 ? '+' : '-'} Disc ${(govDisc + regDisc).toFixed(2)} + SC ${svc}` +
            ` = ${expect.toFixed(2)}，票面 ${due}`,
        );
      }
    }
  }

  // ── B 税分解 ──
  // 基数 = 毛额 - LessVAT + AddVAT，再冲减【普通折扣】。
  // 政府折扣(Discount NN%)不参与：SC/PWD 的口径是先剥 VAT 再打折，
  // 剥 VAT 已由 LessVAT 体现，税分解反映的就是剥完 VAT 的额度。
  const vatable = amountOf(b, 'VATable Sales');
  const vat = amountOf(b, 'VAT Amount (12%)');
  const exempt = amountOf(b, 'VAT Exempt Sales');
  const zero = amountOf(b, 'Zero Rated Sales');
  if ([vatable, vat, exempt, zero, gross].every((v) => v !== null)) {
    const base = gross - lessVat + addVat + ds * regDisc;
    const sum = vatable + vat + exempt + zero;
    if (Math.abs(sum - base) > EPS) {
      stats.b++;
      if (stats.b <= 10) {
        problems.push(
          `[B 税分解] ${tag}: ${vatable}+${vat}+${exempt}+${zero} = ${sum.toFixed(2)}，` +
            `基数 ${base.toFixed(2)}`,
        );
      }
    }
  }

  // ── C：仅销售票 ──
  if (isSale && due !== null) {
    let paid = 0;
    let hasPay = false;
    for (const m of PAY_METHODS) {
      const v = amountOf(b, m);
      if (v !== null) {
        paid += v;
        hasPay = true;
      }
    }
    const change = amountOf(b, 'CHANGE') ?? 0;
    if (hasPay && Math.abs(paid - change - due) > EPS) {
      stats.c++;
      if (stats.c <= 10) {
        problems.push(
          `[C 收付] ${tag}: 支付 ${paid.toFixed(2)} - 找零 ${change} = ` +
            `${(paid - change).toFixed(2)}，应付 ${due}`,
        );
      }
    }
  }

  // ── D ──
  // 数量允许小数（称重/半份商品印 0.5、0.38），与 audit-content.mjs 的 ITEM_ROW 同口径。
  const rows = [
    ...b.matchAll(
      /^\s+-?\d+(?:\.\d+)?\s{2,}-?[\d,]+\.\d{2}\s{2,}(-?[\d,]+\.\d{2})\s*[VEZ]?\s*$/gm,
    ),
  ];
  if (rows.length && gross !== null) {
    const sum = rows.reduce((a, m) => a + num(m[1]), 0);
    if (Math.abs(sum - gross) > EPS) {
      if (isRet) {
        stats.dPartial++; // 退货票列原单全部商品，部分退货时不等，属预期
      } else {
        stats.d++;
        if (stats.d <= 10) {
          problems.push(
            `[D 行合计] ${tag}: ${rows.length} 行合计 ${sum.toFixed(2)}，Gross ${gross}`,
          );
        }
      }
    }
  }
}

const line = '='.repeat(62);
console.log(`\n${line}`);
console.log(` 金额勾稽 — 销售 ${stats.sale} / 退货 ${stats.ret} / 作废 ${stats.void} 张`);
console.log(line);
const rowsOut = [
  ['A 应付 = 毛额 - LessVAT - 折扣 + AddVAT + 服务费', stats.a],
  ['B 税分解合计 = 毛额 - LessVAT + AddVAT', stats.b],
  ['C 支付 - 找零 = 应付（仅销售票）', stats.c],
  ['D 商品行合计 = Gross Sales（退货票除外）', stats.d],
];
for (const [label, n] of rowsOut) {
  console.log(`  ${n === 0 ? '✅' : '❌'} ${label.padEnd(48)} 异常 ${n}`);
}
console.log(`  ℹ  退货票行合计 ≠ Gross 的 ${stats.dPartial} 张（列出原单全部商品，部分退货属预期）`);
if (problems.length) {
  console.log('\n明细:');
  problems.forEach((p) => console.log('   ' + p));
}
console.log(line);
