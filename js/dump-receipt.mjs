/** 按 SI 号打印小票原文，用于核对勾稽告警。用法: node js/dump-receipt.mjs <file> <si> [类型关键字] */
import { readFileSync } from 'node:fs';

const [file, si, kind] = process.argv.slice(2);
const text = readFileSync(file, 'utf8').replace(/^﻿/, '');
const blocks = text.split('\n   \n').filter((b) => b.trim());

const hits = blocks.filter(
  (b) => b.includes(si) && (!kind || b.includes(kind)),
);
console.log(`匹配 ${hits.length} 块\n`);
for (const b of hits.slice(0, 1)) {
  console.log(b.split('\n').map((l, i) => `${String(i).padStart(3)}| ${l}`).join('\n'));
}
