package com.ppos.ejtest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * 本地文件数据源 —— 离线跑通整条链路，也用作回归基准。
 *
 * <p>把抓到的真实响应按下面的名字丢进 fixture 目录即可，无需改代码：
 * <pre>
 *   fixture/
 *     config.json      PrinterConfig（缺省则从 sample-order.json 的快照字段推导）
 *     list-1.json      /list?pageNum=1 响应的 data 部分
 *     list-2.json      第 2 页……以此类推
 *     details.json     /order/batch 响应的 data 部分（Map&lt;orderId, 详情&gt;，全部页合并）
 * </pre>
 *
 * <p>fixture 目录不存在或 list-1.json 缺失时，退化为「用 classpath 里的
 * sample-order.json 合成一个单订单页」，保证开箱即跑。
 */
public class FixtureEjDataSource implements EjDataSource {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final Path fixtureDir;

    public FixtureEjDataSource(Path fixtureDir) {
        this.fixtureDir = fixtureDir;
    }

    @Override
    public String fetchListPage(String startDate, String endDate, Long posId, int pageNum, int pageSize) {
        Path f = fixtureDir.resolve("list-" + pageNum + ".json");
        if (Files.exists(f)) {
            return read(f);
        }
        if (pageNum == 1) {
            return synthesizeListPage();
        }
        return "{\"orders\":[],\"shiftRecords\":[],\"dailySettlements\":[],\"hasNextPage\":false}";
    }

    @Override
    public String fetchOrderDetails(List<Long> orderIds) {
        Path f = fixtureDir.resolve("details.json");
        JsonNode all = Files.exists(f) ? readTree(read(f)) : synthesizeDetails();

        // 只回传本页请求的 id，模拟真实 batch 行为
        ObjectNode picked = MAPPER.createObjectNode();
        for (Long id : orderIds) {
            JsonNode v = all.get(String.valueOf(id));
            if (v != null) {
                picked.set(String.valueOf(id), v);
            }
        }
        return picked.toString();
    }

    @Override
    public String fetchPrinterConfig(Long posId) {
        Path f = fixtureDir.resolve("config.json");
        if (Files.exists(f)) {
            return read(f);
        }
        // 从样本订单的门店/设备快照推导，对齐 BAPP getPrinterConfig()
        JsonNode order = readTree(sampleOrderJson()).path("order");
        ObjectNode cfg = MAPPER.createObjectNode();
        cfg.put("width", 80);
        cfg.put("charPerLine", 48);
        cfg.put("storeName", order.path("companyLegalName").asText(""));
        cfg.put("companyName", order.path("companyLegalName").asText(""));
        cfg.put("address", order.path("taxAddress").asText(""));
        cfg.put("tinNumber", order.path("tinNumber").asText(""));
        cfg.put("taxType", "VAT");
        cfg.put("snCode", order.path("serialNumber").asText(""));
        cfg.put("minNo", order.path("minNumber").asText(""));
        cfg.put("ptuNo", order.path("ptuNumber").asText(""));
        cfg.put("issueDate", order.path("ptuEffectiveDate").asText(""));
        cfg.put("terminalNo", order.path("terminalNo").asText(""));
        return cfg.toString();
    }

    // ── 合成兜底 ──────────────────────────────────────────

    /** 用 sample-order.json 造一个只有一单的首页。 */
    private String synthesizeListPage() {
        JsonNode order = readTree(sampleOrderJson()).path("order");

        ObjectNode header = MAPPER.createObjectNode();
        header.put("id", order.path("id").asLong());
        header.put("orderNo", order.path("orderNo").asText());
        header.put("siNumber", order.path("siNumber").asText());
        header.put("orderStatus", order.path("orderStatus").asInt());
        header.put("businessDate", order.path("businessDate").asText());
        header.put("orderTime", order.path("orderTime").asText());
        header.put("paidAt", order.path("paidAt").asText());
        header.put("cashierName", order.path("cashierName").asText());

        ObjectNode list = MAPPER.createObjectNode();
        list.set("orders", MAPPER.createArrayNode().add(header));
        list.set("shiftRecords", MAPPER.createArrayNode());
        list.set("dailySettlements", MAPPER.createArrayNode());
        list.set("receipts", MAPPER.createArrayNode());
        list.put("total", 1);
        list.put("pageNum", 1);
        list.put("pageSize", 500);
        list.put("hasNextPage", false);
        return list.toString();
    }

    /** 用 sample-order.json 造 Map&lt;orderId, 详情&gt;。 */
    private JsonNode synthesizeDetails() {
        JsonNode detail = readTree(sampleOrderJson());
        ObjectNode map = MAPPER.createObjectNode();
        map.set(String.valueOf(detail.path("order").path("id").asLong()), detail);
        return map;
    }

    private static String sampleOrderJson() {
        try (InputStream in = FixtureEjDataSource.class.getResourceAsStream("/sample-order.json")) {
            if (in == null) {
                throw new IllegalStateException("classpath 下找不到 sample-order.json");
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("读取 sample-order.json 失败", e);
        }
    }

    private static String read(Path p) {
        try {
            return Files.readString(p, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("读取 " + p + " 失败", e);
        }
    }

    private static JsonNode readTree(String json) {
        try {
            return MAPPER.readTree(json);
        } catch (Exception e) {
            throw new IllegalStateException("JSON 解析失败", e);
        }
    }
}
