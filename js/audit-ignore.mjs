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

/** 8 种标准交易票型（含其一即按标准票处理，不做辅助单判断）。 */
const KNOWN_TYPE =
  /^ *(CASH IN|SALES INVOICE|RETURN TRANSACTION|VOID TRANSACTION|PICK UP CASH|CASH OUT|X-READING|Z-READING REPORT) *$/m;

/**
 * 校验时是否忽略该票块。
 *
 * 辅助单判断只对「非标准票型」的块生效 —— 2026-09-17 SANNIU 店踩过：
 * 某商品的品名就叫 ADDITIONAL，整张销售发票被误判成加菜单剔出校验，
 * 连带 SI 断号 6 / Z11 缺号 6 / Z12 毛额 3 天对不上。
 */
const isIgnored = (b) => isReprint(b) || (!KNOWN_TYPE.test(b) && isAux(b));

export { isAux, isReprint, isIgnored, KNOWN_TYPE };
