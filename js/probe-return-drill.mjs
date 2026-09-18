/** 下钻：RETURN#14/15/16 的快照票面反查原始订单，定位 batch 详情断链原因。 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const effective = (n) => (mainJava.match(new RegExp(`^\\s*private static final [^=]+ ${n}\\s*=\\s*(.+);$`, 'm')) || [])[1]?.trim();
const pick = (n) => (effective(n) || '').replace(/^"|"$/g, '');
const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const START = pick('START_DATE');
const END = pick('END_DATE');
const POS_ID = Number((effective('POS_ID') || '').replace(/L?$/, ''));
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

// 1) 拉 list（单页 500 已够覆盖票快照? 全拉以防万一）
const receipts = [];
const orders = [];
for (let p = 1; ; p++) {
  const u = `${BASE_URL}/order/b-account-receipt/list?startDate=${START}&endDate=${END}&posId=${POS_ID}&pageNum=${p}&pageSize=500`;
  const d = (await (await fetch(u, { headers: H })).json()).data;
  (d.receipts || []).forEach((r) => receipts.push(r));
  (d.orders || []).forEach((o) => orders.push(o));
  if (!d.hasNextPage) break;
}

// 2) 找 RETURN_TXN 14/15/16 的快照，解出票面 SI# / 单号
const targets = ['0000000000000014', '0000000000000015', '0000000000000016'];
const found = {};
for (const r of receipts) {
  const no = String(r.receiptNo ?? r.receiptNumber ?? '');
  if (!targets.includes(no) || !/RETURN/i.test(String(r.receiptType ?? r.type ?? ''))) continue;
  const txt = r.printTxt || '';
  const si = (txt.match(/SI#\s+(\d+)/) || [])[1];
  const rn = (txt.match(/RETURN#\s+(\d+)/) || [])[1];
  const dt = (txt.match(/Date ?& ?Time\s+(\S+ \S+)/) || [])[1];
  found[no.replace(/^0+/, '')] = { si: si?.replace(/^0+/, ''), dt, keys: Object.keys(r), txtLen: txt.length, orderId: r.orderId, salesOrderId: r.salesOrderId };
}
console.log('快照反查结果:');
for (const [rn, v] of Object.entries(found)) {
  console.log(`  RETURN#${rn}: 原单 SI ${v.si} @${v.dt} | snapshot.orderId=${v.orderId} salesOrderId=${v.salesOrderId}`);
}

// 3) 用 SI 找到原始订单，查它的详情 refundRecords
const bySi = new Map();
for (const o of orders) if (o.siNumber) bySi.set(o.siNumber.replace(/^0+/, ''), o);
const checkSis = [...new Set(Object.values(found).map((v) => v.si).filter(Boolean))];
console.log('\n原单在 list 中的状态与详情 refundRecords:');
for (const si of checkSis) {
  const o = bySi.get(si);
  if (!o) { console.log(`  SI ${si}: 不在 list 返回的订单里 ❗`); continue; }
  const r = await fetch(`${BASE_URL}/order/b-account-receipt/order/batch`, {
    method: 'POST', headers: H, body: JSON.stringify([o.id]),
  });
  const d = JSON.parse(await r.text()).data || {};
  const det = d[o.id];
  if (!det) { console.log(`  SI ${si} (id=${o.id}): batch 详情不返回 ❗`); continue; }
  const packs = det.refundRecords || (det.refundRecord ? [det.refundRecord] : []);
  const nos = packs.map((p) => String(p.refund?.refundNo ?? '').replace(/^0+/, '')).filter(Boolean);
  console.log(`  SI ${si} (id=${o.id} orderStatus=${o.orderStatus}): refundRecords=[${nos.join(',')}] 退款 ${packs.length} 笔`);
}
