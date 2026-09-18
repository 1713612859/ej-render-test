package com.ppos.ejtest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 走真实云端接口的数据源。
 *
 * <p>对应 BAccountReceiptController 的三个端点。租户/门店由 JWT 决定，
 * 这里只需要带上 token；posId 决定查哪台设备（为空 = 门店级聚合）。
 */
public class CloudEjDataSource implements EjDataSource {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final String baseUrl;
    private final String token;
    private final HttpClient http;

    public CloudEjDataSource(String baseUrl, String token) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.token = normalizeToken(token);
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    /**
     * 容忍直接从浏览器/Postman 复制来的 "Bearer xxx"。
     * 不剥的话请求头会变成 "Bearer Bearer xxx"，后端一律 401。
     */
    private static String normalizeToken(String raw) {
        String t = raw == null ? "" : raw.trim();
        if (t.regionMatches(true, 0, "Bearer ", 0, 7)) {
            t = t.substring(7).trim();
        }
        return t;
    }

    @Override
    public String fetchListPage(String startDate, String endDate, Long posId, int pageNum, int pageSize) {
        StringBuilder url = new StringBuilder(baseUrl)
                .append("/order/b-account-receipt/list")
                .append("?startDate=").append(enc(startDate))
                .append("&endDate=").append(enc(endDate))
                .append("&pageNum=").append(pageNum)
                .append("&pageSize=").append(pageSize);
        if (posId != null) {
            url.append("&posId=").append(posId);
        }
        return unwrap(get(url.toString(), Duration.ofSeconds(60)));
    }

    @Override
    public String fetchOrderDetails(List<Long> orderIds) {
        if (orderIds.isEmpty()) {
            return "{}";
        }
        if (orderIds.size() > 1000) {
            throw new IllegalArgumentException("单次批量上限 1000 个订单，调用方需分批");
        }
        String body = "[" + orderIds.stream().map(String::valueOf).collect(Collectors.joining(",")) + "]";
        HttpRequest req = HttpRequest.newBuilder(URI.create(baseUrl + "/order/b-account-receipt/order/batch"))
                .timeout(Duration.ofMinutes(5))
                .header("Content-Type", "application/json")
                .header("Accept-Encoding", "gzip")
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        return unwrap(send(req));
    }

    /**
     * 门店 + 设备信息拼成 PrinterConfig，对齐 BAPP getPrinterConfig()：
     * storeName 取 companyName，address 取 taxAddress。
     *
     * <p>storeId 从设备反查（BAPP 是从本地 bindingInfo 拿的，云端没有这个上下文）。
     * posId 为空时无法定位门店，只能返回空 config —— 小票头部会缺失，
     * 门店级聚合导出需要调用方显式提供 storeId。
     *
     * <p>搬进 ppos-cloud 后这里改成直接查 sys_store / sys_device，不必再走 HTTP。
     */
    @Override
    public String fetchPrinterConfig(Long posId) {
        JsonNode device = MAPPER.createObjectNode();
        JsonNode store = MAPPER.createObjectNode();

        if (posId != null) {
            device = readTree(unwrap(get(
                    baseUrl + "/system/sysDevice/" + posId, Duration.ofSeconds(20))));
            JsonNode storeId = device.get("storeId");
            if (storeId != null && !storeId.isNull()) {
                store = readTree(unwrap(get(
                        baseUrl + "/system/sysStore/" + storeId.asLong(), Duration.ofSeconds(20))));
            } else {
                System.out.println("  ⚠ 设备 " + posId + " 未绑定门店，小票头部门店信息将为空");
            }
        } else {
            System.out.println("  ⚠ POS_ID 为空，无法定位门店/设备，小票头部将为空");
        }

        var cfg = MAPPER.createObjectNode();
        cfg.put("width", 80);
        cfg.put("charPerLine", 48);
        cfg.put("storeName", text(store, "companyName", text(store, "storeName", "")));
        cfg.put("companyName", text(store, "companyName", ""));
        cfg.put("address", text(store, "taxAddress", text(store, "address", "")));
        cfg.put("tinNumber", text(store, "tinNumber", ""));
        cfg.put("taxType", text(store, "taxType", ""));
        cfg.put("snCode", text(device, "snCode", text(device, "deviceCode", "")));
        cfg.put("minNo", text(device, "minNo", ""));
        cfg.put("ptuNo", text(device, "ptuNo", ""));
        cfg.put("issueDate", text(device, "issueDate", ""));
        cfg.put("terminalNo", text(device, "terminalNo", ""));

        System.out.println("  门店/设备: " + cfg.path("companyName").asText("(空)")
                + " | TIN " + cfg.path("tinNumber").asText("(空)")
                + " | SN " + cfg.path("snCode").asText("(空)")
                + " | TERM " + cfg.path("terminalNo").asText("(空)"));
        return cfg.toString();
    }

    // ── 内部工具 ──────────────────────────────────────────

    private String get(String url, Duration timeout) {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .timeout(timeout)
                .header("Accept-Encoding", "gzip")
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        return send(req);
    }

    private String send(HttpRequest req) {
        try {
            HttpResponse<byte[]> resp = http.send(req, HttpResponse.BodyHandlers.ofByteArray());
            String encoding = resp.headers().firstValue("Content-Encoding").orElse("");
            byte[] body = resp.body();
            long raw = body == null ? 0 : body.length;
            if (body != null && encoding.equalsIgnoreCase("gzip")) {
                try (var in = new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(body))) {
                    body = in.readAllBytes();
                }
                System.out.printf("  [gzip] %s : %.0f KB -> %.0f KB (压缩到 %.0f%%)%n",
                        req.uri(), raw / 1024.0, body.length / 1024.0, raw * 100.0 / body.length);
            }
            String text = body == null ? "" : new String(body, StandardCharsets.UTF_8);
            if (resp.statusCode() != 200) {
                throw new IllegalStateException("HTTP " + resp.statusCode() + " @ " + req.uri()
                        + " : " + truncate(text));
            }
            return text;
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("请求失败 " + req.uri(), e);
        }
    }

    /**
     * 剥掉 RuoYi 的 R&lt;&gt; 包装，取 data；code != 200 直接抛。
     */
    private String unwrap(String body) {
        JsonNode root = readTree(body);
        JsonNode code = root.get("code");

        if (code != null && code.asInt() != 200) {
            int c = code.asInt();
            String msg = text(root, "msg", "");
            if (c == 401) {
                throw new IllegalStateException("认证失败 (401): " + msg
                        + "\n  → " + describeToken()
                        + "\n  → TOKEN 直接填 JWT 即可，带不带 \"Bearer \" 前缀都行（会自动剥离）");
            }
            throw new IllegalStateException("业务失败 code=" + c + " msg=" + msg);
        }
        JsonNode data = root.get("data");
        return data == null || data.isNull() ? "{}" : data.toString();
    }

    /**
     * 解析 JWT payload，报告过期时间与租户信息，帮助快速定位 401 原因。
     */
    private String describeToken() {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return "TOKEN 不是合法 JWT（分段数 " + parts.length + "），请检查是否复制完整";
            }
            byte[] payload = java.util.Base64.getUrlDecoder().decode(parts[1]);
            JsonNode claims = MAPPER.readTree(payload);
            long exp = claims.path("exp").asLong();
            long now = System.currentTimeMillis() / 1000;
            String when = java.time.Instant.ofEpochSecond(exp)
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime().toString();
            String state = exp < now
                    ? "已于 " + when + " 过期，请重新登录获取"
                    : "有效期至 " + when + "（未过期，检查是否连错环境/租户）";
            return "TOKEN " + state
                    + "；tenant=" + claims.path("tenant_code").asText("?")
                    + " user=" + claims.path("username").asText("?")
                    + " store_id=" + claims.path("store_id").asText("?");
        } catch (Exception e) {
            return "TOKEN 解析失败: " + e.getMessage();
        }
    }

    private static JsonNode readTree(String json) {
        try {
            return MAPPER.readTree(json);
        } catch (Exception e) {
            throw new IllegalStateException("响应不是合法 JSON: " + truncate(json), e);
        }
    }

    private static String text(JsonNode node, String field, String fallback) {
        if (node == null) return fallback;
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? fallback : v.asText();
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private static String truncate(String s) {
        return s == null ? "" : (s.length() > 300 ? s.substring(0, 300) + "..." : s);
    }
}
