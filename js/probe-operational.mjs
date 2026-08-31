/**
 * 核实运维票（ORDER_SLIP / KITCHEN_DOCKET / CHANGE_TABLE / VOID_DISH）：
 *   1. 有没有混进 EJ 输出（应为否，客户端显式跳过）
 *   2. 白拉了多少字节
 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const START_DATE = pick('START_DATE');
const END_DATE = pick('END_DATE');
const POS_ID = pickNum('POS_ID');
const H = { Authorization: `Bearer ${TOKEN}` };

const list = (
  await (
    await fetch(
      `${BASE_URL}/order/b-account-receipt/list?startDate=${START_DATE}` +
        `&endDate=${END_DATE}&posId=${POS_ID}&pageNum=1&pageSize=500`,
      { headers: H },
    )
  ).json()
).data;

const OPERATIONAL = ['KITCHEN_DOCKET', 'ORDER_SLIP', 'CHANGE_TABLE', 'VOID_DISH'];
const rc = list.receipts || [];

const kb = (n) => (n / 1024).toFixed(0);
const bytesOf = (arr) => arr.reduce((n, r) => n + (r.printTxt ? r.printTxt.length : 0), 0);

console.log('\n──────── 各 receipt_type 的传输占用 ────────');
const groups = {};
for (const r of rc) {
  (groups[r.receiptType] ??= []).push(r);
}
const rows = Object.entries(groups)
  .map(([k, v]) => ({ type: k, n: v.length, bytes: bytesOf(v), op: OPERATIONAL.includes(k) }))
  .sort((a, b) => b.bytes - a.bytes);

let opN = 0;
let opBytes = 0;
for (const r of rows) {
  if (r.op) {
    opN += r.n;
    opBytes += r.bytes;
  }
  console.log(
    `  ${r.type.padEnd(16)} ${String(r.n).padStart(4)} 条  ` +
      `${kb(r.bytes).padStart(5)} KB  ${r.op ? '← 运维票，客户端永远跳过' : ''}`,
  );
}

const totalBytes = bytesOf(rc);
console.log(
  `\n运维票合计 ${opN} 条 / ${kb(opBytes)} KB` +
    `  = printTxt 总量的 ${((opBytes / totalBytes) * 100).toFixed(0)}%`,
);

// 有没有混进最终 EJ 输出？
const ej = readFileSync('out/ej-node-bench.txt', 'utf8');
console.log('\n──────── EJ 输出里有没有它们的痕迹 ────────');
for (const t of OPERATIONAL) {
  const samples = (groups[t] || []).slice(0, 30);
  let hit = 0;
  for (const s of samples) {
    const line = (s.printTxt || '').split('\n').find((l) => l.trim().length > 12);
    if (line && ej.includes(line.trim())) hit++;
  }
  console.log(`  ${t.padEnd(16)} 抽查 ${samples.length} 条，命中 ${hit} 条`);
}
