package com.ppos.ejtest;

import org.apache.fontbox.ttf.TrueTypeCollection;
import org.apache.fontbox.ttf.TrueTypeFont;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * EJ 文本 → PDF。
 *
 * <p><b>字体必须等宽，且 CJK 宽度恰好是拉丁字符的 2 倍</b>——小票排版靠
 * charPerLine=48 的固定列宽，而 getTextLength() 把 CJK 算 2 宽。
 * 用比例字体（如 Noto Sans SC）会让所有右对齐金额列散掉。
 *
 * <p>字体选择顺序：
 * <ol>
 *   <li>{@code fonts/} 下的等宽 CJK TTF（推荐 <b>Sarasa Mono SC</b>，SIL OFL 协议，可自由嵌入分发）</li>
 *   <li>Windows 自带 {@code simsun.ttc} 里的 <b>NSimSun</b>（新宋体，等宽变体）——本机验证用</li>
 *   <li>PDFBox 内置 COURIER + 非 ASCII 降级为 '?'——纯英文场景兜底</li>
 * </ol>
 *
 * <p><b>生产注意</b>：NSimSun 是微软字体，嵌入 PDF 分发有授权问题，且 Linux 服务器上不存在。
 * 部署前务必换成 Sarasa Mono SC 并随包分发。
 */
public class TxtToPdf {

    private static final float FONT_SIZE = 8f;
    private static final float LEADING = 9.6f;
    /** 左右边距。 */
    private static final float MARGIN = 40f;
    /**
     * 上下边距。EJ 是连续纸带，分页处上下边距相加就是页间视觉空白。
     * 下限由字体上伸部（约 7pt @ 8pt 字号）决定：首行基线距页顶不足字高会把
     * 首行字形削顶（4pt 时实测削顶），10pt ≈ 3.5mm 安全且页缝最小。
     */
    private static final float MARGIN_V = 10f;
    /** 页宽：A4 宽。 */
    private static final float PAGE_W = 595f;
    /**
     * 单页页高上限 = PDF 规格允许的最大边长 14,400pt（200 英寸 ≈ 5.08m）。
     * EJ 按"连续纸带"出 PDF：内容能装进一页就只有一页（阅读器零页缝）；
     * 装不下才按此上限分页，把页缝压到最少（月度 EJ 约 8 页，缝在每 5m 纸带处）。
     */
    private static final float PAGE_H_MAX = 14400f;

    /** 优先查找的等宽 CJK 字体文件。 */
    private static final Path[] PREFERRED_TTF = {
            Path.of("fonts", "SarasaMonoSC-Regular.ttf"),
            Path.of("fonts", "SarasaMonoSC-Regular.ttc"),
    };

    private static final Path SIMSUN_TTC = Path.of("C:", "Windows", "Fonts", "simsun.ttc");

    public static void convert(String text, File target) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            FontChoice choice = resolveFont(doc);
            try {
                if (choice.cjkCapable) {
                    String problem = verifyMonospace(choice.font);
                    System.out.println(problem == null
                            ? "字宽校验: 通过（拉丁等宽 + CJK 双宽）"
                            : "字宽校验: ⚠ " + problem + " —— 金额列可能错位");
                }
                render(doc, text, choice);
                doc.save(target);
            } finally {
                choice.close();
            }
        }
    }

    private static void render(PDDocument doc, String text, FontChoice choice) throws IOException {
        String[] lines = text.replace("﻿", "").split("\n", -1);

        // 页高按内容量决定：装得下就单页（无任何页缝），装不下按规格上限分页
        float needed = lines.length * LEADING + 2 * MARGIN_V;
        float pageH = Math.min(PAGE_H_MAX, needed);

        PDPage page = newPage(doc, pageH);
        PDPageContentStream cs = beginPage(doc, page, choice.font);
        float y = pageH - MARGIN_V;

        for (String line : lines) {
            if (y < MARGIN_V) {
                cs.endText();
                cs.close();
                page = newPage(doc, pageH);
                cs = beginPage(doc, page, choice.font);
                y = pageH - MARGIN_V;
            }
            cs.showText(choice.cjkCapable ? line : toAscii(line));
            cs.newLineAtOffset(0, -LEADING);
            y -= LEADING;
        }

        cs.endText();
        cs.close();
    }

    // ── 字体解析 ──────────────────────────────────────────

    private record FontChoice(PDFont font, boolean cjkCapable, String name,
                              TrueTypeCollection collection) {
        void close() {
            if (collection != null) {
                try {
                    collection.close();
                } catch (IOException ignored) {
                    // 关闭失败不影响已写出的 PDF
                }
            }
        }
    }

    private static FontChoice resolveFont(PDDocument doc) {
        for (Path p : PREFERRED_TTF) {
            if (Files.exists(p)) {
                try {
                    PDFont f = PDType0Font.load(doc, p.toFile());
                    System.out.println("PDF 字体: " + p);
                    return new FontChoice(f, true, p.toString(), null);
                } catch (IOException e) {
                    System.out.println("加载 " + p + " 失败，继续降级: " + e.getMessage());
                }
            }
        }

        if (Files.exists(SIMSUN_TTC)) {
            try {
                TrueTypeCollection ttc = new TrueTypeCollection(SIMSUN_TTC.toFile());
                TrueTypeFont ttf = ttc.getFontByName("NSimSun");
                if (ttf != null) {
                    PDFont f = PDType0Font.load(doc, ttf, true);
                    System.out.println("PDF 字体: NSimSun (simsun.ttc) —— 生产环境请换 Sarasa Mono SC");
                    return new FontChoice(f, true, "NSimSun", ttc);
                }
                ttc.close();
            } catch (IOException e) {
                System.out.println("加载 NSimSun 失败，继续降级: " + e.getMessage());
            }
        }

        System.out.println("PDF 字体: COURIER（内置，非 ASCII 会降级为 '?'）");
        return new FontChoice(PDType1Font.COURIER, false, "COURIER", null);
    }

    /**
     * 校验字体是否满足「CJK 恰好双宽」——排版正确性的前提。
     * 返回 null 表示通过，否则返回问题描述。
     */
    public static String verifyMonospace(PDFont font) {
        try {
            float latin = font.getStringWidth("M");
            float digit = font.getStringWidth("0");
            float cjk = font.getStringWidth("商");
            if (Math.abs(latin - digit) > 1f) {
                return String.format("拉丁字符非等宽: M=%.1f 0=%.1f", latin, digit);
            }
            if (Math.abs(cjk - latin * 2) > 2f) {
                return String.format("CJK 非双宽: 商=%.1f 应为 %.1f", cjk, latin * 2);
            }
            return null;
        } catch (Exception e) {
            return "宽度检测失败: " + e.getMessage();
        }
    }

    // ── 内部工具 ──────────────────────────────────────────

    private static PDPage newPage(PDDocument doc, float pageH) {
        PDPage page = new PDPage(new PDRectangle(PAGE_W, pageH));
        doc.addPage(page);
        return page;
    }

    private static PDPageContentStream beginPage(PDDocument doc, PDPage page, PDFont font)
            throws IOException {
        PDPageContentStream cs = new PDPageContentStream(doc, page);
        cs.beginText();
        cs.setFont(font, FONT_SIZE);
        cs.setLeading(LEADING);
        cs.newLineAtOffset(MARGIN, page.getMediaBox().getHeight() - MARGIN_V);
        return cs;
    }

    /** COURIER 是 WinAnsi 编码，无法编码 CJK，只能降级。 */
    private static String toAscii(String line) {
        StringBuilder sb = new StringBuilder(line.length());
        for (char c : line.toCharArray()) {
            sb.append(c < 128 ? c : '?');
        }
        return sb.toString();
    }
}
