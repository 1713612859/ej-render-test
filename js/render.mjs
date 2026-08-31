/**
 * 第 1 步验证：在纯 node 里跑 EJ 渲染，证明这套逻辑脱离 React Native 可用。
 *
 * 这里的 config 模拟 BAPP 生产环境 PrinterConfigService.getPrinterConfig() 的产出：
 * 门店信息来自 sys_store，设备信息来自 sys_device —— 都是云端数据。
 * 本样本直接用订单快照里的同名字段代入，效果等价。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// bundle 是 IIFE，globalName=EJ，直接 eval 进当前上下文
const bundle = readFileSync(join(here, 'ej-render.js'), 'utf8');
const EJ = new Function(`${bundle}; return EJ;`)();

const detail = JSON.parse(readFileSync(join(here, 'sample-order.json'), 'utf8'));
const o = detail.order;

// 对齐 getPrinterConfig()：storeName 取 companyName，address 取 taxAddress
const config = {
  width: 80,
  charPerLine: 48,
  storeName: o.companyLegalName,
  companyName: o.companyLegalName,
  address: o.taxAddress,
  tinNumber: o.tinNumber,
  taxType: 'VAT',
  snCode: o.serialNumber,
  minNo: o.minNumber,
  ptuNo: o.ptuNumber,
  issueDate: o.ptuEffectiveDate,
  terminalNo: o.terminalNo,
};

// 云端下载的都是重打副本，按 BIR 要求必须带 REPRINT 标记
const results = EJ.generateOrderReceiptTexts(detail, config, {
  bilingual: false,
  isReprint: true,
});

console.log(`渲染出 ${results.length} 张小票`);

let out = '';
for (const { text, time } of results) {
  const clean = EJ.stripPrinterMarkers(text);
  out += `\n   \n${clean}\n\n`;
  console.log(`\n──────── time=${time} ────────`);
  console.log(clean);
}

writeFileSync(join(here, '..', 'out', 'ej-node.txt'), '﻿' + out, 'utf8');
console.log('\n已写出 out/ej-node.txt');
