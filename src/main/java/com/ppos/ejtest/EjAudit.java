package com.ppos.ejtest;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * EJ 离线校验（结构 / 内容 / 金额），纯 Java 实现，不依赖 node。
 *
 * <p>与 {@code js/audit-ej.mjs}、{@code js/audit-content.mjs}、{@code js/audit-amounts.mjs}
 * 同口径；JS 版留着做交叉验证，两边结论应当一致。
 *
 * <p>忽略口径（与 {@code js/audit-ignore.mjs} 同步）：REPRINT 重打单、后厨类辅助单据
 * （厨单/点菜单/加菜单/转桌单/退菜单）、BILLING 预结单与日/时销报表不参与校验。
 *
 * <p>用法：
 * <pre>
 *   mvn -q exec:java -Dexec.mainClass=com.ppos.ejtest.EjAudit
 *   mvn -q exec:java -Dexec.mainClass=com.ppos.ejtest.EjAudit -Dexec.args="out/xxx.txt"
 * </pre>
 * 不传路径时自动取 {@code out/} 下最新的 {@code EJournal*.txt}。
 * 三项全过退出码 0，任一失败退出码 1。
 */
public class EjAudit {

    /** 金额容差。与 audit-amounts.mjs 的 EPS 保持一致，改一处必须改另一处。 */
    private static final double EPS = 0.1;

    /** 行宽上限，对齐 base.ts 的 charPerLine。 */
    private static final int LINE_WIDTH = 48;

    private static final String SEP_LINE = "=".repeat(62);

    // ── 票据类型与排序序号：同一时刻的票按 seq 先后印，与 JS 版一致 ──
    private static final String[][] TYPES = {
        {"CASH IN", "0"},
        {"SALES INVOICE", "1"},
        {"RETURN TRANSACTION", "1"},
        {"VOID TRANSACTION", "1"},
        {"PICK UP CASH", "2"},
        {"CASH OUT", "3"},
        {"X-READING", "4"},
        {"Z-READING REPORT", "5"},
    };

    /**
     * 商品行：缩进的「数量 单价 金额[ V/E/Z]」。用 [ \t] 而非 \s，避免跨行误匹配。
     *
     * <p>数量必须允许小数：称重商品与半份菜会印 0.5 / 0.38 这类值。
     * 2026-08-31 生产核查踩过 —— 只匹配整数会把这类票误判成「0 条商品行」，
     * 连带 Number of Items 也跟着报不符。
     */
    private static final Pattern ITEM_ROW = Pattern.compile(
        "^[ \t]+(-?\\d+(?:\\.\\d+)?)[ \t]{2,}(-?[\\d,]+\\.\\d{2})[ \t]{2,}"
            + "(-?[\\d,]+\\.\\d{2})[ \t]*[VEZ]?[ \t]*$");

    /** 数量容差。数量可为小数，比较一律走容差，不用 ==。 */
    private static final double QTY_EPS = 1e-6;
    private static final Pattern SEP = Pattern.compile("^-{10,}$");
    private static final Pattern HEADER =
        Pattern.compile("^Description[ \t]+Qty[ \t]+U\\.Price[ \t]+Amount[ \t]*$");
    private static final Pattern PLACEHOLDER =
        Pattern.compile("^(null|undefined|NaN|-|--|TBD|N/A)$", Pattern.CASE_INSENSITIVE);

    /** 票面实际印的支付方式标签。注意是 MAYA 不是 PAYMAYA，漏了会误判分账支付不平。 */
    private static final String[] PAY_METHODS = {
        "CASH", "GCASH", "CREDIT", "DEBIT", "MAYA", "PAYMAYA", "QRPH",
        "WECHAT", "ALIPAY", "STORED VALUE CARD", "GIFT CHECK", "POINTS",
        "MEMBER BALANCE",
    };

    // ── 忽略口径（与 js/audit-ignore.mjs 同步）──
    // REPRINT 重打单内容与原张一致，只会带来单号重复/时间逆序/Z 链断裂的误报；
    // 后厨类单据（厨单/点菜单/加菜单/转桌单/退菜单）与 BILLING 预结单、日/时销报表
    // 无金额、无税号头，名称行也不受发票模板排版约束。
    private static final String[] AUX_TITLES = {
        "ORDER SLIP", "KITCHEN DOCKET", "ADDITIONAL", "Transfer Slip",
        "THIS IS NOT A SALES INVOICE", "DAILY SALES REPORT", "HOURLY SALES REPORT",
        "VOID \\(退菜\\)",
    };

    private static boolean isAux(String body) {
        for (String t : AUX_TITLES) {
            if (has(body, "^ *" + t + "(（[^）]*）|\\([^)]*\\))? *$")) return true;
        }
        return false;
    }

    private static boolean isReprint(String body) {
        return has(body, "^ *REPRINT *$");
    }

    /**
     * 辅助单判断只对「非标准票型」的块生效 —— 标准票（有 SALES INVOICE 等标题行）
     * 即使正文里出现 AUX_TITLES 字样的商品名也不是辅助单。
     * 2026-09-17 SANNIU 店踩过：商品名就叫 ADDITIONAL 的销售发票被误判成加菜单，
     * 连带 SI 断号 6 / Z11 缺号 6 / Z12 毛额 3 天对不上。
     */
    private static boolean isIgnored(Block b) {
        return isReprint(b.body()) || ("UNKNOWN".equals(b.type()) && isAux(b.body()));
    }

    /** 一张小票。 */
    private record Block(int idx, String body, String type, int seq, String time, String businessDate) {
        boolean isSale() { return "SALES INVOICE".equals(type); }
        boolean isReturn() { return "RETURN TRANSACTION".equals(type); }
        boolean isVoid() { return "VOID TRANSACTION".equals(type); }
        boolean isTxn() { return isSale() || isReturn() || isVoid(); }
    }

    /** 一条商品行。qty 为 double —— 称重/半份商品的数量是小数。 */
    private record Item(String name, double qty, double price, double amount) {}

    /** 单项校验的结论。 */
    private record Check(String label, int failures) {}

    public static void main(String[] args) throws IOException {
        Path file = args.length > 0 && !args[0].isBlank() ? Path.of(args[0]) : latestEj();
        if (file == null) {
            System.err.println("out/ 下没有 EJournal*.txt，请先生成或显式传入路径");
            System.exit(1);
        }
        if (!Files.isRegularFile(file)) {
            System.err.println("文件不存在: " + file);
            System.exit(1);
        }
        if (args.length == 0) {
            System.out.println("未指定文件，自动选用最新的: " + file);
        }

        String raw = Files.readString(file, StandardCharsets.UTF_8);
        boolean hadBom = !raw.isEmpty() && raw.charAt(0) == '﻿';
        String text = hadBom ? raw.substring(1) : raw;

        // 重打单与后厨/BILLING 辅助单据不参与校验，数量另行提示
        int nReprint = 0;
        int nAux = 0;
        List<Block> blocks = new ArrayList<>();
        for (Block b : parse(text)) {
            if (isReprint(b.body())) { nReprint++; continue; }
            if ("UNKNOWN".equals(b.type()) && isAux(b.body())) { nAux++; continue; }
            blocks.add(b);
        }
        System.out.printf("忽略  重打 %d 张 / 后厨·点菜·BILLING 等辅助单据 %d 张（不参与校验）%n",
            nReprint, nAux);

        List<Check> all = new ArrayList<>();
        all.addAll(auditStructure(file, raw, text, blocks, hadBom));
        all.addAll(auditContent(blocks));
        all.addAll(auditAmounts(blocks));
        all.addAll(auditZReading(blocks));

        int bad = 0;
        System.out.println();
        System.out.println(SEP_LINE);
        System.out.println(" 汇总 — " + file.getFileName());
        System.out.println(SEP_LINE);
        for (Check c : all) {
            boolean ok = c.failures() == 0;
            if (!ok) bad++;
            System.out.printf("  %s %-44s %s%n", ok ? "✅" : "❌", c.label(),
                ok ? "通过" : "异常 " + c.failures());
        }
        System.out.println(SEP_LINE);
        System.out.println(bad == 0 ? " 结论: 全部校验通过 ✅" : " 结论: " + bad + " 项校验未通过 ❌");
        System.out.println(SEP_LINE);
        System.exit(bad == 0 ? 0 : 1);
    }

    /** 取 out/ 下 mtime 最新的 EJournal*.txt。 */
    private static Path latestEj() throws IOException {
        Path dir = Path.of("out");
        if (!Files.isDirectory(dir)) return null;
        try (var s = Files.list(dir)) {
            return s.filter(p -> p.getFileName().toString().matches("EJournal.*\\.txt"))
                    .max(Comparator.comparingLong(p -> p.toFile().lastModified()))
                    .orElse(null);
        }
    }

    // ═══════════════════ 解析 ═══════════════════

    /** 每张票之间由 "\n   \n" 分隔（编排器 finish() 的拼接格式）。 */
    private static List<Block> parse(String text) {
        String[] raw = text.split("\n {3}\n");
        List<Block> out = new ArrayList<>();
        int i = 0;
        for (String b : raw) {
            if (b.isBlank()) continue;
            String type = "UNKNOWN";
            int seq = 9;
            for (String[] t : TYPES) {
                if (has(b, "^ *" + Pattern.quote(t[0]) + " *$")) {
                    type = t[0];
                    seq = Integer.parseInt(t[1]);
                    break;
                }
            }
            out.add(new Block(i++, b, type, seq, eventTime(b), businessDate(b)));
        }
        return out;
    }

    /**
     * 事件时间：各模板日期标签不统一 —— 销售单 "Exact Date:"、X/Z "Report Date & Time:"、
     * 退货/作废 "Date&Time"（无冒号）、现金票 "Date&Time:"。冒号一律可选。
     */
    private static String eventTime(String b) {
        String[] pats = {
            "Exact Date:?[ \t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})",
            "Report Date ?& ?Time:?[ \t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})",
            "Date ?& ?Time:?[ \t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})",
        };
        for (String p : pats) {
            String m = find(b, p);
            if (m != null) return m;
        }
        return null;
    }

    /** Z 票的营业日：Start Date & Time 的日期部分。 */
    private static String businessDate(String b) {
        return find(b, "Start Date ?& ?Time:[ \t]*(\\d{4}-\\d{2}-\\d{2})");
    }

    /** 取第 1 个捕获组，无匹配返回 null。 */
    private static String find(String text, String regex) {
        Matcher m = Pattern.compile(regex, Pattern.MULTILINE).matcher(text);
        return m.find() ? m.group(1) : null;
    }

    /** 只判断有无匹配，用于不含捕获组的模式。 */
    private static boolean has(String text, String regex) {
        return Pattern.compile(regex, Pattern.MULTILINE).matcher(text).find();
    }

    /** 视觉宽度：与 base.ts getTextLength() 同口径 —— CJK / 全角算 2，其余算 1。 */
    private static int width(String s) {
        int w = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            boolean wide = (c >= '一' && c <= '鿿')
                || (c >= '　' && c <= '〿')
                || (c >= '＀' && c <= '￯');
            w += wide ? 2 : 1;
        }
        return w;
    }

    private static double num(String s) {
        return Double.parseDouble(s.replace(",", ""));
    }

    /** 取「标签 + 金额」行的金额，无该行返回 null。 */
    private static Double amountOf(String b, String label) {
        String v = find(b, "^" + Pattern.quote(label) + "[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
        return v == null ? null : num(v);
    }

    /** 同名行可能出现多次（多组政府折扣），全部累加。 */
    private static double sumAll(String b, String regex) {
        Matcher m = Pattern.compile(regex, Pattern.MULTILINE).matcher(b);
        double a = 0;
        while (m.find()) a += num(m.group(1));
        return a;
    }

    /** 票面 SI 号：只认独占一行的 SI，避免误抓 Billing#/VOID#/RETURN#。 */
    private static String siOf(Block b) {
        for (String p : new String[]{
            "^[ \t]*SI[ \t]+(\\d{10,})[ \t]*$",
            "^SI#[ \t]+(\\d{10,})[ \t]*$",
            "^Sales SI#[ \t]+(\\d{10,})[ \t]*$",
        }) {
            String m = find(b.body(), p);
            if (m != null) {
                String s = m.replaceFirst("^0+", "");
                return s.isEmpty() ? "0" : s;
            }
        }
        return "块#" + b.idx();
    }

    private static String tagOf(Block b) {
        String t = b.isSale() ? "SALE" : b.isReturn() ? "RETURN" : "VOID";
        return t + " SI " + siOf(b) + " (块#" + b.idx() + ")";
    }

    // ═══════════════════ 一、结构 / 排序 / 排版 ═══════════════════

    private static List<Check> auditStructure(
            Path file, String raw, String text, List<Block> blocks, boolean hadBom) {

        System.out.println();
        System.out.println(SEP_LINE);
        System.out.printf(" 【一】结构 / 排序 / 排版 — %s%n", file.getFileName());
        System.out.printf(" 大小 %d KB / %d 行 / %d 张票 / BOM %s%n",
            raw.length() / 1024, text.split("\n", -1).length, blocks.size(),
            hadBom ? "✅ 有" : "❌ 缺失");
        System.out.println(SEP_LINE);

        // 类型分布
        Map<String, Integer> byType = new LinkedHashMap<>();
        for (Block b : blocks) byType.merge(b.type(), 1, Integer::sum);
        System.out.println(" 票据类型分布");
        byType.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(e -> System.out.printf("   %-22s %4d%s%n", e.getKey(), e.getValue(),
                "UNKNOWN".equals(e.getKey()) ? "  ⚠ 无法识别类型" : ""));
        int unknown = byType.getOrDefault("UNKNOWN", 0);

        // 排序：time 升序，同 time 按 seq
        List<Block> timed = blocks.stream().filter(b -> b.time() != null).toList();

        // 时间跨度与按日分布：能一眼看出有没有整天缺票
        if (!timed.isEmpty()) {
            System.out.printf(" 时间跨度  %s → %s%n",
                timed.get(0).time(), timed.get(timed.size() - 1).time());
            Map<String, Integer> byDay = new java.util.TreeMap<>();
            for (Block b : timed) byDay.merge(b.time().substring(0, 10), 1, Integer::sum);
            System.out.printf(" 按日分布  覆盖 %d 天，日均 %.1f 张%n",
                byDay.size(), (double) timed.size() / byDay.size());
            // 固定宽度表格：每行 4 组「日期|张数」，日期 5 列、张数右对齐 5 列，
            // 行宽 3+4×12=51（含表格线），数字多少都不跑版。
            System.out.println("   +------+-----+------+-----+------+-----+------+-----+");
            System.out.println("   | 日期 | 张数 | 日期 | 张数 | 日期 | 张数 | 日期 | 张数 |");
            System.out.println("   +------+-----+------+-----+------+-----+------+-----+");
            int col = 0;
            StringBuilder row = new StringBuilder("   ");
            for (Map.Entry<String, Integer> e : byDay.entrySet()) {
                row.append(String.format("|%5s |%4d ", e.getKey().substring(5), e.getValue()));
                if (++col % 4 == 0) {
                    System.out.println(row.append("|"));
                    row = new StringBuilder("   ");
                }
            }
            if (col % 4 != 0) {
                for (int k = col % 4; k < 4; k++) row.append("|      |     ");
                System.out.println(row.append("|"));
            }
            System.out.println("   +------+-----+------+-----+------+-----+------+-----+");
        }
        int orderErr = 0;
        for (int i = 1; i < timed.size(); i++) {
            Block a = timed.get(i - 1);
            Block c = timed.get(i);
            int cmp = a.time().compareTo(c.time());
            if (cmp > 0 || (cmp == 0 && a.seq() > c.seq())) {
                orderErr++;
                if (orderErr <= 5) {
                    System.out.printf("   ⚠ 逆序: #%d %s(seq%d) %s → #%d %s(seq%d) %s%n",
                        a.idx(), a.type(), a.seq(), a.time(),
                        c.idx(), c.type(), c.seq(), c.time());
                }
            }
        }
        System.out.printf(" 排序      带时间戳 %d/%d，逆序 %d 处%n",
            timed.size(), blocks.size(), orderErr);

        // 日期归属：范围从文件名里取
        int oob = 0;
        Matcher fm = Pattern.compile("(\\d{4}-\\d{2}-\\d{2})[_~](\\d{4}-\\d{2}-\\d{2})")
            .matcher(file.getFileName().toString());
        if (fm.find()) {
            String sd = fm.group(1);
            String ed = fm.group(2);
            for (Block b : blocks) {
                String d = "Z-READING REPORT".equals(b.type())
                    ? b.businessDate()
                    : (b.time() == null ? null : b.time().substring(0, 10));
                if (d != null && (d.compareTo(sd) < 0 || d.compareTo(ed) > 0)) {
                    oob++;
                    if (oob <= 5) System.out.printf("   ⚠ 越界: #%d %s %s%n", b.idx(), b.type(), d);
                }
            }
            long zs = blocks.stream().filter(b -> "Z-READING REPORT".equals(b.type())).count();
            long cross = blocks.stream()
                .filter(b -> "Z-READING REPORT".equals(b.type()))
                .filter(b -> b.businessDate() != null && b.time() != null
                    && !b.time().substring(0, 10).equals(b.businessDate()))
                .count();
            System.out.printf(" 日期归属  声明 %s ~ %s，越界 %d；Z-READING %d 张其中跨午夜 %d 张%n",
                sd, ed, oob, zs, cross);
        }

        // 双联配对
        int pairErr = 0;
        for (String t : new String[]{"RETURN TRANSACTION", "VOID TRANSACTION"}) {
            List<Block> g = blocks.stream().filter(b -> t.equals(b.type())).toList();
            long cashier = g.stream().filter(b -> b.body().contains("Cashier Copy")).count();
            long customer = g.stream().filter(b -> b.body().contains("Customer Copy")).count();
            boolean ok = cashier == customer && cashier * 2 == g.size();
            if (!ok) pairErr++;
            System.out.printf(" 副本配对  %-20s %d 张 = Cashier %d + Customer %d %s%n",
                t, g.size(), cashier, customer, ok ? "✅" : "❌ 不配对");
        }
        List<Block> sales = blocks.stream().filter(Block::isSale).toList();
        long govSales = sales.stream()
            .filter(b -> b.body().contains("Cashier Copy") || b.body().contains("Customer Copy"))
            .count();
        if (govSales % 2 != 0) pairErr++;
        System.out.printf(" 副本配对  %-20s %d 张，其中双联 %d 张（政府折扣单）%s%n",
            "SALES INVOICE", sales.size(), govSales, govSales % 2 == 0 ? "✅" : "❌ 奇数，存在落单");

        // 双联内容一致：Cashier/Customer 副本除标记行外应逐行一致。
        // 只配对不比内容的话，渲染层改错一联（金额/单号/明细）会静默漏过。
        int pairDiff = 0;
        List<String> pairDetails = new ArrayList<>();
        for (int i = 0; i < blocks.size(); i++) {
            Block a = blocks.get(i);
            if (!a.body().contains("Cashier Copy")) continue;
            for (int j = i + 1; j < blocks.size(); j++) {
                Block c = blocks.get(j);
                if (!c.type().equals(a.type())) continue;
                if (!c.body().contains("Customer Copy")) break;
                String diff = copyBodyDiff(a.body(), c.body());
                if (diff != null) {
                    pairDiff++;
                    if (pairDetails.size() < 10) {
                        pairDetails.add("[双联不一致] 块#" + a.idx() + " vs #" + c.idx() + ": " + diff);
                    }
                }
                break;
            }
        }
        if (!pairDetails.isEmpty()) {
            System.out.println(" 双联内容  " + pairDiff + " 对不一致 ⚠");
            pairDetails.forEach(d -> System.out.println("   " + d));
        }

        // 脏值
        int dirty = 0;
        StringBuilder dirtyLine = new StringBuilder();
        for (String p : new String[]{"null", "undefined", "NaN", "TBD", "Infinity", "[object", "{{", "}}"}) {
            int n = countOccurrences(text, p);
            dirty += n;
            if (n > 0) dirtyLine.append(p).append("×").append(n).append(" ");
        }
        System.out.printf(" 脏值扫描  %s%n", dirty == 0 ? "全 0 ✅" : dirtyLine + "⚠");

        // 不可渲染字符：增补平面（emoji 等）/C1 控制/私用区 —— 仅警告不计失败：
        // 客户备注数据不可控，TxtToPdf 已有 □ 字形兜底不会崩渲染（2026-09-18 起），
        // 此探针用于导出侧感知与数据侧治理（商品/备注录入限制 emoji），不作为 EJ 校验失败项。
        int badGlyph = 0;
        List<String> glyphDetail = new ArrayList<>();
        for (int i = 0; i < text.length(); ) {
            int cp = text.codePointAt(i);
            boolean bad = cp > 0xFFFF || (cp >= 0xE000 && cp <= 0xF8FF)
                || (cp >= 0x7F && cp <= 0x9F) || (cp < 0x20 && cp != '\n' && cp != '\r' && cp != '\t');
            if (bad) {
                badGlyph++;
                if (glyphDetail.size() < 5) glyphDetail.add(String.format("U+%04X", cp));
            }
            i += Character.charCount(cp);
        }
        if (badGlyph > 0) {
            System.out.println(" 字形探针  " + badGlyph + " 个不可渲染字符 ⚠ " + glyphDetail);
        }

        // 排版：超宽行。行宽只校验交易票的非商品名区域 —— 商品名/备注是客户数据
        // （菜名、口味、留言），长度不受模板控制，超宽不算缺陷；忽略掉的单据
        // （重打/后厨/BILLING）整体不参与。
        List<String> over = new ArrayList<>();
        int nameOver = 0;
        Pattern headerRow = Pattern.compile("^Description[ \t]+Qty[ \t]+U\\.Price[ \t]+Amount[ \t]*$");
        int lineNo = 1;
        for (Block blk : blocks) {
            String[] ls = blk.body().split("\n", -1);
            boolean inItems = false;
            boolean seenContent = false;
            for (String l : ls) {
                if (headerRow.matcher(l).matches()) {
                    inItems = true;
                    seenContent = false;
                } else if (inItems && SEP.matcher(l).matches()) {
                    if (seenContent) inItems = false; // 表头下紧跟的分隔线不算商品区结束
                } else if (inItems && !l.isBlank()) {
                    seenContent = true;
                }
                if (width(l) > LINE_WIDTH) {
                    if (inItems || l.contains("Memo") || l.contains("Spice")
                        || l.contains("Spicy") || l.contains("辣")) {
                        nameOver++;
                    } else {
                        over.add("L" + lineNo + " 宽" + width(l) + ": " + l);
                    }
                }
                lineNo++;
            }
            lineNo++; // 块分隔 "\n   \n" 的 3 空格行
        }
        System.out.printf(" 排版      超宽行 %d%s，另有商品名/备注等客户数据超宽 %d 行（不计）%n",
            over.size(), over.isEmpty() ? " ✅" : "", nameOver);
        for (String s : over.stream().limit(5).toList()) {
            System.out.println("   " + s.substring(0, Math.min(60, s.length())));
        }

        // 结构完整性
        int noHeader = 0;
        int noFooter = 0;
        int emptyAmount = 0;
        Pattern tin = Pattern.compile("VAT-REG TIN|TIN:");
        Pattern empty = Pattern.compile("^(Gross Sales|Amount Due)[ \t]*$", Pattern.MULTILINE);
        for (Block b : blocks) {
            if (!tin.matcher(b.body()).find()) noHeader++;
            if (b.isSale() && !b.body().contains("THIS SERVES AS YOUR SALES INVOICE")) noFooter++;
            if (empty.matcher(b.body()).find()) emptyAmount++;
        }
        System.out.printf(" 结构完整  缺税号头部 %d / 销售票缺尾部 %d / 金额行为空 %d%n",
            noHeader, noFooter, emptyAmount);

        return List.of(
            new Check("[结构] 票据类型可识别", unknown),
            new Check("[结构] 时间升序无逆序", orderErr),
            new Check("[结构] 日期归属无越界", oob),
            new Check("[结构] 双联配对", pairErr),
            new Check("[结构] 双联内容一致（Cashier=Customer）", pairDiff),
            new Check("[结构] 无脏值", dirty),
            new Check("[结构] 行宽 ≤ " + LINE_WIDTH + "（商品名/备注等客户数据除外）", over.size()),
            new Check("[结构] 头部/尾部/金额行完整", noHeader + noFooter + emptyAmount)
        );
    }

    private static int countOccurrences(String text, String needle) {
        int n = 0;
        int i = text.indexOf(needle);
        while (i >= 0) {
            n++;
            i = text.indexOf(needle, i + needle.length());
        }
        return n;
    }

    // ═══════════════════ 二、内容完整性 ═══════════════════

    /** 商品区：表头行之后到下一条分隔线为止（表头下面紧跟一条分隔线，跳过）。 */
    private static List<String> itemRegion(String body) {
        String[] lines = body.split("\n", -1);
        int h = -1;
        for (int i = 0; i < lines.length; i++) {
            if (HEADER.matcher(lines[i]).matches()) { h = i; break; }
        }
        if (h < 0) return null;
        int start = h + 1;
        if (start < lines.length && SEP.matcher(lines[start]).matches()) start++;
        int end = start;
        while (end < lines.length && !SEP.matcher(lines[end]).matches()) end++;
        return List.of(lines).subList(Math.min(start, lines.length), Math.min(end, lines.length));
    }

    /** 拆商品行：商品行之前的非行文本即名称（可跨行）。 */
    private static List<Item> parseItems(List<String> region) {
        List<Item> items = new ArrayList<>();
        StringBuilder name = new StringBuilder();
        for (String l : region) {
            Matcher m = ITEM_ROW.matcher(l);
            if (m.matches()) {
                items.add(new Item(name.toString().trim(),
                    Double.parseDouble(m.group(1)), num(m.group(2)), num(m.group(3))));
                name.setLength(0);
            } else if (!l.isBlank()) {
                name.append(l.trim());
            }
        }
        return items;
    }

    /**
     * 取「标签 + 数字（可含小数）」行。
     * Total Qty 在称重/半份商品场景会印成 0.5 这类小数，用 intOf 读会拿到 null，
     * 导致「数量合计 = Total Qty」静默跳过而非真的通过。
     */
    private static Double decimalOf(String b, String label) {
        String v = find(b, "^" + Pattern.quote(label) + "[ \t]+(-?\\d+(?:\\.\\d+)?)[ \t]*$");
        return v == null ? null : Double.parseDouble(v);
    }

    /** 数量显示：整数不拖小数点，小数去掉尾随零。 */
    private static String qtyStr(double q) {
        if (Math.abs(q - Math.rint(q)) < QTY_EPS) return String.valueOf((long) Math.rint(q));
        return java.math.BigDecimal.valueOf(q)
            .setScale(4, java.math.RoundingMode.HALF_UP)
            .stripTrailingZeros().toPlainString();
    }

    private static Integer intOf(String b, String label) {
        String v = find(b, "^" + Pattern.quote(label) + "[ \t]+(-?\\d+)[ \t]*$");
        return v == null ? null : Integer.parseInt(v);
    }

    /** 字段值：缺标签返回 null，标签在但值为空返回 ""。 */
    private static String fieldOf(String b, String label) {
        Matcher m = Pattern.compile("^" + Pattern.quote(label) + "[ \t]*(.*)$", Pattern.MULTILINE)
            .matcher(b);
        return m.find() ? m.group(1).trim() : null;
    }

    private static List<Check> auditContent(List<Block> blocks) {
        List<Block> txns = blocks.stream().filter(Block::isTxn).toList();
        System.out.println();
        System.out.println(SEP_LINE);
        System.out.printf(" 【二】内容完整性 — 销售 %d / 退货 %d / 作废 %d 张%n",
            txns.stream().filter(Block::isSale).count(),
            txns.stream().filter(Block::isReturn).count(),
            txns.stream().filter(Block::isVoid).count());
        System.out.println(SEP_LINE);

        int noRegion = 0, noItem = 0, noName = 0, badName = 0, zeroQty = 0;
        int cntMismatch = 0, qtyMismatch = 0, missField = 0, lineAmt = 0, signErr = 0, cashBad = 0;
        List<String> problems = new ArrayList<>();

        // 统计口径的旁证：行数/数量/品名种类，用来判断解析是不是把票读全了
        int itemRows = 0;
        double qtyTotal = 0;
        int fieldChecked = 0;
        Map<String, Integer> nameFreq = new LinkedHashMap<>();
        int maxItemsPerTxn = 0;
        String maxItemsTag = "";

        for (Block b : txns) {
            String tag = tagOf(b);
            List<String> region = itemRegion(b.body());
            if (region == null) {
                noRegion++;
                problems.add("[无商品区] " + tag + ": 整张票没有 Description/Qty/U.Price 表头");
                continue;
            }
            List<Item> items = parseItems(region);
            itemRows += items.size();
            qtyTotal += items.stream().mapToDouble(Item::qty).map(Math::abs).sum();
            for (Item it : items) nameFreq.merge(it.name(), 1, Integer::sum);
            if (items.size() > maxItemsPerTxn) {
                maxItemsPerTxn = items.size();
                maxItemsTag = tag;
            }

            // 核心：有订单信息但没有商品信息
            if (items.isEmpty()) {
                noItem++;
                long orphan = region.stream().filter(l -> !l.isBlank()).count();
                problems.add("[无商品行] " + tag + ": 有订单头和金额，但商品区 0 条商品行（区内残留 "
                    + orphan + " 行文本）");
            }
            for (Item it : items) {
                if (it.name().isEmpty()) {
                    noName++;
                    problems.add("[缺商品名] " + tag + ": 数量 " + qtyStr(it.qty())
                        + " 金额 " + it.amount() + " 的行没有描述");
                } else if (PLACEHOLDER.matcher(it.name()).matches()) {
                    badName++;
                    problems.add("[商品名占位] " + tag + ": 商品名为 \"" + it.name() + "\"");
                }
                if (Math.abs(it.qty()) < QTY_EPS) {
                    zeroQty++;
                    problems.add("[数量为零] " + tag + ": \"" + it.name() + "\" 数量 0");
                }
                // 行内恒等式(业务规格,2026-09-18 确认): U.Price × Qty = 行金额,严格成立。
                // 折扣折入单价仅当 净额÷数量 为精确两位小数;除不尽必须走分解式
                // (原价×数量=小计,Discount 单列,净额)。反算取整(99.7656→99.77)、
                // 称重数量截两位(0.678→0.68)、手输行单价不同步,均按违规报。
                if (Math.abs(it.qty() * it.price() - it.amount()) > 0.02) {
                    lineAmt++;
                    problems.add(String.format("[行金额不符] %s: \"%s\" %.3f × %.2f = %.3f,票面 %.2f",
                        tag, it.name(), it.qty(), it.price(), it.qty() * it.price(), it.amount()));
                }
                // 符号规范：销售票行 ≥0，退货/作废票行 ≤0（票样核实：退废行 qty/amount 均为负）。
                // 混号说明渲染层把销售/退废模板套错，金额勾稽会跟着错。
                if (b.isSale() ? (it.qty() < -QTY_EPS || it.amount() < -0.005)
                               : (it.qty() > QTY_EPS || it.amount() > 0.005)) {
                    signErr++;
                    problems.add(String.format("[符号异常] %s: \"%s\" qty=%s amount=%.2f（%s票应为%s）",
                        tag, it.name(), qtyStr(it.qty()), it.amount(),
                        b.isSale() ? "销售" : "退废", b.isSale() ? "非负" : "非正"));
                }
            }

            // 计数勾稽：退货/作废模板不输出这两行，仅销售票做
            if (b.isSale()) {
                Integer nItems = intOf(b.body(), "Number of Items");
                Double totalQty = decimalOf(b.body(), "Total Qty");
                if (nItems != null && nItems != items.size()) {
                    cntMismatch++;
                    problems.add("[行数不符] " + tag + ": 解析出 " + items.size()
                        + " 条商品行，票面 Number of Items " + nItems);
                }
                double qtySum = items.stream().mapToDouble(Item::qty).sum();
                if (totalQty != null && Math.abs(totalQty - qtySum) > QTY_EPS) {
                    qtyMismatch++;
                    problems.add("[数量不符] " + tag + ": 各行 Qty 合计 " + qtyStr(qtySum)
                        + "，票面 Total Qty " + qtyStr(totalQty));
                }
            }

            // 订单头字段。作废票印 "Sales SI#"，退货票印 "SI#" —— 标签不统一，勿合并
            String[] required = b.isSale()
                ? new String[]{"SI", "Billing#:", "Cashier:", "TERMINAL#:", "Exact Date:"}
                : b.isReturn()
                    ? new String[]{"RETURN#", "SI#", "Date&Time"}
                    : new String[]{"VOID#", "Sales SI#", "Date&Time"};
            fieldChecked += required.length;
            for (String f : required) {
                String v = "SI".equals(f)
                    ? find(b.body(), "^[ \t]*SI[ \t]+(\\S+)[ \t]*$")
                    : fieldOf(b.body(), f);
                if (v == null) {
                    missField++;
                    problems.add("[缺字段] " + tag + ": 没有 \"" + f + "\" 行");
                } else if (v.isEmpty()) {
                    missField++;
                    problems.add("[空字段] " + tag + ": \"" + f + "\" 值为空");
                }
            }
        }

        // 全局单号连续性 —— 不依赖 Z 报表，覆盖没有 Z 的营业日。
        // 2026-08-27 加：RETURN#21 丢在 08-25，而该日的 Z 不在导出范围内，
        // Z11 的号段缺号检查够不着，只有这一项能发现。
        int seqGap = 0;
        for (String label : new String[]{"SI", "RETURN", "VOID"}) {
            List<Long> nums = txns.stream()
                .filter(b -> label.equals("SI") ? b.isSale()
                    : label.equals("RETURN") ? b.isReturn() : b.isVoid())
                .map(EjAudit::numOf)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
            if (nums.size() < 2) continue;
            List<Long> missing = new ArrayList<>();
            for (int i = 1; i < nums.size(); i++) {
                long prev = nums.get(i - 1);
                long cur = nums.get(i);
                // 号段可能被重置（已知 07-19 与 08-24 都出现过 RETURN#12/#13），
                // 跨度过大时视为换段而非缺号，避免整段误报
                if (cur - prev > 1 && cur - prev <= 50) {
                    for (long n = prev + 1; n < cur; n++) missing.add(n);
                }
            }
            if (!missing.isEmpty()) {
                seqGap += missing.size();
                problems.add("[单号断号] " + label + "# 缺 "
                    + missing.stream().map(String::valueOf).collect(Collectors.joining(","))
                    + "（区间 " + nums.get(0) + "~" + nums.get(nums.size() - 1) + "）");
            }
        }

        // ── CASH IN / CASH OUT（轻量：金额行存在 + 浮点对账）──
        // CASH OUT 票印 Cash Sales/Cash Out/Short-Over 浮动物；当 CASH IN 与
        // Pick Up 均为零时恒等式 SHORT/OVER = CASH SALES − CASH OUT 应成立。
        for (Block blk : blocks) {
            String body = blk.body();
            if ("CASH IN".equals(blk.type())) {
                if (amountOf(body, "CASH IN") == null) {
                    cashBad++;
                    problems.add("[CASH IN] 块#" + blk.idx() + ": 缺金额行 \"CASH IN <金额>\"");
                }
            } else if ("CASH OUT".equals(blk.type())) {
                Double cashIn = amountOf(body, "CASH IN");
                Double pickUp = amountOf(body, "TOTAL PICK UP CASH");
                Double sales = amountOf(body, "CASH SALES");
                Double out = amountOf(body, "CASH OUT");
                String so = find(body, "^\\(-\\)SHORT/\\(\\+\\)OVER[ \\t]*([+-][\\d,]+\\.\\d{2})");
                if (sales == null || out == null || so == null) {
                    cashBad++;
                    problems.add("[CASH OUT] 块#" + blk.idx() + ": 浮点对账行不全（CASH SALES/CASH OUT/SHORT-OVER）");
                } else if (cashIn != null && Math.abs(cashIn) < 0.005
                    && (pickUp == null || Math.abs(pickUp) < 0.005)) {
                    // SHORT/OVER 是实物盘点值(可能含找零备用金),恒等式仅提示不判失败:
                    // 2026-09-18 KYO 块#2492 实测 4.63 vs 934.63,同刻 X-READING CASH 9,701 印证
                    // CASH SALES/CASH OUT 无误,差异来自抽走后的实存现金。
                    double soV = Double.parseDouble(so.replace(",", ""));
                    if (Math.abs(soV - (sales - out)) > EPS) {
                        System.out.printf(" ℹ [CASH OUT] 块#%d: SHORT/OVER %.2f 与账面差额 %.2f 差 %.2f(实物盘点/备用金,人工核对)%n",
                            blk.idx(), soV, sales - out, Math.abs(soV - (sales - out)));
                    }
                }
            }
        }

        System.out.printf(" 解析口径  商品行 %d 条 / 数量合计 %s / 品名 %d 种 / 检查字段 %d 个%n",
            itemRows, qtyStr(qtyTotal), nameFreq.size(), fieldChecked);
        System.out.printf(" 单票商品  平均 %.1f 行，最多 %d 行 @ %s%n",
            txns.isEmpty() ? 0 : (double) itemRows / txns.size(), maxItemsPerTxn, maxItemsTag);
        System.out.println(" 高频品名  " + nameFreq.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(5)
            .map(e -> e.getKey() + "×" + e.getValue())
            .collect(Collectors.joining("  ")));

        List<Check> checks = List.of(
            new Check("[内容] 商品区表头存在", noRegion),
            new Check("[内容] 商品行 ≥ 1（有订单必有商品）", noItem),
            new Check("[内容] 商品名非空", noName),
            new Check("[内容] 商品名非占位值", badName),
            new Check("[内容] 商品数量非零", zeroQty),
            new Check("[内容] 行金额 = 单价×数量", lineAmt),
            new Check("[内容] 符号规范（销售行≥0 / 退废行≤0）", signErr),
            new Check("[内容] 商品行数 = Number of Items", cntMismatch),
            new Check("[内容] 数量合计 = Total Qty", qtyMismatch),
            new Check("[内容] 订单头关键字段齐全", missField),
            new Check("[内容] CASH IN/OUT 金额与浮点对账", cashBad),
            new Check("[内容] 单号无断号（SI/RETURN/VOID，容忍重置）", seqGap)
        );
        printChecks(checks, problems);
        return checks;
    }

    // ═══════════════════ 三、金额勾稽 ═══════════════════

    private static List<Check> auditAmounts(List<Block> blocks) {
        List<Block> txns = blocks.stream().filter(Block::isTxn).toList();
        System.out.println();
        System.out.println(SEP_LINE);
        System.out.printf(" 【三】金额勾稽（容差 %.2f）%n", EPS);
        System.out.println(SEP_LINE);

        int a = 0, bCnt = 0, c = 0, d = 0, e = 0, c2 = 0, c3 = 0;
        int w = 0;
        List<String> problems = new ArrayList<>();
        List<String> warns = new ArrayList<>();

        // 各项的最大偏差：即使全部落在容差内，也要看清离阈值还有多远。
        // 容差从 0.02 放宽到 0.1 后，这几行就是判断"放宽是否过头"的唯一依据。
        double[] maxDiff = new double[4];
        String[] maxDiffTag = {"-", "-", "-", "-"};

        // 金额小计：与 Z 报表核对时的旁证
        double grossSale = 0, grossRet = 0, grossVoid = 0;
        double dueSale = 0, vatSale = 0, svcSale = 0, discSale = 0;

        for (Block blk : txns) {
            String b = blk.body();
            String tag = tagOf(blk);

            Double gross = amountOf(b, "Gross Sales");
            Double due = null;
            String dueRaw = find(b, "^(?:Amount Due|Amount)[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
            if (dueRaw != null) due = num(dueRaw);
            // 服务费：销售票 "Service Charge(10%)"，作废/退货票 "Service Charge"
            String svcRaw = find(b, "^Service Charge(?:\\([^)]*\\))?[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
            double svc = svcRaw == null ? 0 : num(svcRaw);

            double lessVat = sumAll(b, "^LESS 12% VAT[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
            double addVat = sumAll(b, "^Add 12% VAT[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
            double govDisc = sumAll(b, "^Discount \\d+%[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
            double regDisc = sumAll(b, "^Regular Discount[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");

            // 符号口径：销售票 Gross - LessVAT + AddVAT - Disc + SC；
            // 退货/作废票整体为负，各调整项方向全部反转 —— LessVAT/Disc 行印正值起
            // 「冲回」作用(加)，SC 行印带符号负值。s = +1 销售 / -1 退货·作废。
            double s = blk.isSale() ? 1 : -1;

            // 金额小计
            if (gross != null) {
                if (blk.isSale()) grossSale += gross;
                else if (blk.isReturn()) grossRet += gross;
                else grossVoid += gross;
            }
            if (blk.isSale()) {
                if (due != null) dueSale += due;
                svcSale += svc;
                discSale += govDisc + regDisc;
                Double v = amountOf(b, "VAT Amount (12%)");
                if (v != null) vatSale += v;
            }

            // A 应付
            if (gross != null && due != null) {
                double expect = gross - s * lessVat + s * addVat - s * (govDisc + regDisc) + svc;
                track(maxDiff, maxDiffTag, 0, Math.abs(expect - due), tag);
                if (Math.abs(expect - due) > EPS) {
                    a++;
                    problems.add(String.format("[A 应付] %s: Gross %.2f %s LessVAT %.2f %s AddVAT %.2f "
                        + "%s Disc %.2f + SC %.2f = %.2f，票面 %.2f",
                        tag, gross, s > 0 ? "-" : "+", lessVat, s > 0 ? "+" : "-", addVat,
                        s > 0 ? "-" : "+", govDisc + regDisc, svc, expect, due));
                }
            }

            // B 税分解：基数 = 毛额 - LessVAT + AddVAT，再冲减【普通折扣】（退货/作废方向反转）。
            // 政府折扣不参与：SC/PWD 是先剥 VAT 再打折，剥 VAT 已由 LessVAT 体现。
            Double vatable = amountOf(b, "VATable Sales");
            Double vat = amountOf(b, "VAT Amount (12%)");
            Double exempt = amountOf(b, "VAT Exempt Sales");
            Double zero = amountOf(b, "Zero Rated Sales");
            if (vatable != null && vat != null && exempt != null && zero != null && gross != null) {
                double base = gross - s * lessVat + s * addVat - s * regDisc;
                double sum = vatable + vat + exempt + zero;
                track(maxDiff, maxDiffTag, 1, Math.abs(sum - base), tag);
                if (Math.abs(sum - base) > EPS) {
                    bCnt++;
                    problems.add(String.format("[B 税分解] %s: %.2f+%.2f+%.2f+%.2f = %.2f，基数 %.2f",
                        tag, vatable, vat, exempt, zero, sum, base));
                }
            }

            // C 收付：仅销售票。void/return 模板不输出 CHANGE 行，支付行是原单全额冲销。
            if (blk.isSale() && due != null) {
                double paid = 0;
                boolean hasPay = false;
                for (String pm : PAY_METHODS) {
                    Double v = amountOf(b, pm);
                    if (v != null) { paid += v; hasPay = true; }
                }
                Double change = amountOf(b, "CHANGE");
                double chg = change == null ? 0 : change;
                if (hasPay) track(maxDiff, maxDiffTag, 2, Math.abs(paid - chg - due), tag);
                if (hasPay && Math.abs(paid - chg - due) > EPS) {
                    c++;
                    problems.add(String.format("[C 收付] %s: 支付 %.2f - 找零 %.2f = %.2f，应付 %.2f",
                        tag, paid, chg, paid - chg, due));
                }
                // E 欠款探针：应付>0 却一条支付行都没有 —— C 只在有支付行时成立,
                // 缺支付行时静默通过。139 租户"撕裂单"即此形态,故单列。
                if (!hasPay && due > EPS) {
                    e++;
                    problems.add(String.format("[E 欠款] %s: 应付 %.2f，票面无任何支付行", tag, due));
                }
                // C3 找零来源：CHANGE>0 必须有 CASH 支付行——电子支付不产生找零，
                // 出现"GCASH 付款 + 找零"即渲染/数据错。
                if (chg > EPS && amountOf(b, "CASH") == null) {
                    c3++;
                    problems.add(String.format("[C3 找零来源] %s: CHANGE %.2f 但无 CASH 支付行", tag, chg));
                }

                // W 现金找零向上取整（仅警告，不计失败）。
                // 规则：CHANGE > 0 且 CASH 有小数 → CASH 向上取整并重算找零；
                // CHANGE=0 或 CASH 已是整数则保持不变。
                // 2026-09 SANNIU 实测该功能在 B账生成侧未生效（892/1077 张未取整），
                // 属业务口径提示而非数据算错，故不进 checks、不影响通过判定。
                Double cashV = amountOf(b, "CASH");
                if (cashV != null && chg > 0 && Math.abs(cashV - Math.rint(cashV)) > 1e-9) {
                    w++;
                    if (w <= 10) {
                        warns.add(String.format(
                            "[W 取整] %s: CHANGE %.2f > 0 且 CASH %.2f 有小数，按规则应为 CASH %d → CHANGE %.2f",
                            tag, chg, cashV, (int) Math.ceil(cashV), Math.ceil(cashV) - due));
                    }
                }
            }
            // C2 退货/作废票支付冲销：有支付行时合计应等于 Amount（负向冲销，无找零行）。
            // 此前退废票的支付行完全无校验——132 RETURN 399 事故的票面路径。
            else if (blk.isTxn() && due != null) {
                double paid2 = 0;
                boolean hasPay2 = false;
                for (String pm : PAY_METHODS) {
                    Double v = amountOf(b, pm);
                    if (v != null) { paid2 += v; hasPay2 = true; }
                }
                if (hasPay2 && Math.abs(paid2 - due) > EPS) {
                    c2++;
                    problems.add(String.format("[C2 冲销] %s: 支付行合计 %.2f，票面 Amount %.2f",
                        tag, paid2, due));
                }
            }

            // D 行合计。销售票行价 = 原价，对比 Gross；退货/作废票行价 = 实退净额
            // （折扣与 VAT 调整已摊进行价），故 行合计 + SC = Amount。
            List<String> region = itemRegion(b);
            List<Item> items = region == null ? List.of() : parseItems(region);
            if (!items.isEmpty() && gross != null && due != null) {
                double sum = items.stream().mapToDouble(Item::amount).sum();
                double expect = blk.isSale() ? gross : due - svc;
                track(maxDiff, maxDiffTag, 3, Math.abs(sum - expect), tag);
                if (Math.abs(sum - expect) > EPS) {
                    d++;
                    problems.add(String.format("[D 行合计] %s: %d 行合计 %.2f，应等于 %s",
                        tag, items.size(), sum, blk.isSale()
                            ? String.format("Gross %.2f", gross)
                            : String.format("实退 %.2f（Amount %.2f - SC %.2f）", due - svc, due, svc)));
                }
            }
        }

        List<Check> checks = List.of(
            new Check("[金额] A 应付勾稽（销售/退货·作废符号口径见文件头）", a),
            new Check("[金额] B 税分解合计 = 毛额∓LessVAT±AddVAT∓普通折扣", bCnt),
            new Check("[金额] C 支付-找零 = 应付（仅销售票）", c),
            new Check("[金额] E 应付>0 必有支付行（欠款探针）", e),
            new Check("[金额] C2 退废票支付冲销 = Amount（有支付行时）", c2),
            new Check("[金额] C3 找零来源=CASH（电子支付无找零）", c3),
            new Check("[金额] D 行合计 = Gross(销售) / 实退-SC(退货·作废)", d)
        );
        printChecks(checks, problems);
        // 数量>0 时标红（ANSI），IDEA 运行窗口 / Git Bash 均可渲染
        String wCnt = w == 0 ? "0" : "\u001b[1;31m" + w + "\u001b[0m";
        System.out.printf("  %s 现金找零向上取整未执行（仅提示，不计失败）%s%n", w == 0 ? "✅" : "⚠\uFE0F", wCnt);
        for (String s : warns) System.out.println("   " + s);

        System.out.println();
        System.out.println(" 各项最大偏差（容差 " + EPS + "，越接近容差越值得复核）");
        String[] names = {"A 应付", "B 税分解", "C 收付", "D 行合计"};
        for (int i = 0; i < 4; i++) {
            double pct = EPS == 0 ? 0 : maxDiff[i] / EPS * 100;
            System.out.printf("   %-10s %6.2f  (容差的 %3.0f%%)  @ %s%n",
                names[i], maxDiff[i], pct, maxDiffTag[i]);
        }

        System.out.println();
        System.out.println(" 金额小计（供与 Z 报表核对，非校验项）");
        System.out.printf("   销售 Gross %,12.2f   应付 %,12.2f   VAT %,10.2f%n",
            grossSale, dueSale, vatSale);
        System.out.printf("   服务费     %,12.2f   折扣 %,12.2f%n", svcSale, discSale);
        System.out.printf("   退货 Gross %,12.2f   作废 Gross %,12.2f   净额 %,12.2f%n",
            grossRet, grossVoid, grossSale + grossRet + grossVoid);
        return checks;
    }

    // ═══════════════════ 四、Z-READING ═══════════════════

    /** 某营业日从明细票汇总出的口径，用于与 Z 报表交叉核对。 */
    private static final class DayTotal {
        double sale, ret, voided;
    }

    /**
     * Z-READING 校验：报表内部自洽 + 跨报表连续性 + 与明细票交叉核对。
     *
     * <p>各规则的口径都在这批真实数据上逐条验证过，勿凭直觉修改：
     * <ul>
     *   <li>税分解基数要再扣 OTHER DISC（普通折扣），政府折扣不扣 —— 与单票 B 项同源；
     *   <li>LESS RETURN / LESS VOID 是<b>剥完 VAT</b> 的净额，VAT 部分记在
     *       VAT ON RETURN / VAT ON VOID，两者相加等于明细票「Gross + LessVAT」
     *       （即该票税分解四项之和；退货/作废票的 LessVAT 行印正值冲回）；
     *   <li>当日无销售时 Beg./End. SI # 停在上一期的 End，不算断号。
     * </ul>
     */
    private static List<Check> auditZReading(List<Block> blocks) {
        // 文件整体按票据打印时间排序，但补做 Z 时多张报表可能具有相同的 Report Date & Time，
        // 此时源列表顺序不一定等于营业日顺序。Z Counter、累计销售和 SI 号段都必须按
        // Start Date & Time 所代表的营业日串联，否则会把 8/12 #17、8/11 #16 误判为断号。
        List<Block> zs = blocks.stream()
            .filter(b -> "Z-READING REPORT".equals(b.type()))
            .sorted(Comparator
                .comparing(Block::businessDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(Block::time, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparingInt(Block::idx))
            .toList();

        System.out.println();
        System.out.println(SEP_LINE);
        System.out.printf(" 【四】Z-READING — %d 张%n", zs.size());
        System.out.println(SEP_LINE);
        if (zs.isEmpty()) {
            System.out.println("   本文件没有 Z-READING，跳过");
            return List.of();
        }

        // 明细票按营业日汇总（双联票按单号去重，否则金额翻倍）
        Map<String, DayTotal> day = new LinkedHashMap<>();
        java.util.Set<String> seen = new java.util.HashSet<>();
        java.util.Set<Long> siSeen = new java.util.HashSet<>();
        java.util.Set<Long> voidSeen = new java.util.HashSet<>();
        java.util.Set<Long> retSeen = new java.util.HashSet<>();
        for (Block b : blocks) {
            if (!b.isTxn()) continue;
            Double g = amountOf(b.body(), "Gross Sales");
            String no;
            String d;
            if (b.isSale()) {
                no = "S" + find(b.body(), "^[ \t]*SI[ \t]+(\\d{10,})[ \t]*$");
                d = find(b.body(), "Exact Date:[ \t]*(\\d{4}-\\d{2}-\\d{2})");
            } else if (b.isReturn()) {
                no = "R" + find(b.body(), "^RETURN#[ \t]+(\\d{10,})[ \t]*$");
                d = find(b.body(), "Date ?& ?Time[ \t]*(\\d{4}-\\d{2}-\\d{2})");
            } else {
                no = "V" + find(b.body(), "^VOID#[ \t]+(\\d{10,})[ \t]*$");
                d = find(b.body(), "Date ?& ?Time[ \t]*(\\d{4}-\\d{2}-\\d{2})");
            }
            // 单号集合用于号段缺号检测，去重前先登记
            Long n = numOf(b);
            if (n != null) {
                if (b.isSale()) siSeen.add(n);
                else if (b.isReturn()) retSeen.add(n);
                else voidSeen.add(n);
            }
            if (d == null || no.endsWith("null") || !seen.add(no) || g == null) continue;
            // 含税口径：退货/作废票的税分解合计 = Gross + LessVAT（LessVAT 行印正值冲回），
            // Z 报表的 LESS RETURN/VOID + VAT ON RETURN/VOID 对应的正是这个含税值
            double lessVat = sumAll(b.body(), "^LESS 12% VAT[ \t]+(-?[\\d,]+\\.\\d{2})[ \t]*$");
            DayTotal dt = day.computeIfAbsent(d, k -> new DayTotal());
            if (b.isSale()) dt.sale += g;
            else if (b.isReturn()) {
                // Z14 退货(设备口径,2026-09-18 终审):Z 桶按折前含税统计
                // (06-21 桶 580.39+69.61=650 与 A 日结/设备一致),票面合计不扣 Discount。
                dt.ret += g + lessVat;
            } else {
                // Z13 作废(实退口径,2026-09-18 生成器已改):Z 桶按实退净额含税统计
                // (08-07 桶 7294=4300+2994),票面合计须扣 Discount 行
                // (void#19: -4312+12=-4300 ✓、void#27: -5032+32=-5000 ✓)。
                double lineDisc = sumAll(b.body(),
                    "^(?:Regular Discount|Discount(?: 20%)?|LESS DISCOUNT)[ \\t]+([\\d,]+\\.\\d{2})[ \\t]*$");
                dt.voided += g + lessVat + lineDisc;
            }
        }

        int selfConsist = 0, netErr = 0, dayErr = 0, discErr = 0, adjErr = 0, vatAdjErr = 0;
        int counterErr = 0, accErr = 0, siErr = 0, dateErr = 0, gapErr = 0;
        int xGross = 0, xVoid = 0, xRet = 0;
        List<String> problems = new ArrayList<>();

        // Z15 文件级覆盖：每张交易票（去重后）的票面时间都应落在某个 Z 窗口内
        // [Start, End]。中段漏 Z / 漏导票会在此暴露；末张 Z 之后的票属未结账期，不计。
        // 累计链的文件级伸缩与 Z3 逐对校验等价，不重复做。
        int uncovered = 0;
        {
            record Win(String start, String end) {}
            List<Win> wins = new ArrayList<>();
            for (Block z : zs) {
                String st = find(z.body(), "Start Date ?& ?Time:?[ \\t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})");
                String en = find(z.body(), "End Date ?& ?Time:?[ \\t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})");
                if (st != null && en != null) wins.add(new Win(st, en));
            }
            String lastEnd = wins.isEmpty() ? null : wins.get(wins.size() - 1).end();
            java.util.Set<String> covSeen = new java.util.HashSet<>();
            for (Block b : blocks) {
                if (!b.isTxn() || b.time() == null) continue;
                Long n = numOf(b);
                if (!covSeen.add("T" + (n != null ? n : b.idx()))) continue;
                boolean covered = false;
                for (Win w : wins) {
                    if (b.time().compareTo(w.start()) >= 0 && b.time().compareTo(w.end()) <= 0) {
                        covered = true;
                        break;
                    }
                }
                if (!covered && lastEnd != null && b.time().compareTo(lastEnd) <= 0) {
                    uncovered++;
                    problems.add("[Z 覆盖] " + tagOf(b) + " " + b.time() + " 不在任何 Z 窗口内");
                }
            }
        }

        for (int i = 0; i < zs.size(); i++) {
            Block z = zs.get(i);
            String b = z.body();
            String bd = z.businessDate() == null ? "?" : z.businessDate();
            String tag = "Z@" + bd;

            double gross = nz(amountOf(b, "GROSS AMOUNT:"));
            double lessDisc = nz(amountOf(b, "LESS DISCOUNT:"));
            double lessRet = nz(amountOf(b, "LESS RETURN:"));
            double lessVoid = nz(amountOf(b, "LESS VOID:"));
            double lessVatAdj = nz(amountOf(b, "LESS VAT ADJUSTMENT:"));
            double net = nz(amountOf(b, "NET AMOUNT:"));
            double otherDisc = nz(amountOf(b, "OTHER DISC:"));

            // Z1 税分解
            double bk = nz(amountOf(b, "VATABLE SALES:")) + nz(amountOf(b, "VAT AMOUNT:"))
                + nz(amountOf(b, "VAT EXEMPT SALES:")) + nz(amountOf(b, "ZERO RATED SALES:"));
            double bkExpect = gross - lessRet - lessVoid - lessVatAdj - otherDisc;
            if (Math.abs(bk - bkExpect) > EPS) {
                selfConsist++;
                problems.add(String.format("[Z1 税分解] %s: 合计 %.2f，基数 %.2f，差 %.2f",
                    tag, bk, bkExpect, bk - bkExpect));
            }

            // Z2 净额
            double netExpect = gross - lessDisc - lessRet - lessVoid - lessVatAdj;
            if (Math.abs(net - netExpect) > EPS) {
                netErr++;
                problems.add(String.format("[Z2 净额] %s: NET %.2f，应为 %.2f", tag, net, netExpect));
            }

            // Z3 日销 = 本期累计 - 上期累计
            double present = nz(amountOf(b, "Present Accumulated Sales"));
            double previous = nz(amountOf(b, "Previous Accumulated Sales:"));
            double dayS = nz(amountOf(b, "Sales for the Day:"));
            if (Math.abs(present - previous - dayS) > EPS) {
                dayErr++;
                problems.add(String.format("[Z3 日销] %s: %.2f-%.2f=%.2f，票面 %.2f",
                    tag, present, previous, present - previous, dayS));
            }

            // Z4 折扣汇总
            double discSum = 0;
            for (String l : new String[]{"SC DISC:", "PWD DISC:", "NAAC DISC:", "SP DISC:",
                                         "MOV DISC:", "OTHER DISC:"}) {
                discSum += nz(amountOf(b, l));
            }
            if (Math.abs(discSum - lessDisc) > EPS) {
                discErr++;
                problems.add(String.format("[Z4 折扣汇总] %s: 明细合计 %.2f，LESS DISCOUNT %.2f",
                    tag, discSum, lessDisc));
            }

            // Z5 销售调整
            if (Math.abs(nz(amountOf(b, "RETURN:")) - lessRet) > EPS
                || Math.abs(nz(amountOf(b, "VOID:")) - lessVoid) > EPS) {
                adjErr++;
                problems.add(String.format("[Z5 销售调整] %s: RETURN %.2f/%.2f  VOID %.2f/%.2f",
                    tag, nz(amountOf(b, "RETURN:")), lessRet, nz(amountOf(b, "VOID:")), lessVoid));
            }

            // Z6 VAT 调整汇总
            double vatAdjSum = 0;
            for (String l : new String[]{"SC TRANS:", "PWD TRANS:", "NAAC TRANS:", "SP TRANS:",
                                         "MOV TRANS:", "DIPLOMATIC TRANS:", "REG DISC TRANS:",
                                         "ZERO-RATED TRANS:", "VAT ON RETURN:", "VAT ON VOID:",
                                         "OTHER VAT Adjustment:"}) {
                vatAdjSum += nz(amountOf(b, l));
            }
            if (Math.abs(vatAdjSum - lessVatAdj) > EPS) {
                vatAdjErr++;
                problems.add(String.format("[Z6 VAT调整] %s: 明细合计 %.2f，LESS VAT ADJUSTMENT %.2f",
                    tag, vatAdjSum, lessVatAdj));
            }

            // Z10 日期段：同一营业日、00:00:00 ~ 23:59:59；报表时间不早于起始时间。
            // 报表时间可以早于 23:59:59（当班提前结 Z 是正常操作），不做校验。
            String start = find(b, "Start Date ?& ?Time:[ \t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})");
            String end = find(b, "End Date ?& ?Time:[ \t]*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})");
            String report = z.time();
            if (start == null || end == null
                || !start.substring(0, 10).equals(end.substring(0, 10))
                || !start.endsWith("00:00:00") || !end.endsWith("23:59:59")
                || (report != null && report.compareTo(start) < 0)) {
                dateErr++;
                problems.add(String.format("[Z10 日期段] %s: Start %s / End %s / Report %s",
                    tag, start, end, report));
            }

            // Z11 号段缺号：Beg~End 之间的每个单号都应能在明细里找到
            gapErr += checkGap(tag, b, "SI", siSeen, problems);
            gapErr += checkGap(tag, b, "VOID", voidSeen, problems);
            gapErr += checkGap(tag, b, "RETURN", retSeen, problems);

            // Z12~Z14 与明细票交叉核对
            DayTotal dt = day.getOrDefault(bd, new DayTotal());
            if (Math.abs(gross - dt.sale) > EPS) {
                xGross++;
                problems.add(String.format("[Z12 毛额交叉] %s: Z %.2f，当日销售票合计 %.2f，差 %.2f",
                    tag, gross, dt.sale, gross - dt.sale));
            }
            double retFull = lessRet + nz(amountOf(b, "VAT ON RETURN:"));
            if (Math.abs(retFull - Math.abs(dt.ret)) > EPS) {
                xRet++;
                problems.add(String.format("[Z14 退货交叉] %s: Z 含税 %.2f，当日退货票合计 %.2f，差 %.2f",
                    tag, retFull, Math.abs(dt.ret), retFull - Math.abs(dt.ret)));
            }
            double voidFull = lessVoid + nz(amountOf(b, "VAT ON VOID:"));
            if (Math.abs(voidFull - Math.abs(dt.voided)) > EPS) {
                xVoid++;
                problems.add(String.format("[Z13 作废交叉] %s: Z 含税 %.2f，当日作废票合计 %.2f，差 %.2f",
                    tag, voidFull, Math.abs(dt.voided), voidFull - Math.abs(dt.voided)));
            }

            // Z7/Z8/Z9 跨报表连续性
            if (i > 0) {
                Block p = zs.get(i - 1);
                Integer zc = intOf(b, "Z Counter.");
                Integer zp = intOf(p.body(), "Z Counter.");
                if (zc != null && zp != null && zc != zp + 1) {
                    counterErr++;
                    problems.add(String.format("[Z7 计数器] %s: 上期 %d → 本期 %d，非连续", tag, zp, zc));
                }
                // Z-counter 按天维度累加：每日恰好一张 Z，营业日逐日连续推进，
                // counter 与日期序一一对应（2026-09-18 业务确认）。
                String bdp = p.businessDate();
                if (bd != null && bdp != null && !"?".equals(bd) && !"?".equals(bdp)) {
                    if (bd.equals(bdp)) {
                        counterErr++;
                        problems.add("[Z7 计数器] " + tag + ": 营业日 " + bd + " 出现第二张 Z（应每日一张）");
                    } else {
                        try {
                            java.time.LocalDate d0 = java.time.LocalDate.parse(bdp);
                            java.time.LocalDate d1 = java.time.LocalDate.parse(bd);
                            if (!d1.equals(d0.plusDays(1))) {
                                counterErr++;
                                problems.add(String.format("[Z7 计数器] %s: 营业日 %s → %s 跳档（counter 按天累加，日期应逐日连续）", tag, bdp, bd));
                            }
                        } catch (Exception ignore) { /* 日期非法留给 Z10 */ }
                    }
                }
                double prevPresent = nz(amountOf(p.body(), "Present Accumulated Sales"));
                if (Math.abs(previous - prevPresent) > EPS) {
                    accErr++;
                    problems.add(String.format("[Z8 累计链] %s: 本期上期累计 %.2f ≠ 上期本期累计 %.2f",
                        tag, previous, prevPresent));
                }
                // 当日有销售时 SI 必须向前推进；无销售时 Beg=End=上期 End 属正常
                Long begSi = longOf(b, "Beg. SI #:");
                Long prevEnd = longOf(p.body(), "End. SI #:");
                if (begSi != null && prevEnd != null && prevEnd != 0 && dayS != 0 && begSi <= prevEnd) {
                    siErr++;
                    problems.add(String.format("[Z9 SI 段] %s: 上期 End %d ≥ 本期 Beg %d，号段重叠",
                        tag, prevEnd, begSi));
                }
            }
        }

        // ── X-READING（班次切分）轻量校验：同日各班次 SI 段首尾相接，
        //    且整体落在当日 Z 的号段内。X 多于 Z 属正常（一 Z 多班）。──
        int xSeqBad = 0, xRangeBad = 0;
        {
            Map<String, List<Block>> xByDay = new LinkedHashMap<>();
            for (Block x : blocks) {
                if (!"X-READING".equals(x.type())) continue;
                String sd = find(x.body(), "Start Date ?& ?Time:[ \\t]*(\\d{4}-\\d{2}-\\d{2})");
                xByDay.computeIfAbsent(sd == null ? "?" : sd, k -> new ArrayList<>()).add(x);
            }
            for (Map.Entry<String, List<Block>> en : xByDay.entrySet()) {
                List<Block> dayX = en.getValue();
                dayX.sort((x1, x2) -> {
                    String t1 = x1.time() == null ? "" : x1.time();
                    String t2 = x2.time() == null ? "" : x2.time();
                    return t1.compareTo(t2);
                });
                Long prevEnd = null;
                for (Block x : dayX) {
                    Long beg = longOf(x.body(), "Beg. SI #:");
                    Long end = longOf(x.body(), "End. SI #:");
                    if (beg == null || end == null || end < beg) continue;
                    // 无销售班次 SI 计数器不推进：beg == prevEnd（沿用上期末号）属正常，
                    // 与 Z9「无销售时 Beg=End=上期 End 属正常」同一约定；beg > prevEnd+1 才是断号。
                    if (prevEnd != null && beg != prevEnd + 1 && !beg.equals(prevEnd)) {
                        xSeqBad++;
                        problems.add(String.format("[X 衔接] %s X@%s: SI %d 接不上前班次末号 %d",
                            en.getKey(), x.time(), beg, prevEnd));
                    }
                    prevEnd = end;
                }
                // 号段包含关系：允许跨午夜班次 —— X 的 SI 段可落在
                // [起日Z.beg, 止日Z.end] 联合区间(实测 08-11 20:54~08-12 22:05 的
                // 25 小时班次 SI 70~147 恰为 Z@08-12 号段)。
                for (Block z : zs) {
                    if (!en.getKey().equals(z.businessDate())) continue;
                    Long zBeg = longOf(z.body(), "Beg. SI #:");
                    if (zBeg == null) break;
                    // 止日 Z 的 end(窗口末日的 Z)
                    Long zEndFinal = zBeg;
                    String lastDay = en.getKey();
                    for (Block x : dayX) {
                        if (x.time() != null) lastDay = x.time().substring(0, 10);
                    }
                    for (Block z2 : zs) {
                        if (lastDay.equals(z2.businessDate())) {
                            Long e2 = longOf(z2.body(), "End. SI #:");
                            if (e2 != null) zEndFinal = e2;
                        }
                    }
                    for (Block x : dayX) {
                        Long beg = longOf(x.body(), "Beg. SI #:");
                        Long end = longOf(x.body(), "End. SI #:");
                        if (beg == null || end == null) continue;
                        // 换班时无新单，Beg/End 显示上期末号（zBeg-1 且 Beg==End）属正常
                        boolean ok = (beg >= zBeg && end <= zEndFinal)
                            || (beg == zBeg - 1 && end.equals(beg));
                        if (!ok) {
                            xRangeBad++;
                            problems.add(String.format("[X 号段] %s X@%s: SI %d~%d 越出 Z 号段 %d~%d",
                                en.getKey(), x.time(), beg, end, zBeg, zEndFinal));
                        }
                    }
                    break;
                }
            }
        }

        List<Check> checks = List.of(
            new Check("[Z] 税分解 = 毛额-退货-作废-VAT调整-普通折扣", selfConsist),
            new Check("[Z] 净额 = 毛额-折扣-退货-作废-VAT调整", netErr),
            new Check("[Z] 日销售 = 本期累计-上期累计", dayErr),
            new Check("[Z] 折扣明细合计 = LESS DISCOUNT", discErr),
            new Check("[Z] 销售调整 = LESS RETURN / LESS VOID", adjErr),
            new Check("[Z] VAT 调整明细合计 = LESS VAT ADJUSTMENT", vatAdjErr),
            new Check("[Z] Z Counter 逐日+1 且营业日连续（每日一张）", counterErr),
            new Check("[Z] 累计销售链首尾相接", accErr),
            new Check("[Z] SI 号段不重叠", siErr),
            new Check("[Z] 报表日期段规范", dateErr),
            new Check("[Z] 号段内无缺号（SI/VOID/RETURN）", gapErr),
            new Check("[Z] 毛额 = 当日销售票合计", xGross),
            new Check("[Z] 作废额 = 当日作废票合计（含税）", xVoid),
            new Check("[Z] 退货额 = 当日退货票合计（含税）", xRet),
            new Check("[Z] 交易票均在 Z 窗口内（末日之前）", uncovered),
            new Check("[X] 班次 SI 段首尾相接（同日内）", xSeqBad),
            new Check("[X] 班次 SI 段 ⊆ 当日 Z 号段", xRangeBad)
        );
        printChecks(checks, problems);
        System.out.printf("   ℹ 覆盖营业日 %d 天，Z Counter %s → %s%n",
            zs.size(), intOf(zs.get(0).body(), "Z Counter."),
            intOf(zs.get(zs.size() - 1).body(), "Z Counter."));
        return checks;
    }

    /**
     * 校验 Z 报表声明的单号区间在明细里没有缺号，返回缺号个数。
     *
     * <p><b>「当日无该类单据」的表示法</b>：Z 报表在当天没有作废/退货时，
     * Beg 与 End 都印上次已用的号（计数器不推进），例如连续多天都是
     * {@code VOID 14~14}，直到真的发生作废才跳到 {@code 18~19}。
     * 这与 Z9 SI 号段检查里既有的约定一致（见该处注释：
     * 「无销售时 Beg=End=上期 End 属正常」），此处补齐同样的判定。
     *
     * <p>因此 {@code beg == end} 且该号不在当日明细里时，视为当日无该类单据，
     * 不计缺号；但仍打一条 ℹ 提示，避免真缺一张时被静默吞掉。
     * 2026-08-31 生产核查踩过 —— 该门店 8/2~8/7 连续 6 天被误报 VOID#14 缺号。
     */
    private static int checkGap(
            String tag, String b, String label, java.util.Set<Long> seen, List<String> problems) {
        Long beg = longOf(b, "Beg. " + label + " #:");
        Long end = longOf(b, "End. " + label + " #:");
        if (beg == null || end == null || beg == 0 || end < beg) return 0;
        if (beg.equals(end) && !seen.contains(beg)) {
            problems.add(String.format("[Z11 无活动] %s: %s# 停在 %d 未推进，当日无%s单据",
                tag, label, beg, "VOID".equals(label) ? "作废" : "退货"));
            return 0;
        }
        int missing = 0;
        for (long n = beg; n <= end; n++) {
            if (!seen.contains(n)) {
                missing++;
                if (missing <= 5) {
                    problems.add(String.format("[Z11 缺号] %s: 声明 %s# %d~%d，明细里找不到 %s#%d",
                        tag, label, beg, end, label, n));
                }
            }
        }
        return missing;
    }

    /** 交易票自身的单号：销售取 SI，退货取 RETURN#，作废取 VOID#。 */
    private static Long numOf(Block b) {
        String s = b.isSale() ? find(b.body(), "^[ \t]*SI[ \t]+(\\d{10,})[ \t]*$")
            : b.isReturn() ? find(b.body(), "^RETURN#[ \t]+(\\d{10,})[ \t]*$")
            : find(b.body(), "^VOID#[ \t]+(\\d{10,})[ \t]*$");
        return s == null ? null : Long.parseLong(s);
    }

    /** 取「标签 + 整数」行，单号有前导零，用 long 承接避免溢出。 */
    private static Long longOf(String b, String label) {
        String v = find(b, "^" + Pattern.quote(label) + "[ \t]+(\\d+)[ \t]*$");
        return v == null ? null : Long.parseLong(v);
    }

    private static double nz(Double v) {
        return v == null ? 0 : v;
    }

    /** 记录某项校验的最大偏差及其所在票，通过与否都记。 */
    private static void track(double[] maxDiff, String[] tags, int i, double diff, String tag) {
        if (diff > maxDiff[i]) {
            maxDiff[i] = diff;
            tags[i] = tag;
        }
    }

    /** 打印一组校验项，附最多 10 条明细。 */
    private static void printChecks(List<Check> checks, List<String> problems) {
        for (Check c : checks) {
            System.out.printf("  %s %-44s 异常 %d%n",
                c.failures() == 0 ? "✅" : "❌", c.label(), c.failures());
        }
        if (!problems.isEmpty()) {
            System.out.println("  明细（最多 50 条）:");
            problems.stream().limit(50).forEach(p -> System.out.println("   " + p));
            if (problems.size() > 50) {
                System.out.println("   ... 另有 " + (problems.size() - 50) + " 条");
            }
        }
    }

    private EjAudit() {}

    /** 去掉 Cashier/Customer 标记行、去行尾空白后的票身行。 */
    private static List<String> copyBodyLines(String body) {
        List<String> out = new ArrayList<>();
        for (String l : body.split("\n", -1)) {
            String t = l.trim();
            if (t.equals("Cashier Copy") || t.equals("Customer Copy")) continue;
            out.add(l.stripTrailing());
        }
        return out;
    }

    /** 两副本不一致时返回第一处差异描述，一致返回 null。 */
    private static String copyBodyDiff(String a, String c) {
        List<String> la = copyBodyLines(a), lc = copyBodyLines(c);
        int n = Math.max(la.size(), lc.size());
        for (int i = 0; i < n; i++) {
            String x = i < la.size() ? la.get(i) : "(缺行)";
            String y = i < lc.size() ? lc.get(i) : "(缺行)";
            if (!x.equals(y)) return "第" + (i + 1) + "行 Cashier\"" + x + "\" / Customer\"" + y + "\"";
        }
        return null;
    }
}
