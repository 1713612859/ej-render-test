/** 用当前 bundle 重新生成一份 EJ，供审查工具复核。输出 out/ej-fixed.txt */
import { readFileSync, writeFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const TOKEN = pick('TOKEN').replace(/^Bearer\s+/i, '');
const BASE_URL = pick('BASE_URL');
const SD = pick('START_DATE');
const ED = pick('END_DATE');
const POS = pickNum('POS_ID');
const H = { Authorization: `Bearer ${TOKEN}` };
const get = async (u) => (await (await fetch(u, { headers: H })).json()).data ?? {};

const device = await get(`${BASE_URL}/system/sysDevice/${POS}`);
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
  `${BASE_URL}/order/b-account-receipt/list?startDate=${SD}&endDate=${ED}` +
    `&posId=${POS}&pageNum=1&pageSize=500`,
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

const EJ = new Function(`${readFileSync('js/ej-render.js', 'utf8')}; return EJ;`)();
const asm = EJ.createEjournalAssembler(config, {
  startDate: SD, endDate: ED, isReprint: false, bilingual: false,
});
asm.addPage(list, details);
writeFileSync('out/ej-fixed.txt', '﻿' + asm.finish(), 'utf8');
console.log('已生成 out/ej-fixed.txt', JSON.stringify(asm.getStats()));
