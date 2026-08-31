/**
 * 验证退货单 Regular Discount 修复：用同一份真实数据，
 * 分别跑修复前(ej-render.before.js)与修复后(ej-render.js)的 bundle，逐行 diff。
 *
 * 期望：只有退货票的 Regular Discount 行发生变化，其余逐字节不变。
 */
import { readFileSync } from 'node:fs';
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
const get = async (u) => (await (await fetch(u, { headers: H })).json()).data ?? {};

// ── 只拉一次数据，两个 bundle 共用，排除数据波动干扰 ──
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

// 与 Java 侧 EjExportService 当前配置保持一致
const opts = { startDate: START_DATE, endDate: END_DATE, isReprint: false, bilingual: false };

function render(bundlePath) {
  const EJ = new Function(`${readFileSync(bundlePath, 'utf8')}; return EJ;`)();
  const asm = EJ.createEjournalAssembler(config, opts);
  asm.addPage(list, details);
  return { text: asm.finish(), stats: asm.getStats() };
}

const before = render('js/ej-render.before.js');
const after = render('js/ej-render.js');

const md5 = (s) => createHash('md5').update(s, 'utf8').digest('hex');
const bl = before.text.split('\n');
const al = after.text.split('\n');

console.log(`\n小票数   修复前 ${before.stats.taskCount}   修复后 ${after.stats.taskCount}` +
  `  ${before.stats.taskCount === after.stats.taskCount ? '✅ 未增减' : '❌ 数量变了'}`);
console.log(`行数     修复前 ${bl.length}   修复后 ${al.length}` +
  `  ${bl.length === al.length ? '✅ 未增减' : '❌ 行数变了'}`);
console.log(`md5      修复前 ${md5(before.text)}`);
console.log(`         修复后 ${md5(after.text)}`);

if (bl.length !== al.length) {
  console.log('\n❌ 行数不一致，无法逐行 diff —— 修复引入了结构性变化，需排查');
  process.exit(1);
}

const diffs = [];
for (let i = 0; i < bl.length; i++) {
  if (bl[i] !== al[i]) diffs.push({ line: i + 1, before: bl[i], after: al[i] });
}

console.log(`\n差异行数 ${diffs.length}`);
for (const d of diffs) {
  console.log(`  L${d.line}`);
  console.log(`    - ${d.before}`);
  console.log(`    + ${d.after}`);
}

const allRegularDiscount = diffs.every((d) => /Regular Discount/.test(d.before));
console.log(
  `\n结论: ${
    diffs.length > 0 && allRegularDiscount
      ? '✅ 差异全部落在 Regular Discount 行，无副作用'
      : diffs.length === 0
        ? '⚠ 无任何变化 —— 修复未生效或本批数据未命中'
        : '❌ 存在非 Regular Discount 的差异，需排查'
  }`,
);
