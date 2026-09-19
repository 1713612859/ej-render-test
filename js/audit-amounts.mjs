/**
 * EJ 金额勾稽：逐张校验小票内部的算术关系是否自洽。
 *
 * 各校验项的口径（均以真实票面核对过，勿凭直觉修改）：
 *
 *  A. 应付   Amount(Due) = Gross - LESS 12% VAT - Discount + Add 12% VAT + Service Charge
 *            注意 Service Charge 在销售票上带百分比 "Service Charge(10%)"，
 *            在作废/退货票上不带 —— 正则必须两者都吃。
 *            退货/作废票整体为负数：LESS VAT / Discount 行印正值（模板取绝对值），
 *            对总额是"冲回"(加)；SC 行印带符号负值。即各调整项方向与销售票相反。
 *
 *  B. 税分解 VATable + VAT + Exempt + Zero = Gross - LESS VAT + Add VAT（再冲减普通折扣）
 *            **不减政府折扣**。SC/PWD 的口径是先剥 VAT（336→300）再对 300 打 20%，
 *            所以税分解的基数是"剥完 VAT 的毛额"，政府折扣不参与；
 *            退货/作废票符号方向同样整体反转（Gross + LessVAT ± 普通折扣）。
 *
 *  C. 收付   支付合计 - 找零 = 应付
 *            **仅对销售票成立**。voidReceipt.ts / returnReceipt.ts 模板不输出
 *            CHANGE 行（已核对源码），作废/退货票的支付行是原单全额冲销，
 *            与应付天然不等，不参与本项校验。
 *
 *  D. 行合计 销售票：各商品行 Amount 之和 = Gross Sales（行价 = 原价）。
 *            退货/作废票：行价 = 实退/实冲净额（折扣与 VAT 调整已摊进行价），
 *            故 行合计 + Service Charge = Amount（实退总额）。
 *
 * 重打单与后厨/BILLING 辅助单据不参与校验（见 audit-ignore.mjs）。
 */
import { readFileSync } from 'node:fs';
import { isIgnored } from './audit-ignore.mjs';

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

/**
 * 票面实际印的支付方式标签（全量 EJ 实测：空格/下划线两种写法并存，都要收）：
 * CREDIT CARD ×10 + CREDIT_CARD ×6、DEBIT CARD ×3 + DEBIT_CARD ×2、
 * MEMBER BALANCE ×26 + MEMBER_BALANCE ×16、STORED_VALUE_CARD ×2、
 * FOODPANDA_PAY ×10、GRAB_PAY ×6。
 */
const PAY_METHODS = [
  'CASH', 'GCASH',
  'CREDIT CARD', 'CREDIT_CARD', 'DEBIT CARD', 'DEBIT_CARD',
  'MAYA', 'PAYMAYA', 'QRPH', 'WECHAT', 'ALIPAY',
  'STORED VALUE CARD', 'STORED_VALUE_CARD', 'GIFT CHECK', 'GIFT_CHECK',
  'POINTS', 'MEMBER BALANCE', 'MEMBER_BALANCE',
  'FOODPANDA_PAY', 'GRAB_PAY',
];

const stats = { sale: 0, ret: 0, void: 0, a: 0, b: 0, c: 0, d: 0, e: 0, c2: 0, c3: 0, w: 0 };
const problems = [];
const warns = [];

for (const [idx, b] of blocks.entries()) {
  const isSale = /^ *SALES INVOICE *$/m.test(b);
  const isRet = /^ *RETURN TRANSACTION *$/m.test(b);
  const isVoid = /^ *VOID TRANSACTION *$/m.test(b);
  if ((!isSale && !isRet && !isVoid) || isIgnored(b)) continue;

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

  // 符号口径：销售票 Gross - LessVAT + AddVAT - Disc + SC；
  // 退货/作废票整体为负，各调整项方向全部反转 —— LessVAT/Disc 行印正值起
  // "冲回"作用(加)，SC 行印带符号负值。s = +1 销售 / -1 退货·作废。
  const s = isSale ? 1 : -1;

  // ── A 应付 ──
  if (gross !== null && due !== null) {
    const expect = gross - s * lessVat + s * addVat - s * (govDisc + regDisc) + svc;
    if (Math.abs(expect - due) > EPS) {
      stats.a++;
      if (stats.a <= 10) {
        problems.push(
          `[A 应付] ${tag}: Gross ${gross} ${s > 0 ? '-' : '+'} LessVAT ${lessVat}` +
            ` ${s > 0 ? '+' : '-'} AddVAT ${addVat} ${s > 0 ? '-' : '+'} Disc ${(govDisc + regDisc).toFixed(2)}` +
            ` + SC ${svc} = ${expect.toFixed(2)}，票面 ${due}`,
        );
      }
    }
  }

  // ── B 税分解 ──
  // 基数 = 毛额 - LessVAT + AddVAT，再冲减【普通折扣】（退货/作废方向反转）。
  // 政府折扣(Discount NN%)不参与：SC/PWD 的口径是先剥 VAT 再打折，
  // 剥 VAT 已由 LessVAT 体现，税分解反映的就是剥完 VAT 的额度。
  const vatable = amountOf(b, 'VATable Sales');
  const vat = amountOf(b, 'VAT Amount (12%)');
  const exempt = amountOf(b, 'VAT Exempt Sales');
  const zero = amountOf(b, 'Zero Rated Sales');
  if ([vatable, vat, exempt, zero, gross].every((v) => v !== null)) {
    const base = gross - s * lessVat + s * addVat - s * regDisc;
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
    // E 欠款探针:应付>0 却一条支付行都没有 —— C 只在有支付行时成立,
    // 缺支付行时静默通过。139 租户"撕裂单"即此形态,故单列。
    // C3 找零来源:CHANGE>0 必须有 CASH 支付行——电子支付不产生找零
    if (change > EPS && amountOf(b, 'CASH') === null) {
      stats.c3++;
      if (stats.c3 <= 10) {
        problems.push(`[C3 找零来源] ${tag}: CHANGE ${change} 但无 CASH 支付行`);
      }
    }
    if (!hasPay && due > EPS) {
      stats.e++;
      if (stats.e <= 10) {
        problems.push(`[E 欠款] ${tag}: 应付 ${due.toFixed(2)}，票面无任何支付行`);
      }
    }
    if (hasPay && Math.abs(paid - change - due) > EPS) {
      stats.c++;
      if (stats.c <= 10) {
        problems.push(
          `[C 收付] ${tag}: 支付 ${paid.toFixed(2)} - 找零 ${change} = ` +
            `${(paid - change).toFixed(2)}，应付 ${due}`,
        );
      }
    }

    // ── W 现金找零向上取整（仅警告，不计失败）──
    // 规则：CHANGE > 0 且 CASH 有小数 → CASH 应向上取整并重算找零；
    // CHANGE=0 或 CASH 已是整数则保持不变。
    // 2026-09 SANNIU 实测该功能在 B账生成侧未生效（892/1077 张未取整），
    // 属业务口径提示而非数据算错，故只警告不计错，明细上限 10 条；
    // 全量清单用 js/scan-cash-rounding.mjs 导出。
    const cashVal = amountOf(b, 'CASH');
    if (cashVal !== null && change > 0 && Math.abs(cashVal - Math.round(cashVal)) > 1e-9) {
      stats.w++;
      if (stats.w <= 10) {
        warns.push(
          `[W 取整] ${tag}: CHANGE ${change.toFixed(2)} > 0 且 CASH ${cashVal.toFixed(2)} 有小数，` +
            `按规则应为 CASH ${Math.ceil(cashVal)} → CHANGE ${(Math.ceil(cashVal) - due).toFixed(2)}`,
        );
      }
    }
  }

  // ── C2：退货/作废票支付冲销——有支付行时合计应等于 Amount（负向，无找零行）──
  // 此前退废票的支付行完全无校验（132 RETURN 399 事故的票面路径）。
  if (!isSale && due !== null) {
    let paid2 = 0;
    let hasPay2 = false;
    for (const m of PAY_METHODS) {
      const v = amountOf(b, m);
      if (v !== null) {
        paid2 += v;
        hasPay2 = true;
      }
    }
    if (hasPay2 && Math.abs(paid2 - due) > EPS) {
      stats.c2++;
      if (stats.c2 <= 10) {
        problems.push(`[C2 冲销] ${tag}: 支付行合计 ${paid2.toFixed(2)}，票面 Amount ${due}`);
      }
    }
  }

  // ── D ──
  // 数量允许小数（称重/半份商品印 0.5、0.38），与 audit-content.mjs 的 ITEM_ROW 同口径。
  // 销售票行价 = 原价，对比 Gross；退货/作废票行价 = 实退净额（折扣与 VAT 调整
  // 已摊进行价），故 行合计 + SC = Amount。
  const rows = [
    ...b.matchAll(
      /^\s+-?\d+(?:\.\d+)?\s{2,}-?[\d,]+\.\d{2}\s{2,}(-?[\d,]+\.\d{2})\s*[VEZ]?\s*$/gm,
    ),
  ];
  if (rows.length && gross !== null && due !== null) {
    const sum = rows.reduce((a, m) => a + num(m[1]), 0);
    const expect = isSale ? gross : due - svc;
    if (Math.abs(sum - expect) > EPS) {
      stats.d++;
      if (stats.d <= 10) {
        problems.push(
          `[D 行合计] ${tag}: ${rows.length} 行合计 ${sum.toFixed(2)}，应等于 ` +
            (isSale
              ? `Gross ${gross}`
              : `实退 ${(due - svc).toFixed(2)}（Amount ${due} − SC ${svc}）`),
        );
      }
    }
  }
}

const line = '='.repeat(62);
console.log(`\n${line}`);
console.log(` 金额勾稽 — 销售 ${stats.sale} / 退货 ${stats.ret} / 作废 ${stats.void} 张`);
console.log(line);
const rowsOut = [
  ['A 应付 Amount Due = Gross ∓LessVAT ±AddVAT ∓Discount ±SC（退废符号反转）', stats.a],
  ['B 税分解 Tax Split 合计 = Gross ∓LessVAT ±AddVAT ∓Regular Disc.', stats.b],
  ['C 支付 Payments − 找零 CHANGE = 应付 Amount Due（仅销售票 Sale）', stats.c],
  ['E 应付>0 必有支付行 Has Payment（欠款探针 Unpaid Probe）', stats.e],
  ['C2 退废票支付冲销 Reversal = Amount（有支付行时）', stats.c2],
  ['C3 找零来源 CHANGE source = CASH（电子支付无找零）', stats.c3],
  ['D 行合计 Line Sum = Gross(销售 Sale) / 实退−SC(退货·作废 Ret/Void)', stats.d],
];
for (const [label, n] of rowsOut) {
  console.log(`  ${n === 0 ? '✅' : '❌'} ${label.padEnd(64)} 异常 ${n}`);
}
// 数量>0 时标红（ANSI），IDEA 运行窗口 / Git Bash 均可渲染
const red = (s) => `\u001b[1;31m${s}\u001b[0m`;
console.log(
  `  ${stats.w === 0 ? '✅' : '⚠'} 现金找零向上取整 Cash Round-up 未执行（仅提示 Warning，不计失败）${stats.w > 0 ? red(stats.w) : 0}`,
);
if (problems.length) {
  console.log('\n明细:');
  problems.forEach((p) => console.log('   ' + p));
}
if (warns.length) {
  console.log('\n取整提示（最多 10 条）:');
  warns.forEach((p) => console.log('   ' + p));
}
console.log(line);
