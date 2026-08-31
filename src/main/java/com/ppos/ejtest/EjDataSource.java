package com.ppos.ejtest;

import java.util.List;

/**
 * EJ 数据源抽象。
 *
 * <p>把「数据从哪来」与「怎么渲染」解耦：
 * <ul>
 *   <li>{@link CloudEjDataSource} —— 走 /order/b-account-receipt/* HTTP 接口（联调/生产）</li>
 *   <li>{@link FixtureEjDataSource} —— 读本地 JSON（离线跑通链路 / 回归基准）</li>
 * </ul>
 *
 * <p>搬进 ppos-cloud 时会多一个直连 Mapper 的实现，省掉自己调自己的 HTTP。
 */
public interface EjDataSource {

    /**
     * 拉一页 EJ 列表。
     *
     * @param pageNum 从 1 开始
     * @return BAccountReceiptListVo 的 JSON（即响应体的 data 部分）
     */
    String fetchListPage(String startDate, String endDate, Long posId, int pageNum, int pageSize);

    /**
     * 批量拉订单详情。
     *
     * @return Map&lt;orderId, BAccountReceiptOrderDetailVo&gt; 的 JSON
     */
    String fetchOrderDetails(List<Long> orderIds);

    /**
     * 小票头部配置（门店 + 设备），对应 BAPP 的 PrinterConfigService.getPrinterConfig()。
     *
     * @return PrinterConfig 的 JSON
     */
    String fetchPrinterConfig(Long posId);
}
