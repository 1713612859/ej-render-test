/**
 * 核实退货单的 Regular Discount 取值问题：
 * mappers.mapOrderToReturnReceiptData 里 manualDiscount 只读 order.manualDiscount（整单），
 * 而 grossSales/serviceCharge 都优先读 refund.*（退回部分）。
 * 本脚本确认 refund.manualDiscount 在真实数据里是否有值，以判断修复是否可行。
 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const H = { Authorization: `Bearer ${TOKEN}` };

const list = (
  await (
    await fetch(
      `${BASE_URL}/order/b-account-receipt/list?startDate=${pick('START_DATE')}` +
        `&endDate=${pick('END_DATE')}&posId=${pickNum('POS_ID')}&pageNum=1&pageSize=500`,
      { headers: H },
    )
  ).json()
).data;

const ids = (list.orders || []).map((o) => o.id);
const details = (
  await (
    await fetch(`${BASE_URL}/order/b-account-receipt/order/batch`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify(ids),
    })
  ).json()
).data;

const n = (v) => (v == null ? 0 : Number(v));
const rows = [];

for (const [id, d] of Object.entries(details)) {
  const r = d.refundRecord;
  if (!r) continue;
  const o = d.order;
  rows.push({
    si: (o.siNumber || '').replace(/^0+/, ''),
    orderManual: n(o.manualDiscount),
    refundManual: r.manualDiscount === undefined ? '(字段缺失)' : n(r.manualDiscount),
    orderGross: n(o.grossSales),
    refundGross: n(r.grossSales),
  });
}

console.log(`\n共 ${rows.length} 张退货单\n`);
console.log(
  'SI'.padEnd(8) +
    'order.gross'.padStart(13) +
    'refund.gross'.padStart(14) +
    'order.manual'.padStart(14) +
    'refund.manual'.padStart(15) +
    '   按比例应为',
);
console.log('-'.repeat(80));

let hasRefundManual = 0;
let mismatched = 0;
for (const r of rows) {
  const partial = Math.abs(r.orderGross - r.refundGross) > 0.01;
  const expected =
    r.orderGross > 0 ? ((r.orderManual * r.refundGross) / r.orderGross).toFixed(2) : '-';
  if (typeof r.refundManual === 'number' && r.refundManual !== 0) hasRefundManual++;
  if (r.orderManual !== 0 && partial) mismatched++;
  console.log(
    r.si.padEnd(8) +
      r.orderGross.toFixed(2).padStart(13) +
      r.refundGross.toFixed(2).padStart(14) +
      r.orderManual.toFixed(2).padStart(14) +
      String(r.refundManual).padStart(15) +
      `   ${expected}${r.orderManual !== 0 && partial ? '  ← 票面会打 order 值，偏大' : ''}`,
  );
}

console.log('-'.repeat(80));
console.log(`refund.manualDiscount 有非零值的: ${hasRefundManual} 张`);
console.log(`有折扣且部分退货（票面折扣会偏大）的: ${mismatched} 张`);
