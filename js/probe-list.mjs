/** 单独探测 /list 端点：耗时、响应体构成、receipts 里有多少是会被丢弃的。 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const START_DATE = pick('START_DATE');
const END_DATE = pick('END_DATE');
const POS_ID = pickNum('POS_ID');

const t = () => Number(process.hrtime.bigint() / 1000000n);

const url =
  `${BASE_URL}/order/b-account-receipt/list?startDate=${START_DATE}` +
  `&endDate=${END_DATE}&posId=${POS_ID}&pageNum=1&pageSize=500`;

const s = t();
const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
const raw = await r.text();
const ms = t() - s;
const d = JSON.parse(raw).data;

const mb = (n) => (n / 1048576).toFixed(2);

console.log(`\n/list 耗时 ${ms} ms | 响应体 ${mb(raw.length)} MB`);
console.log(
  `orders ${d.orders?.length ?? 0} | shiftRecords ${d.shiftRecords?.length ?? 0}` +
    ` | dailySettlements ${d.dailySettlements?.length ?? 0} | receipts ${d.receipts?.length ?? 0}`,
);

const rc = d.receipts || [];
const txtBytes = rc.reduce((a, x) => a + (x.printTxt ? x.printTxt.length : 0), 0);
console.log(
  `\nreceipts.printTxt 合计 ${mb(txtBytes)} MB，占响应体 ${((txtBytes / raw.length) * 100).toFixed(0)}%`,
);

const by = {};
rc.forEach((x) => (by[x.receiptType] = (by[x.receiptType] || 0) + 1));
console.log('receipts 类型分布:', JSON.stringify(by, null, 0));

// 前端实际会用到的只有两类：重打副本 + 跨日 RETURN/VOID
const OPERATIONAL = new Set(['KITCHEN_DOCKET', 'ORDER_SLIP', 'CHANGE_TABLE', 'VOID_DISH']);
const CROSS_DAY = new Set(['RETURN_TXN', 'VOID_TXN']);
let used = 0;
for (const x of rc) {
  if (OPERATIONAL.has(x.receiptType)) continue;
  let isReprint = false;
  try {
    isReprint = JSON.parse(x.extend || '{}')?.isReprint === true;
  } catch {}
  if (isReprint || CROSS_DAY.has(x.receiptType)) used++;
}
console.log(
  `\n候选 verbatim ${used} 条 / 共 ${rc.length} 条` +
    ` → ${(((rc.length - used) / (rc.length || 1)) * 100).toFixed(0)}% 拉回来就被丢弃`,
);
