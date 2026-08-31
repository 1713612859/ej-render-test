/**
 * 性能诊断：用 node(V8, 有 JIT) 跑与 Java 侧完全相同的流程和数据。
 *
 * 目的是把 23.4s 拆开，确认瓶颈是「GraalJS 解释执行」还是「HTTP / 数据量」。
 * 配置从 Main.java 里读，避免两处不同步。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// ── 从 Main.java 抠配置，保证与 Java 侧跑的是同一组参数 ──
const mainJava = readFileSync(
  join(root, 'src/main/java/com/ppos/ejtest/Main.java'),
  'utf8',
);
const pick = (name) => {
  const m = mainJava.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : null;
};
const pickNum = (name) => {
  const m = mainJava.match(new RegExp(`${name}\\s*=\\s*(\\d+)`));
  return m ? Number(m[1]) : null;
};

const START_DATE = pick('START_DATE');
const END_DATE = pick('END_DATE');
const BASE_URL = pick('BASE_URL');
const POS_ID = pickNum('POS_ID');
const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');

const H = { Authorization: `Bearer ${TOKEN}` };
const t = () => Number(process.hrtime.bigint() / 1000000n);

async function getJson(url) {
  const r = await fetch(url, { headers: H });
  const body = await r.json();
  if (body.code && body.code !== 200) {
    throw new Error(`code=${body.code} msg=${body.msg} @ ${url}`);
  }
  return body.data ?? {};
}

async function main() {
  const timing = {};
  const bundle = readFileSync(join(here, 'ej-render.js'), 'utf8');

  let s = t();
  const EJ = new Function(`${bundle}; return EJ;`)();
  timing.engine = t() - s;

  // 1) config
  s = t();
  const device = await getJson(`${BASE_URL}/system/sysDevice/${POS_ID}`);
  const store = await getJson(`${BASE_URL}/system/sysStore/${device.storeId}`);
  const config = {
    width: 80,
    charPerLine: 48,
    storeName: store.companyName || store.storeName || '',
    companyName: store.companyName || '',
    address: store.taxAddress || store.address || '',
    tinNumber: store.tinNumber || '',
    taxType: store.taxType || '',
    snCode: device.snCode || device.deviceCode || '',
    minNo: device.minNo || '',
    ptuNo: device.ptuNo || '',
    issueDate: device.issueDate || '',
    terminalNo: device.terminalNo || '',
  };
  timing.config = t() - s;

  const asm = EJ.createEjournalAssembler(config, {
    startDate: START_DATE,
    endDate: END_DATE,
    isReprint: true,
    bilingual: false,
  });

  timing.list = 0;
  timing.detail = 0;
  timing.render = 0;
  let pageNum = 1;
  let hasNext = true;
  let orders = 0;
  let detailBytes = 0;

  while (hasNext) {
    s = t();
    const list = await getJson(
      `${BASE_URL}/order/b-account-receipt/list?startDate=${START_DATE}` +
        `&endDate=${END_DATE}&posId=${POS_ID}&pageNum=${pageNum}&pageSize=500`,
    );
    timing.list += t() - s;

    const ids = (list.orders || []).map((o) => o.id);
    orders += ids.length;

    let details = {};
    if (ids.length) {
      s = t();
      const r = await fetch(`${BASE_URL}/order/b-account-receipt/order/batch`, {
        method: 'POST',
        headers: { ...H, 'Content-Type': 'application/json' },
        body: JSON.stringify(ids),
      });
      const raw = await r.text();
      detailBytes += raw.length;
      details = JSON.parse(raw).data ?? {};
      timing.detail += t() - s;
    }

    s = t();
    asm.addPage(list, details);
    timing.render += t() - s;

    hasNext = list.hasNextPage === true;
    pageNum++;
  }

  s = t();
  const text = asm.finish();
  timing.finish = t() - s;

  const stats = asm.getStats();

  s = t();
  writeFileSync(join(root, 'out', 'ej-node-bench.txt'), '﻿' + text, 'utf8');
  timing.txt = t() - s;

  const total = Object.values(timing).reduce((a, b) => a + b, 0);

  console.log(`\n日期范围 ${START_DATE} ~ ${END_DATE}  posId=${POS_ID}`);
  console.log(`小票 ${stats.taskCount} 张 | 订单 ${orders} 单 | 详情 JSON ${(detailBytes / 1048576).toFixed(2)} MB`);
  console.log('─────────── node(V8) 分阶段耗时 ───────────');
  for (const [k, v] of Object.entries(timing)) {
    console.log(`  ${k.padEnd(8)} ${String(v).padStart(6)} ms`);
  }
  console.log(`  ${'合计'.padEnd(7)} ${String(total).padStart(6)} ms`);
  console.log(`\n输出 ${text.length} 字符 → out/ej-node-bench.txt`);
}

main().catch((e) => {
  console.error('失败:', e.message);
  process.exit(1);
});
