package com.ppos.ejtest;

import java.nio.file.Path;

/**
 * E-Journal 按日期范围导出 —— 改下面的常量，然后 {@code mvn -q exec:java} 即可。
 *
 * <p>不接受命令行参数，所有配置都在本文件顶部，改完直接跑。
 */
public class Main {

    // ═══════════════════ 在这里改 ═══════════════════

    /** 导出起始日期（YYYY-MM-DD） */
    private static final String START_DATE = "2026-08-01";

    /** 导出结束日期（YYYY-MM-DD，含当天） */
    private static final String END_DATE = "2026-08-31";

    /** POS 设备 ID（sys_device.id）。填 null = 门店级聚合，查该门店所有设备。 */
    private static final Long POS_ID = 205L;

    /** 云端地址，不带结尾斜杠 */
    private static final String BASE_URL = "http://47.80.75.159:8080";

    /**
     * 登录后拿到的 JWT，不要带 "Bearer " 前缀。
     *
     * <p><b>留空 = 走本地 fixture/ 目录，不连网。</b>
     */
    private static final String TOKEN = "Bearer eyJhbGciOiJIUzUxMiJ9.eyJ0ZW5hbnRfaWQiOjExNSwic3RvcmVfaWQiOjAsInVzZXJfdHlwZSI6IjAxIiwidXNlcl9pZCI6MjU5LCJ1c2VyX2tleSI6IjI0ZTg5YzY5LWM5YzctNGRkMC04ZWE3LTFiM2RlZWQ3NWE1MyIsImV4cCI6MTc4ODE4NTQxMCwidXNlcm5hbWUiOiJzYW5uaXVtYXN0ZXIiLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTE1In0.VBFZy0oa_rSFozesS68a6v8MVn5xd9V7rxpI51fBnNdgIjaPJNdd-1CpVm9EfRYnuMF9h6KaJj7E9JtibtO3Mw";

    // ═══════════════════ 以下不用改 ═══════════════════

    public static void main(String[] args) throws Exception {
        boolean useCloud = TOKEN != null && !TOKEN.isBlank();

        EjDataSource ds;
        if (useCloud) {
            ds = new CloudEjDataSource(BASE_URL, TOKEN);
        } else {
            ds = new FixtureEjDataSource(Path.of("fixture"));
        }

        System.out.println("──────────────────────────────────────────");
        System.out.println(" 数据源  : " + (useCloud ? "云端 " + BASE_URL : "本地 fixture/"));
        System.out.println(" POS ID  : " + (POS_ID == null ? "(门店级聚合)" : POS_ID));
        System.out.println(" 日期范围: " + START_DATE + " ~ " + END_DATE);
        System.out.println("──────────────────────────────────────────");

        if (!useCloud) {
            System.out.println("提示: TOKEN 为空，正在读本地 fixture/。");
            System.out.println("      要连云端，把 Main.TOKEN 填上登录返回的 JWT。");
            System.out.println();
        }

        EjExportService service = new EjExportService(ds);
        EjExportService.ExportResult result =
                service.export(START_DATE, END_DATE, POS_ID, msg -> System.out.println("  " + msg));

        System.out.println();
        System.out.printf(" 小票 %d 张 | 订单 %d 单 | 详情缺失 %d | 渲染失败 %d | 耗时 %dms (%.2fs)%n",
                result.taskCount(),
                result.orderCount(),
                result.missingDetailCount(),
                result.renderFailureCount(),
                result.elapsedMs(),
                result.elapsedMs() / 1000.0);

        if (result.missingDetailCount() > 0 || result.renderFailureCount() > 0) {
            System.out.println(" ⚠ 存在缺失或渲染失败，导出内容不完整，请核对上方日志。");
        }

        String base = EjExportService.fileName(START_DATE, END_DATE);
        Path outDir = Path.of("out");
        service.writeFiles(result, outDir, base);
        System.out.println(" 已写出 " + outDir.resolve(base + ".txt").toAbsolutePath());
        System.out.println(" 已写出 " + outDir.resolve(base + ".pdf").toAbsolutePath());

        System.out.println();
        System.out.println("──────────── 分阶段耗时 ────────────");
        System.out.println(result.timing());
    }
}
