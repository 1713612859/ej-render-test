/**
 * EJ 校验的忽略口径（audit-ej / audit-content / audit-amounts 共用，须与 EjAudit.java 同步）。
 *
 *  1. REPRINT 重打单：内容与原张一致，只是打印时间不同。参与校验只会带来
 *     单号重复、Z 链断裂、时间逆序等误报 —— 直接忽略（数量在结构段另行提示）。
 *  2. 后厨类辅助单据：KITCHEN DOCKET(厨单/退菜厨单)、ORDER SLIP(点菜单)、
 *     ADDITIONAL(加菜)、Transfer Slip(转桌单)。无金额、无税号头，
 *     名称行也不受发票模板的排版约束。
 *  3. BILLING 预结单（THIS IS NOT A SALES INVOICE）与 DAILY / HOURLY SALES REPORT。
 */
const AUX_TITLES = [
  'ORDER SLIP',
  'KITCHEN DOCKET',
  'ADDITIONAL',
  'Transfer Slip',
  'THIS IS NOT A SALES INVOICE',
  'DAILY SALES REPORT',
  'HOURLY SALES REPORT',
  'VOID \\(退菜\\)',
];

const isAux = (b) =>
  AUX_TITLES.some((t) =>
    new RegExp(`^ *${t}(（[^）]*）|\\([^)]*\\))? *$`, 'm').test(b),
  );

const isReprint = (b) => /^ *REPRINT *$/m.test(b);

/** 校验时是否忽略该票块。 */
const isIgnored = (b) => isReprint(b) || isAux(b);

export { isAux, isReprint, isIgnored };
