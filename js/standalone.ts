/**
 * EJ 渲染引擎 —— 脱离 React Native 的独立入口
 *
 * esbuild 从这里出发 tree-shaking，把 templates + mappers + 编排器打成单文件。
 * 云端(GraalJS)与设备端(RN)共用这一份产物，保证 EJ 输出逐字节一致。
 */

// 编排：按日期范围组装整份 E-Journal（云端下载走这个）
export { createEjournalAssembler } from '@/services/receiptRender/ejournalAssembler';
export type {
  EjournalOptions,
  EjournalStats,
  EjournalAssembler,
} from '@/services/receiptRender/ejournalAssembler';

// 单据级渲染：单张重打 / 调试用
export {
  generateOrderReceiptTexts,
  generateShiftReceiptText,
  generateDailySettlementReceiptText,
  generateCashInText,
  generatePickupCashText,
  generateCashOutText,
} from '@/services/receiptRender/mappers';

export { stripPrinterMarkers } from '@/services/receiptRender/txtOutput';
