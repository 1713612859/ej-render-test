/**
 * 探针：RETURN 票在接口返回里的覆盖情况。
 * 1) /list 的 receipts 快照数组里 RETURN_TXN 有哪些号
 * 2) /order/batch 订单详情里 refundRecords/refundRecord 带出哪些退货号
 * 对比 DB 的 1~50，定位是"接口没返回"还是"渲染丢弃"。
 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const effective = (n) => {
  const m = mainJava.match(new RegExp(`^\\s*private static final [^=]+ ${n}\\s*=\\s*(.+);$`, 'm'));
  return m ? m[1].trim() : null;
};
const pick = (n) => (effective(n) || '').replace(/^"|"$/g, '');
const pickNum = (n) => Number((effective(n) || '').replace(/L?$/, ''));
const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const START = pick('START_DATE');
const END = pick('END_DATE');
const POS_ID = pickNum('POS_ID');
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
console.log(`探针: ${BASE_URL} POS ${POS_ID} ${START}~${END}\n`);

// ── 1) 分页拉 list，收集 receipts 快照与订单号 ──
const receiptTxn = [];   // {receiptNo, type}
const orderIds = [];
let page = 1;
let total = 0;
for (;;) {
  const u = `${BASE_URL}/order/b-account-receipt/list?startDate=${START}&endDate=${END}` +
    `&posId=${POS_ID}&pageNum=${page}&pageSize=500`;
  const d = (await (await fetch(u, { headers: H })).json()).data;
  total = d.total ?? total;
  for (const r of d.receipts || []) receiptTxn.push(r);
  (d.orders || []).forEach((o) => orderIds.push(o.id));
  if (!d.hasNextPage) break;
  page++;
}
console.log(`list: 订单 ${orderIds.length} 个（total=${total}），receipts 快照 ${receiptTxn.length} 条`);

const typeCount = {};
for (const r of receiptTxn) typeCount[r.receiptType ?? r.type ?? '?'] = (typeCount[r.receiptType ?? r.type ?? '?'] || 0) + 1;
console.log('receipts 类型分布:', JSON.stringify(typeCount));

const snapRet = new Set();
for (const r of receiptTxn) {
  const t = r.receiptType ?? r.type ?? '';
  const no = (r.receiptNo ?? r.receiptNumber ?? '') + '';
  if (/RETURN/i.test(String(t)) && no) snapRet.add(Number(no.replace(/^0+/, '')) || 0);
}
const snapSorted = [...snapRet].sort((a, b) => a - b);
console.log(`receipts 里 RETURN_TXN 号: ${snapSorted.length} 个 → [${snapSorted.slice(0, 60).join(', ')}${snapSorted.length > 60 ? ', …' : ''}]`);

// ── 2) 批量拉订单详情，看 refundRecords ──
const detailRets = new Map(); // returnNo -> orderNo
let withRefundField = 0;
let sampleDumped = false;
for (let i = 0; i < orderIds.length; i += 500) {
  const batch = orderIds.slice(i, i + 500);
  const r = await fetch(`${BASE_URL}/order/b-account-receipt/order/batch`, {
    method: 'POST', headers: H, body: JSON.stringify(batch),
  });
  const d = JSON.parse(await r.text()).data || {};
  for (const [id, det] of Object.entries(d)) {
    const o = det.order || {};
    const packs = det.refundRecords?.length ? det.refundRecords : (det.refundRecord ? [det.refundRecord] : []);
    if (det.refundRecords) withRefundField++;
    if (packs.length && !sampleDumped) {
      sampleDumped = true;
      console.log('refundRecord 样例字段:', JSON.stringify(Object.keys(packs[0])));
      console.log('refundRecord 样例值:', JSON.stringify(packs[0]).slice(0, 400));
    }
    for (const p of packs) {
      const no = String(p.refund?.refundNo ?? p.returnNo ?? p.refundNo ?? '').replace(/^0+/, '');
      if (no) detailRets.set(no, o.orderNo);
    }
  }
}
const detSorted = [...detailRets.keys()].map(Number).sort((a, b) => a - b);
console.log(`\nbatch 详情: 带 refundRecords 字段的订单 ${withRefundField} 个；带出的退货号 ${detSorted.length} 个`);
console.log(`详情里退货号: [${detSorted.join(', ')}]`);

// ── 3) 对比 DB 1~50 ──
const dbNos = Array.from({ length: 50 }, (_, i) => i + 1);
const missInSnap = dbNos.filter((n) => !snapRet.has(n));
const missInDetail = dbNos.filter((n) => !detailRets.has(String(n)));
console.log(`\n对比 DB 的 1~50:`);
console.log(`  receipts 快照缺: [${missInSnap.join(', ') || '无'}]`);
console.log(`  订单详情缺:    [${missInDetail.join(', ') || '无'}]`);
