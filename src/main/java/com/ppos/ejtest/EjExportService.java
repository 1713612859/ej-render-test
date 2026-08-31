package com.ppos.ejtest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * 按日期范围导出 E-Journal。
 *
 * <p>流程与 BAPP EJournalDialog 的四阶段一一对应：
 * <ol>
 *   <li>STAGE 1+2 —— 循环分页拉 list，每页立刻 batch 拉详情并喂给编排器（内存按页释放）</li>
 *   <li>STAGE 3 —— 班次 / 日结 / verbatim receipts（首页返回，编排器内部处理）</li>
 *   <li>STAGE 4 —— 排序 + 拼接（编排器 finish）</li>
 *   <li>落盘 —— UTF-8 BOM + txt，另出 PDF</li>
 * </ol>
 *
 * <p>与设备端行为对齐:{@code isReprint=false},不输出 REPRINT 文案
 * (BAPP 侧 EJ 同样不带;云端重打副本已被 SQL 层过滤,此开关恒为 false)。
 */
public class EjExportService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** 与 BAPP 一致：每页 500 单，落在后端 batch 上限 1000 之内。 */
    private static final int PAGE_SIZE = 500;

    private final EjDataSource dataSource;

    public EjExportService(EjDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public record ExportResult(String text, int taskCount, int orderCount,
                               int missingDetailCount, int renderFailureCount,
                               long elapsedMs, Timing timing) {}

    /** 分阶段耗时，用来定位瓶颈而不是猜。 */
    public static class Timing {
        public long configMs;    // 门店/设备 HTTP
        public long engineMs;    // GraalJS 初始化 + 解析 bundle
        public long listMs;      // 拉列表 HTTP
        public long detailMs;    // 拉详情 HTTP
        public long renderMs;    // JS 渲染
        public long finishMs;    // 排序 + 拼接
        public long txtMs;       // 写 txt
        public long pdfMs;       // 出 PDF

        @Override
        public String toString() {
            return String.format(
                    " config %dms | engine %dms | list %dms | detail %dms%n"
                    + " render %dms | finish %dms | txt %dms | pdf %dms",
                    configMs, engineMs, listMs, detailMs, renderMs, finishMs, txtMs, pdfMs);
        }
    }

    public ExportResult export(String startDate, String endDate, Long posId,
                               Consumer<String> progress) {
        long t0 = System.currentTimeMillis();
        Timing tm = new Timing();

        long s = System.currentTimeMillis();
        String configJson = dataSource.fetchPrinterConfig(posId);
        tm.configMs = System.currentTimeMillis() - s;

        String optionsJson;
        try {
            optionsJson = MAPPER.createObjectNode()
                    .put("startDate", startDate)
                    .put("endDate", endDate)
                    .put("isReprint", false)
                    .put("bilingual", false)
                    .toString();
        } catch (Exception e) {
            throw new IllegalStateException("构造 options 失败", e);
        }

        String text;
        JsonNode stats;
        s = System.currentTimeMillis();
        // 引擎进程内复用：bundle 无状态，重建一次要 ~1.5s，没必要每次导出都付。
        // 注意不能 close()，close 掉后续导出就得重新初始化。
        EjRenderEngine engine = EjRenderEngine.shared();
        {
            EjRenderEngine.Assembler asm = engine.newAssembler(configJson, optionsJson);
            tm.engineMs = System.currentTimeMillis() - s;

            int pageNum = 1;
            int total = 0;
            int fetched = 0;
            boolean hasNextPage = true;

            while (hasNextPage) {
                s = System.currentTimeMillis();
                String listJson = dataSource.fetchListPage(startDate, endDate, posId, pageNum, PAGE_SIZE);
                tm.listMs += System.currentTimeMillis() - s;
                JsonNode list = readTree(listJson);

                if (pageNum == 1) {
                    total = list.path("total").asInt(list.path("orders").size());
                    if (total == 0 && list.path("shiftRecords").size() == 0
                            && list.path("dailySettlements").size() == 0) {
                        // 完全没数据，仍要把首页 extras 交给编排器（可能只有 receipts）
                        asm.addPage(listJson, "{}");
                        break;
                    }
                }

                List<Long> orderIds = new ArrayList<>();
                for (JsonNode o : list.path("orders")) {
                    orderIds.add(o.path("id").asLong());
                }

                fetched += orderIds.size();
                progress.accept(String.format("拉取订单 %d/%d (第 %d 页)", fetched, total, pageNum));

                s = System.currentTimeMillis();
                String detailsJson = orderIds.isEmpty() ? "{}" : dataSource.fetchOrderDetails(orderIds);
                tm.detailMs += System.currentTimeMillis() - s;

                s = System.currentTimeMillis();
                asm.addPage(listJson, detailsJson);
                tm.renderMs += System.currentTimeMillis() - s;

                hasNextPage = list.path("hasNextPage").asBoolean(false);
                pageNum++;
            }

            progress.accept("排序与拼接...");
            s = System.currentTimeMillis();
            text = asm.finish();
            tm.finishMs = System.currentTimeMillis() - s;
            stats = readTree(asm.stats());
        }

        return new ExportResult(
                text,
                stats.path("taskCount").asInt(),
                stats.path("orderCount").asInt(),
                stats.path("missingDetailCount").asInt(),
                stats.path("renderFailureCount").asInt(),
                System.currentTimeMillis() - t0,
                tm);
    }

    /** 写 txt（UTF-8 + BOM，与 BAPP 导出一致）+ pdf。 */
    public void writeFiles(ExportResult result, Path outDir, String baseName) throws IOException {
        Files.createDirectories(outDir);

        long s = System.currentTimeMillis();
        Path txt = outDir.resolve(baseName + ".txt");
        Files.writeString(txt, "﻿" + result.text(), StandardCharsets.UTF_8);
        result.timing().txtMs = System.currentTimeMillis() - s;

        s = System.currentTimeMillis();
        File pdf = outDir.resolve(baseName + ".pdf").toFile();
        TxtToPdf.convert(result.text(), pdf);
        result.timing().pdfMs = System.currentTimeMillis() - s;
    }

    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");


    /**
     * 与 BAPP 的文件名格式一致：EJournal_2026-07-01~2026-07-31，
     * 但为了区分多次生成的内容，额外加了时间戳，方便直接知道是什么时候导出的。
     *
     * <p><b>返回的是不带扩展名的 basename</b> —— {@link #writeFiles} 会自己拼
     * ".txt" / ".pdf"。这里若再带上 ".txt"，产物会变成 xxx.txt.txt 和 xxx.txt.pdf。
     */
    public static String fileName(String startDate, String endDate) {
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);
        return String.format("EJournal_%s_%s_%s", startDate, endDate, timestamp);
    }

    private static JsonNode readTree(String json) {
        try {
            return MAPPER.readTree(json);
        } catch (Exception e) {
            throw new IllegalStateException("JSON 解析失败", e);
        }
    }
}
