/** 确认网关是否开启响应压缩，以及压缩后能省多少。 */
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const POS_ID = pickNum('POS_ID');

const url =
  `${BASE_URL}/order/b-account-receipt/list?startDate=2026-07-27` +
  `&endDate=2026-08-25&posId=${POS_ID}&pageNum=1&pageSize=500`;

const r = await fetch(url, {
  headers: { Authorization: `Bearer ${TOKEN}`, 'Accept-Encoding': 'gzip, deflate' },
});

console.log('\n响应头:');
for (const k of ['content-encoding', 'content-length', 'content-type', 'transfer-encoding']) {
  console.log(`  ${k.padEnd(18)} ${r.headers.get(k) ?? '(无)'}`);
}

const body = await r.text();
const raw = Buffer.byteLength(body, 'utf8');
const gz = gzipSync(Buffer.from(body, 'utf8')).length;

console.log(`\n原始 JSON       ${(raw / 1024).toFixed(0)} KB`);
console.log(`gzip 后         ${(gz / 1024).toFixed(0)} KB  (压缩比 ${(raw / gz).toFixed(1)}x)`);
console.log(
  `\n结论: ${
    r.headers.get('content-encoding')
      ? '网关已开压缩'
      : '⚠ 网关未开压缩 —— 开启后这一段传输可省 ' +
        (((raw - gz) / raw) * 100).toFixed(0) + '%'
  }`,
);
