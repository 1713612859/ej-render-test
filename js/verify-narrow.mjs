/**
 * 验证：把 receipts 收窄到 RETURN_TXN/VOID_TXN，EJ 输出是否逐字节不变。
 *
 * 依据：后端 SQL 已经用
 *   COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.extend,'$.isReprint')),'false') <> 'true'
 * 过滤掉了所有重打副本，所以客户端 isReprint 分支恒不命中；
 * 加上运维票被显式跳过，实际能进 EJ 的只剩 RETURN_TXN / VOID_TXN。
 *
 * 若 diff 为 0，则 SQL 的 receipt_type 白名单可安全收窄到这两类。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const START_DATE = pick('START_DATE');
const END_DATE = pick('END_DATE');
const POS_ID = pickNum('POS_ID');
const H = { Authorization: `Bearer ${TOKEN}` };

const EJ = new Function(`${readFileSync('js/ej-render.js', 'utf8')}; return EJ;`)();

const get = async (u) => (await (await fetch(u, { headers: H })).json()).data ?? {};

const device = await get(`${BASE_URL}/system/sysDevice/${POS_ID}`);
const store = await get(`${BASE_URL}/system/sysStore/${device.storeId}`);
const config = {
  width: 80, charPerLine: 48,
  storeName: store.companyName || store.storeName || '',
  companyName: store.companyName || '',
  address: store.taxAddress || store.address || '',
  tinNumber: store.tinNumber || '', taxType: store.taxType || '',
  snCode: device.snCode || device.deviceCode || '',
  minNo: device.minNo || '', ptuNo: device.ptuNo || '',
  issueDate: device.issueDate || '', terminalNo: device.terminalNo || '',
};

const list = await get(
  `${BASE_URL}/order/b-account-receipt/list?startDate=${START_DATE}` +
    `&endDate=${END_DATE}&posId=${POS_ID}&pageNum=1&pageSize=500`,
);
const ids = (list.orders || []).map((o) => o.id);
const details = (
  await (
    await fetch(`${BASE_URL}/order/b-account-receipt/order/batch`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify(ids),
    })
  ).json()
).data ?? {};

const opts = { startDate: START_DATE, endDate: END_DATE, isReprint: true, bilingual: false };

function run(listVo) {
  const asm = EJ.createEjournalAssembler(config, opts);
  asm.addPage(listVo, details);
  return { text: asm.finish(), stats: asm.getStats() };
}

// A: 原样（12 类 receipt）
const a = run(list);

// B: 收窄到 RETURN_TXN / VOID_TXN
const narrowed = {
  ...list,
  receipts: (list.receipts || []).filter(
    (r) => r.receiptType === 'RETURN_TXN' || r.receiptType === 'VOID_TXN',
  ),
};
const b = run(narrowed);

const md5 = (s) => createHash('md5').update(s, 'utf8').digest('hex');
const before = (list.receipts || []).length;
const after = narrowed.receipts.length;
const txtBytes = (arr) => arr.reduce((n, r) => n + (r.printTxt ? r.printTxt.length : 0), 0);

console.log(`\nreceipts  ${before} 条 → ${after} 条  (少传 ${before - after} 条)`);
console.log(
  `printTxt  ${(txtBytes(list.receipts || []) / 1048576).toFixed(2)} MB → ` +
    `${(txtBytes(narrowed.receipts) / 1048576).toFixed(2)} MB`,
);
console.log(`\n小票数    A=${a.stats.taskCount}  B=${b.stats.taskCount}`);
console.log(`md5       A=${md5(a.text)}`);
console.log(`          B=${md5(b.text)}`);
console.log(
  `\n结论: ${a.text === b.text ? '✅ 输出逐字节相同，白名单可安全收窄' : '❌ 输出不同，不能收窄'}`,
);

if (a.text !== b.text) {
  writeFileSync('out/narrow-a.txt', a.text, 'utf8');
  writeFileSync('out/narrow-b.txt', b.text, 'utf8');
  console.log('已写出 out/narrow-a.txt 与 out/narrow-b.txt 供比对');
}
