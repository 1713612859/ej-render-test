/** 区分「后端查询慢」还是「网络传输慢」：TTFB(首字节) vs 完整下载。 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const POS_ID = pickNum('POS_ID');
const H = { Authorization: `Bearer ${TOKEN}` };
const t = () => Number(process.hrtime.bigint() / 1000000n);

async function probe(label, url) {
  const s = t();
  const r = await fetch(url, { headers: H });
  const ttfb = t() - s;                     // 响应头到达 = 后端处理完毕
  const buf = await r.arrayBuffer();
  const total = t() - s;
  const kb = buf.byteLength / 1024;
  console.log(
    `${label.padEnd(26)} TTFB ${String(ttfb).padStart(5)}ms  ` +
      `下载 ${String(total - ttfb).padStart(5)}ms  ` +
      `共 ${String(total).padStart(5)}ms  ${kb.toFixed(0).padStart(5)} KB`,
  );
  return { ttfb, total, kb };
}

const listUrl = (sd, ed) =>
  `${BASE_URL}/order/b-account-receipt/list?startDate=${sd}&endDate=${ed}` +
  `&posId=${POS_ID}&pageNum=1&pageSize=500`;

console.log('\n── 基线（极小响应）──');
await probe('sysDevice/1938', `${BASE_URL}/system/sysDevice/${POS_ID}`);

console.log('\n── /list 随日期范围伸缩 ──');
await probe('1 天  07-27~07-27', listUrl('2026-07-27', '2026-07-27'));
await probe('7 天  07-27~08-02', listUrl('2026-07-27', '2026-08-02'));
await probe('30 天 07-27~08-25', listUrl('2026-07-27', '2026-08-25'));

console.log('\n── 重复请求（看是否有缓存/预热）──');
await probe('30 天 第二次', listUrl('2026-07-27', '2026-08-25'));
