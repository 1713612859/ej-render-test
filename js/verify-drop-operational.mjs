/**
 * 验证移除 4 类运维票（KITCHEN_DOCKET / ORDER_SLIP / CHANGE_TABLE / VOID_DISH）
 * 后 EJ 输出是否逐字节不变。
 *
 * 做法：拉线上原样响应（12 类），在客户端剔掉这 4 类模拟收窄后的 SQL，
 * 两份分别喂给同一个 assembler，比 md5。
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
const run = (vo) => {
  const asm = EJ.createEjournalAssembler(config, opts);
  asm.addPage(vo, details);
  return { text: asm.finish(), stats: asm.getStats() };
};

const DROPPED = new Set(['KITCHEN_DOCKET', 'ORDER_SLIP', 'CHANGE_TABLE', 'VOID_DISH']);

const before = run(list);
const after = run({
  ...list,
  receipts: (list.receipts || []).filter((r) => !DROPPED.has(r.receiptType)),
});

const md5 = (s) => createHash('md5').update(s, 'utf8').digest('hex');
const bytes = (arr) => arr.reduce((n, r) => n + (r.printTxt ? r.printTxt.length : 0), 0);
const all = list.receipts || [];
const kept = all.filter((r) => !DROPPED.has(r.receiptType));

console.log(`\nreceipts   ${all.length} 条 → ${kept.length} 条   (少传 ${all.length - kept.length} 条)`);
console.log(
  `printTxt   ${(bytes(all) / 1024).toFixed(0)} KB → ${(bytes(kept) / 1024).toFixed(0)} KB` +
    `   (省 ${(((bytes(all) - bytes(kept)) / bytes(all)) * 100).toFixed(0)}%)`,
);
console.log(`\n小票数     收窄前 ${before.stats.taskCount}  收窄后 ${after.stats.taskCount}`);
console.log(`md5        收窄前 ${md5(before.text)}`);
console.log(`           收窄后 ${md5(after.text)}`);
console.log(
  `\n结论: ${
    before.text === after.text
      ? '✅ 输出逐字节相同 —— 移除这 4 类运维票是安全的'
      : '❌ 输出不同 —— 不能移除'
  }`,
);

if (before.text !== after.text) {
  writeFileSync('out/drop-before.txt', before.text, 'utf8');
  writeFileSync('out/drop-after.txt', after.text, 'utf8');
  console.log('已写出 out/drop-before.txt 与 out/drop-after.txt 供比对');
}
