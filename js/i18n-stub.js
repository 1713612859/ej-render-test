/**
 * @/i18n 的替身。
 *
 * constants/enums/receipt.ts 只在 getReceiptTypeLabel() 里用 i18n.t(),
 * 而 EJ 渲染路径不调它 —— 这里给个恒等实现，切断 i18next/react-i18next 依赖。
 * 若渲染过程中真的走到这里，会原样吐出 key，便于立刻发现。
 */
const i18n = {
  t: (key, opts) => (opts && opts.defaultValue) || key,
};

export default i18n;
