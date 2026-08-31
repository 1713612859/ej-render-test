/** 打印 VOID_DISH / CHANGE_TABLE / KITCHEN_DOCKET 的 printTxt 样本，人工判断是否该出现在 EJ。 */
import { readFileSync } from 'node:fs';

const mainJava = readFileSync('src/main/java/com/ppos/ejtest/Main.java', 'utf8');
const pick = (n) => (mainJava.match(new RegExp(`${n}\\s*=\\s*"([^"]*)"`)) || [])[1];
const pickNum = (n) => Number((mainJava.match(new RegExp(`${n}\\s*=\\s*(\\d+)`)) || [])[1]);

const H = { Authorization: `Bearer ${pick('TOKEN').replace(/^Bearer\s+/i, '')}` };
const BASE_URL = pick('BASE_URL');

const list = (
  await (
    await fetch(
      `${BASE_URL}/order/b-account-receipt/list?startDate=${pick('START_DATE')}` +
        `&endDate=${pick('END_DATE')}&posId=${pickNum('POS_ID')}&pageNum=1&pageSize=500`,
      { headers: H },
    )
  ).json()
).data;

const ej = readFileSync('out/ej-node-bench.txt', 'utf8');

for (const type of ['VOID_DISH', 'CHANGE_TABLE', 'KITCHEN_DOCKET', 'ORDER_SLIP']) {
  const s = (list.receipts || []).find((x) => x.receiptType === type);
  if (!s) continue;
  const lines = (s.printTxt || '').split('\n');
  console.log(`\n══════════ ${type}  (printTime ${s.printTime}) ══════════`);
  console.log(lines.slice(0, 12).join('\n'));

  // 找一条真正有辨识度的行：不含店名/地址/分隔线/纯空白
  const distinctive = lines.find(
    (l) =>
      l.trim().length > 8 &&
      !/^[-=\s]*$/.test(l) &&
      !l.includes('LEO') &&
      !l.includes('Unit G1') &&
      !l.includes('TIN') &&
      !l.includes('SN') &&
      !l.includes('MIN'),
  );
  console.log(
    `\n  辨识行: ${JSON.stringify(distinctive?.trim() ?? '(无)')}` +
      `\n  在 EJ 输出中: ${distinctive && ej.includes(distinctive.trim()) ? '⚠ 命中' : '未出现'}`,
  );
}
