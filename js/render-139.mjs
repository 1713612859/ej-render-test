/**
 * 渲染租户139的6单零支付订单(ppos-cloud B账数据), 查看EJ票面效果与C检查失败形态。
 * 数据来自 orders-139.json(生产库只读导出, camelCase), 结构对齐 fixture/sample-order.json。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const bundle = readFileSync(join(here, 'ej-render.js'), 'utf8');
const EJ = new Function(`${bundle}; return EJ;`)();

const data = JSON.parse(readFileSync(join(here, 'orders-139.json'), 'utf8'));

for (const detail of data.details) {
  const o = detail.order;
  const config = {
    width: 80,
    charPerLine: 48,
    storeName: o.companyLegalName || data.store.companyName,
    companyName: o.companyLegalName || data.store.companyName,
    address: o.taxAddress || data.store.address,
    tinNumber: o.tinNumber || data.store.tinNumber,
    taxType: 'VAT',
    snCode: o.serialNumber,
    minNo: o.minNumber,
    ptuNo: o.ptuNumber,
    issueDate: o.ptuEffectiveDate,
    terminalNo: o.terminalNo,
  };
  const results = EJ.generateOrderReceiptTexts(detail, config, { bilingual: false, isReprint: false });
  for (const { text, time } of results) {
    console.log(`\n════════ order ${o.id} / ${o.orderNo} / time=${time} ════════`);
    console.log(EJ.stripPrinterMarkers(text));
  }
}
