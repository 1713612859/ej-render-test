-- ============================================================
-- 反查：EJ 明细缺退货票（2026-08-24 RETURN#13 / #18）的根因坐实
-- 日期: 2026-08-27
-- 环境: 8.163.56.101  租户 96 (T0000096, leorestaurant)  门店 73  POS 1938 (terminal_no=645)
-- 全部只读 SELECT，无副作用。MySQL 8（用到 CTE + 窗口函数）。
-- ============================================================
--
-- 【代码里的假设】一个订单最多一条退货记录：
--
--   BAccountSalesOrderRefundMapper.listByOrderIds 注释：
--     "refund 与 order 是 1:1,SQL 不加 LIMIT,由 service 层按 orderId 分组取首条"
--
--   BAccountReceiptServiceImpl:459   toMap(...::getSalesOrderId, r -> r, (a, b) -> a)   ← 后来者丢弃
--   BAccountReceiptServiceImpl:376   rw.eq(...::getSalesOrderId, orderId).last("LIMIT 1")
--   ej-render.js:4206                if (detail.refundRecord) { ...渲染两联... }        ← 给一条只出一张
--   ej-render.js:4694                if (orderSiNumbers.has(si)) continue;              ← 兜底 verbatim 按
--                                                                                          【原单 SI】跳过，
--                                                                                          没渲染的那张一并跳
--
-- 【注意】同样的 1:1 写法在作废侧是对的 —— 作废无"部分"概念，一单只能作废一次。
--         错的只是把它套到了 refund 上（refund_type='PARTIAL' 可多次）。详见 Q6。
--
-- 【判据】
--   Q1 有结果  → 1:1 假设不成立，上面三层必然丢票，与 HTTP 接口实测一致 → 根因坐实。
--   Q1 无结果  → 假设成立，问题另有出处，转去查 A 账源表 ppos_sales_order_refund。
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- Q1【核心】同一订单多条退货记录 —— 直接证伪 1:1
--    rn=1 是接口唯一能返回的那条，rn>1 全部取不到
--    预期：≥2 行（订单 22120 → #12/#13，订单 22137 → #17/#18）
-- ────────────────────────────────────────────────────────────
WITH r AS (
    SELECT id, sales_order_id, refund_no, refund_type, refund_time, gross_sales,
           ROW_NUMBER() OVER (PARTITION BY sales_order_id ORDER BY id) AS rn
    FROM b_account_sales_order_refund
    WHERE tenant_id = 96
)
SELECT o.si_number,
       o.business_date,
       r.sales_order_id,
       COUNT(*)                                                  AS refund_cnt,
       GROUP_CONCAT(r.refund_no ORDER BY r.id)                   AS refund_nos,
       SUM(r.gross_sales)                                        AS gross_all,
       SUM(CASE WHEN r.rn = 1 THEN r.gross_sales ELSE 0 END)     AS gross_kept,
       SUM(CASE WHEN r.rn > 1 THEN r.gross_sales ELSE 0 END)     AS gross_lost
FROM r
JOIN b_account_sales_order o ON o.id = r.sales_order_id
GROUP BY o.si_number, o.business_date, r.sales_order_id
HAVING COUNT(*) > 1
ORDER BY o.business_date, o.si_number;


-- ────────────────────────────────────────────────────────────
-- Q2 08-24 两组的逐条明细 —— 看清 kept / lost 分别是哪条
--    预期：SI 107 → #12 可见 / #13 丢；SI 121 → #17 可见 / #18 丢
-- ────────────────────────────────────────────────────────────
WITH r AS (
    SELECT id, sales_order_id, refund_no, refund_type, refund_time,
           gross_sales, service_charge, vat_amount, refund_amount,
           ROW_NUMBER() OVER (PARTITION BY sales_order_id ORDER BY id) AS rn
    FROM b_account_sales_order_refund
    WHERE tenant_id = 96
)
SELECT o.si_number,
       r.id,
       r.refund_no,
       r.refund_type,
       r.refund_time,
       r.gross_sales,
       r.service_charge,
       r.vat_amount,
       r.refund_amount,
       CASE WHEN r.rn = 1 THEN '✔ 接口返回(首条)' ELSE '✘ 被 (a,b)->a 丢弃' END AS api_visibility
FROM r
JOIN b_account_sales_order o ON o.id = r.sales_order_id
WHERE o.si_number IN ('0000000000000107', '0000000000000121')
ORDER BY o.si_number, r.id;


-- ────────────────────────────────────────────────────────────
-- Q3 影响面：按营业日统计丢了几张、丢了多少钱
--    决定要不要回溯补报已提交的 EJ
-- ────────────────────────────────────────────────────────────
WITH r AS (
    SELECT id, sales_order_id, gross_sales,
           ROW_NUMBER() OVER (PARTITION BY sales_order_id ORDER BY id) AS rn
    FROM b_account_sales_order_refund
    WHERE tenant_id = 96
)
SELECT o.business_date,
       COUNT(*)                                              AS refund_rows,    -- 真实退货笔数
       SUM(CASE WHEN r.rn = 1 THEN 1 ELSE 0 END)             AS ej_rendered,    -- EJ 实际出的张数
       SUM(CASE WHEN r.rn > 1 THEN 1 ELSE 0 END)             AS lost_receipts,
       SUM(r.gross_sales)                                    AS gross_all,
       SUM(CASE WHEN r.rn > 1 THEN r.gross_sales ELSE 0 END) AS gross_lost
FROM r
JOIN b_account_sales_order o ON o.id = r.sales_order_id
GROUP BY o.business_date
HAVING lost_receipts > 0
ORDER BY o.business_date;


-- ────────────────────────────────────────────────────────────
-- Q4 与 Z 报表对账：日结的 LESS RETURN 是按【全部】退货累加的吗？
--    若 diff_all≈0 而 diff_first 明显不为 0，就证明：
--      Z 报表用全量、EJ 明细只用首条 —— 正是审计工具报出的 3670.01 差额来源
--    注：less_return 是剥完 VAT 的净额，加回 vat_on_return 才是含税毛额
-- ────────────────────────────────────────────────────────────
WITH r AS (
    SELECT sales_order_id, gross_sales,
           ROW_NUMBER() OVER (PARTITION BY sales_order_id ORDER BY id) AS rn
    FROM b_account_sales_order_refund
    WHERE tenant_id = 96
),
per_day AS (
    SELECT o.business_date,
           SUM(r.gross_sales)                                    AS refund_all,
           SUM(CASE WHEN r.rn = 1 THEN r.gross_sales ELSE 0 END) AS refund_first_only
    FROM r
    JOIN b_account_sales_order o ON o.id = r.sales_order_id
    WHERE o.tenant_id = 96 AND o.store_id = 73
    GROUP BY o.business_date
)
SELECT d.business_date,
       d.less_return,
       d.vat_on_return,
       d.less_return + d.vat_on_return                       AS z_return_gross,
       ABS(p.refund_all)                                     AS refund_all,
       ABS(p.refund_first_only)                              AS refund_first_only,
       (d.less_return + d.vat_on_return) - ABS(p.refund_all)        AS diff_all,
       (d.less_return + d.vat_on_return) - ABS(p.refund_first_only) AS diff_first
FROM b_account_daily_settlement d
LEFT JOIN per_day p ON p.business_date = d.business_date
WHERE d.tenant_id = 96
  AND d.store_id = 73
  AND d.business_date BETWEEN '2026-07-27' AND '2026-08-25'
ORDER BY d.business_date;


-- ────────────────────────────────────────────────────────────
-- Q5 排除「B 账复制阶段就丢了」：A 账源表 vs B 账逐单比条数
--    预期：两边一致 → 复制没问题，问题在查询/渲染层
--    (源表在 ppos_pos_api 库；客户端已连该库就把前缀去掉)
-- ────────────────────────────────────────────────────────────
SELECT a.sales_order_id,
       COUNT(DISTINCT a.id) AS src_cnt,
       COUNT(DISTINCT b.id) AS bacct_cnt
FROM ppos_pos_api.ppos_sales_order_refund a
LEFT JOIN b_account_sales_order_refund b ON b.id = a.id
WHERE a.tenant_id = 96
GROUP BY a.sales_order_id
HAVING src_cnt > 1 OR src_cnt <> bacct_cnt
ORDER BY a.sales_order_id;


-- ────────────────────────────────────────────────────────────
-- Q6 作废侧兜底核对（不是同一个坑，别照着 refund 类推）
--
--    voidByOrder 也写成 (a,b)->a / LIMIT 1（BAccountReceiptServiceImpl:455 与 :370），
--    写法与 refund 一样，但作废侧的 1:1 是**成立**的：
--      · b_account_sales_order_void 没有 refundType 这类"部分/全部"字段，
--        作废是整单动作，不存在"部分作废"；
--      · 订单作废后状态即为已作废，没有再作废一次的后续动作；
--      · 实测该租户 5 张作废单对应 5 个不同原单，无重复。
--    退货则相反：refund_type='PARTIAL' 摆明了同一原单可以分多次退。
--
--    所以本查询是**兜底**而非举证：
--      预期为空 → 1:1 成立，作废侧无需修改，修复范围只收在 refund 一条路。
--      若非空   → 出现了未预料的重复作废，先找业务确认是不是正常单据，
--                 再决定要不要照 refund 的方案一并改。
-- ────────────────────────────────────────────────────────────
SELECT o.si_number,
       o.business_date,
       v.sales_order_id,
       COUNT(*)                              AS void_cnt,
       GROUP_CONCAT(v.void_no ORDER BY v.id) AS void_nos
FROM b_account_sales_order_void v
JOIN b_account_sales_order o ON o.id = v.sales_order_id
WHERE v.tenant_id = 96
GROUP BY o.si_number, o.business_date, v.sales_order_id
HAVING COUNT(*) > 1
ORDER BY o.business_date;


-- ────────────────────────────────────────────────────────────
-- Q7 退货明细行同样丢：refund_item 只按 refund_id 关联
--    (BAccountReceiptServiceImpl:498  refundItemsByRefund.get(refundRec.getId()))
--    首条之外的 refund 的 item 在接口里同样取不到
-- ────────────────────────────────────────────────────────────
WITH r AS (
    SELECT id, sales_order_id, refund_no,
           ROW_NUMBER() OVER (PARTITION BY sales_order_id ORDER BY id) AS rn
    FROM b_account_sales_order_refund
    WHERE tenant_id = 96
)
SELECT r.sales_order_id,
       r.id AS refund_id,
       r.refund_no,
       COUNT(i.id) AS item_cnt,
       CASE WHEN r.rn = 1 THEN '✔ 明细可见' ELSE '✘ 明细一并丢失' END AS visibility
FROM r
LEFT JOIN b_account_sales_order_refund_item i ON i.sales_order_refund_id = r.id
WHERE r.sales_order_id IN (
        SELECT sales_order_id
        FROM b_account_sales_order_refund
        WHERE tenant_id = 96
        GROUP BY sales_order_id
        HAVING COUNT(*) > 1)
GROUP BY r.sales_order_id, r.id, r.refund_no, r.rn
ORDER BY r.sales_order_id, r.id;


-- ────────────────────────────────────────────────────────────
-- Q8 旁证：打印日志里两张票都在（HTTP 接口已实测，这里从库侧再确认）
--    预期：RETURN#13 / #18 各 2 联，extend 只有 copyType、没有 isReprint
--    → receipt_type 白名单与 isReprint 过滤都不是原因
-- ────────────────────────────────────────────────────────────
SELECT receipt_no,
       pos_no,
       print_time,
       extend,
       print_status,
       yn
FROM ppos_pos_api.ppos_system_receipt
WHERE tenant_id = 96
  AND receipt_type = 'RETURN_TXN'
  AND print_time >= '2026-08-24'
  AND print_time <  '2026-08-25'
ORDER BY receipt_no, print_time;
