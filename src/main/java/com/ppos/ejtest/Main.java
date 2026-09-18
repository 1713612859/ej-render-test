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
    private static final String START_DATE = "2026-05-01";

    /** 导出结束日期（YYYY-MM-DD，含当天）。注意每月天数，如 9 月只有 30 天 */
    private static final String END_DATE = "2026-09-30";

    /** POS 设备 ID（sys_device.id）。填 null = 门店级聚合，查该门店所有设备。 */
    // default 151 测试门店
    private static final Long POS_ID = 1079635083984960L;

            // wingmaster
//    private static final Long POS_ID = 182L;

            // 132 kyo master
//    private static final Long POS_ID = 275L;

    // 115 sanniu 火锅
//    private static final Long POS_ID = 205L;


    // 125 skymart 零售店
//    private static final Long POS_ID = 225L;

        // mikhamaster  112
//    private static final Long POS_ID = 194L;


//    111	WANJIAXING
//    private static final Long POS_ID =192L;


    /** 云端地址，不带结尾斜杠 */
    private static final String BASE_URL = "https://devppos.luojia58.cn";

    /**
     * 登录后拿到的 JWT，不要带 "Bearer " 前缀。
     *
     * <p><b>留空 = 走本地 fixture/ 目录，不连网。</b>
     */
    // 本地测试 151
    private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA3NTI5MjAsImduIjowLCJpYXQiOjE3ODk1NDMzMjAsInNjb3BlIjoxNTEsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTUxIiwidGVuYW50X2lkIjoxNTEsInVzZXJJZCI6MTAwMDA3MywidXNlcl9pZCI6MTAwMDA3MywidXNlcl9rZXkiOiJfdG9rZW46MTAwMDA3MzoyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJ0ZXN0bGVvMSJ9.TDb3sRNbS2V0ZFxaT08UE0FYjORyMlzJ6HFFO9c1GpE";




    // sanniu test  115  ⭕代表半勾
//     private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA4MzQ5NzUsImduIjowLCJpYXQiOjE3ODk2MjUzNzUsInNjb3BlIjoxMTUsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTE1IiwidGVuYW50X2lkIjoxMTUsInVzZXJJZCI6MjU5LCJ1c2VyX2lkIjoyNTksInVzZXJfa2V5IjoiX3Rva2VuOjI1OToyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJzYW5uaXVtYXN0ZXIifQ.-WgIbzbhPSlP7_j4rPzO4rySQYtB34PGrSOaXjnf9Mo";

    // wingmaster 107
//    private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA4NTc1NjMsImduIjowLCJpYXQiOjE3ODk2NDc5NjMsInNjb3BlIjoxMDcsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTA3IiwidGVuYW50X2lkIjoxMDcsInVzZXJJZCI6MjI3LCJ1c2VyX2lkIjoyMjcsInVzZXJfa2V5IjoiX3Rva2VuOjIyNzoyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJ3aW5nbWFzdGVyIn0.al4D-sJCIjm_24nWIu4FDJkNHdK39locIeY_Lawiee8";

    // kyo master 132 ✅
//    private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA4NTc5OTgsImduIjowLCJpYXQiOjE3ODk2NDgzOTgsInNjb3BlIjoxMzIsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTMyIiwidGVuYW50X2lkIjoxMzIsInVzZXJJZCI6MzM2LCJ1c2VyX2lkIjozMzYsInVzZXJfa2V5IjoiX3Rva2VuOjMzNjoyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJreW9tYXN0ZXIifQ.5QZc_IOIxrk4c-MqOUH2PZVaFHFABVCQmgAk53wd6PU";


    // 125 skymart 零售店
//        private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA5MjI5MzUsImduIjowLCJpYXQiOjE3ODk3MTMzMzUsInNjb3BlIjoxMjUsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTI1IiwidGVuYW50X2lkIjoxMjUsInVzZXJJZCI6Mjk2LCJ1c2VyX2lkIjoyOTYsInVzZXJfa2V5IjoiX3Rva2VuOjI5NjoyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJza3ltYXJ0bWFzdGVyIn0.hYfhW0-LGIGlTgSCFMfYJCwEucrPX774ChzRNG69RcA";

    // mikhamaster  112
//    private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA5MjQzNDksImduIjowLCJpYXQiOjE3ODk3MTQ3NDksInNjb3BlIjoxMTIsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTEyIiwidGVuYW50X2lkIjoxMTIsInVzZXJJZCI6MjQxLCJ1c2VyX2lkIjoyNDEsInVzZXJfa2V5IjoiX3Rva2VuOjI0MToyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJtaWtoYW1hc3RlciJ9.8tv9OB_wUkUgNBss3pPRSgE-X4xsP4-VnMWhahx2iyM";


    //     111	WANJIAXING
//        private static final String TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdCI6IjIiLCJleHAiOjE3OTA5MjUzMTcsImduIjowLCJpYXQiOjE3ODk3MTU3MTcsInNjb3BlIjoxMTEsInN0b3JlX2lkIjowLCJ0ZW5hbnRfY29kZSI6IlQwMDAwMTExIiwidGVuYW50X2lkIjoxMTEsInVzZXJJZCI6MjM5LCJ1c2VyX2lkIjoyMzksInVzZXJfa2V5IjoiX3Rva2VuOjIzOToyOiIsInVzZXJfdHlwZSI6IjAxIiwidXNlcm5hbWUiOiJ3YW5qaWF4aW5nIn0.d995oZRigqj4rZUw31oN_MFhMYZFkx93ECORDV7PVeQ";



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
