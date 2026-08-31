package com.ppos.ejtest;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Value;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * EJ 渲染引擎：在 JVM 上执行 BAPP 那份 TS 编译出来的 bundle。
 *
 * <p>不含任何渲染或编排逻辑，只负责「把 JSON 递进去、把文本接回来」。
 * 渲染规则与 EJ 组装规则的唯一事实来源都是 ppos_bapp 的
 * templates / mappers / ejournalAssembler，因此云端产出与设备端天然一致。
 *
 * <p>宿主与 JS 之间只传字符串（JSON in / String out），不暴露任何 Java 对象，
 * 所以无需 allowAllAccess。
 *
 * <p><b>线程安全</b>：GraalJS 的 Context 不是线程安全的。本类按「一次导出一个实例」
 * 使用；若要并发导出，用对象池或 per-request 实例，不要跨线程共享。
 */
public class EjRenderEngine implements AutoCloseable {

    /** mappers 里有 console.warn/error，GraalJS 默认没有 console，先补一个空实现。 */
    private static final String CONSOLE_SHIM =
            "globalThis.console = globalThis.console || {"
            + "log:function(){}, warn:function(){}, error:function(){}, info:function(){}"
            + "};";

    /**
     * 编排器工厂。返回的对象把 JS 侧 assembler 包一层，
     * 使宿主只需传递 JSON 字符串，无需处理 polyglot 对象映射。
     */
    private static final String ASSEMBLER_FACTORY =
            "(function(configJson, optionsJson) {"
            + "  var asm = EJ.createEjournalAssembler("
            + "      JSON.parse(configJson), JSON.parse(optionsJson));"
            + "  return {"
            + "    addPage: function(listJson, detailsJson) {"
            + "      asm.addPage(JSON.parse(listJson), JSON.parse(detailsJson));"
            + "    },"
            + "    finish: function() { return asm.finish(); },"
            + "    stats: function() { return JSON.stringify(asm.getStats()); }"
            + "  };"
            + "})";

    /** 单订单渲染（调试 / 单张重打用）。 */
    private static final String RENDER_ORDER_FN =
            "(function(detailJson, configJson, isReprint) {"
            + "  var d = JSON.parse(detailJson);"
            + "  var c = JSON.parse(configJson);"
            + "  var out = '';"
            + "  var list = EJ.generateOrderReceiptTexts(d, c,"
            + "      { bilingual: false, isReprint: !!isReprint });"
            + "  for (var i = 0; i < list.length; i++) {"
            + "    out += '\\n   \\n' + EJ.stripPrinterMarkers(list[i].text) + '\\n\\n';"
            + "  }"
            + "  return out;"
            + "})";

    /**
     * 进程内共享实例。
     *
     * <p>构造一次要 ~1.5s（建 Context + 解析 170KB bundle），而这份 bundle 是无状态的，
     * 每次导出重建纯属浪费。搬进 ppos-cloud 后应做成 Spring 单例 Bean。
     *
     * <p><b>线程安全警告</b>：GraalJS 的 Context 不是线程安全的。单线程导出可直接用本实例；
     * 要并发导出必须改成对象池（每线程一个 Context），不能共享。
     */
    private static volatile EjRenderEngine shared;

    public static EjRenderEngine shared() {
        EjRenderEngine e = shared;
        if (e == null) {
            synchronized (EjRenderEngine.class) {
                e = shared;
                if (e == null) {
                    e = new EjRenderEngine();
                    shared = e;
                }
            }
        }
        return e;
    }

    private final Context context;
    private final Value assemblerFactory;
    private final Value renderOrderFn;

    public EjRenderEngine() {
        this.context = Context.newBuilder("js")
                .option("engine.WarnInterpreterOnly", "false")
                .build();
        this.context.eval("js", CONSOLE_SHIM);
        this.context.eval("js", loadBundle());
        this.assemblerFactory = this.context.eval("js", ASSEMBLER_FACTORY);
        this.renderOrderFn = this.context.eval("js", RENDER_ORDER_FN);
    }

    /**
     * 创建一个按日期范围组装 EJ 的编排器。
     *
     * @param configJson  PrinterConfig JSON
     * @param optionsJson EjournalOptions JSON（startDate/endDate/isReprint/bilingual）
     */
    public Assembler newAssembler(String configJson, String optionsJson) {
        return new Assembler(assemblerFactory.execute(configJson, optionsJson));
    }

    /** 单订单渲染，返回已 strip 的小票文本片段。 */
    public String renderOrder(String detailJson, String configJson, boolean isReprint) {
        return renderOrderFn.execute(detailJson, configJson, isReprint).asString();
    }

    /** JS 编排器的 Java 句柄。 */
    public static class Assembler {
        private final Value handle;

        private Assembler(Value handle) {
            this.handle = handle;
        }

        /**
         * 累加一页。
         *
         * @param listJson    BAccountReceiptListVo JSON
         * @param detailsJson Map&lt;orderId, 详情VO&gt; JSON
         */
        public void addPage(String listJson, String detailsJson) {
            handle.getMember("addPage").execute(listJson, detailsJson);
        }

        /** 排序 + 拼接，返回完整 EJ 文本（不含 BOM）。 */
        public String finish() {
            return handle.getMember("finish").execute().asString();
        }

        /** EjournalStats JSON。 */
        public String stats() {
            return handle.getMember("stats").execute().asString();
        }
    }

    private static String loadBundle() {
        try (InputStream in = EjRenderEngine.class.getResourceAsStream("/ej-render.js")) {
            if (in == null) {
                throw new IllegalStateException("classpath 下找不到 ej-render.js");
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("读取 ej-render.js 失败", e);
        }
    }

    @Override
    public void close() {
        context.close();
    }
}
