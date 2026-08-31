/** 核对 SI 26 的税分解 0.04 差值来自源数据还是渲染。 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);
const H = { Authorization: `Bearer ${pick('TOKEN').replace(/^Bearer\s+/i, '')}` };
const BASE_URL = pick('BASE_URL');

const list = (
  await (
    await fetch(
      `${BASE_URL}/order/b-account-receipt/list?startDate=${pick('START_DATE')}` +
        `&endDate=${pick('END_DATE')}&posId=${pickNum('POS_ID')}&pageNum=1&pageSize=500`,
      { headers: H },
    )
  ).json()
).data;

const header = (list.orders || []).find((o) => Number(o.siNumber) === 26);
const d = (
  await (
    await fetch(`${BASE_URL}/order/b-account-receipt/order/${header.id}`, { headers: H })
  ).json()
).data;

const o = d.order;
const n = (v) => Number(v ?? 0);

console.log('\n订单表(b_account_sales_order)原始字段：');
for (const f of [
  'grossSales', 'lessVatAmount', 'govDiscountAmountNoTax', 'addVatAmount',
  'variableSales', 'vatAmount', 'vatExemptSales', 'zeroRatedSales',
  'serviceCharge', 'grandTotal',
]) {
  console.log(`  ${f.padEnd(24)} ${o[f]}`);
}

const taxSum = n(o.variableSales) + n(o.vatAmount) + n(o.vatExemptSales) + n(o.zeroRatedSales);
const base = n(o.grossSales) - n(o.lessVatAmount) + n(o.addVatAmount);
console.log(`\n税分解合计  ${taxSum.toFixed(2)}`);
console.log(`基数        ${base.toFixed(2)}  (gross - lessVat + addVat)`);
console.log(`差值        ${(taxSum - base).toFixed(2)}`);

console.log('\n逐商品行 lessVat / addVat（看是否为逐行舍入累积）：');
let sumLess = 0;
let sumAdd = 0;
for (const it of d.items || []) {
  sumLess += n(it.lessVatAmount);
  sumAdd += n(it.addVatAmount);
  console.log(
    `  ${String(it.productName).slice(0, 28).padEnd(30)}` +
      ` rowTotal ${String(it.rowTotal).padStart(9)}` +
      ` lessVat ${String(it.lessVatAmount ?? '-').padStart(8)}` +
      ` addVat ${String(it.addVatAmount ?? '-').padStart(8)}` +
      ` exempt ${String(it.vatExemptSales ?? '-').padStart(9)}`,
  );
}
console.log(`\n逐行 lessVat 合计 ${sumLess.toFixed(2)}  订单头 ${o.lessVatAmount}`);
console.log(`逐行 addVat  合计 ${sumAdd.toFixed(2)}  订单头 ${o.addVatAmount}`);
console.log(
  `\n结论: 差值${Math.abs(taxSum - base) > 0.001 ? '存在于订单表原始字段中，与渲染无关' : '不存在'}`,
);
