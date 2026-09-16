package com.ppos.ejtest;

import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.SocketTimeoutException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/**
 * Gmail 发件。凭据放在项目根目录的 {@code gmail.properties}（不入库，模板见
 * {@code gmail.properties.example}）：from / appPassword / to。
 *
 * <p>appPassword 是 16 位「应用专用密码」（{@code https://myaccount.google.com/apppasswords}，
 * 需先开两步验证），不是 Gmail 登录密码。它不会过期，改登录密码也不影响；只有主动撤销
 * 或关闭两步验证才失效。
 *
 * <p>其它代码发邮件：{@code GmailSender.send(to, subject, body)}；
 * 快速自测：{@code mvn -q compile exec:java -Dexec.mainClass=com.ppos.ejtest.GmailSender}。
 */
public class GmailSender {

    private static final Path CONFIG_FILE = Path.of("gmail.properties");

    /** 排障时打开，会打印 SMTP 交互过程 */
    private static final boolean SMTP_DEBUG = false;

    public static void main(String[] args) throws Exception {
        Properties cfg = config();
        System.out.println("发件人 : " + cfg.getProperty("from"));
        System.out.println("收件人 : " + cfg.getProperty("to"));
        send(cfg.getProperty("to"), "ej-render-test 测试邮件", """
                这是一封由 GmailSender 发出的测试邮件。

                收到即说明 SMTP 配置正常。
                """);
        System.out.println();
        System.out.println(" ✓ 发送成功，去收件箱（或垃圾箱）看看吧。");
    }

    /** 发给指定收件人，凭据取自 gmail.properties。 */
    public static void send(String to, String subject, String body) throws MessagingException {
        send(config(), to, subject, body);
    }

    private static void send(Properties cfg, String to, String subject, String body)
            throws MessagingException {
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");

        // 可选：经本地 SOCKS5 代理出站（直连 smtp.gmail.com 被网络环境拦截时用）
        String socksHost = cfg.getProperty("socksHost", "");
        if (!socksHost.isBlank()) {
            props.put("mail.smtp.socks.host", socksHost);
            props.put("mail.smtp.socks.port", cfg.getProperty("socksPort", "1080"));
        }

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(cfg.getProperty("from"), cfg.getProperty("appPassword"));
            }
        });
        session.setDebug(SMTP_DEBUG);

        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(cfg.getProperty("from")));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
        message.setSubject(subject, "UTF-8");
        message.setText(body, "UTF-8");

        try {
            Transport.send(message);
        } catch (AuthenticationFailedException e) {
            throw new IllegalStateException(
                    "认证失败：确认 appPassword 是「应用专用密码」且不含空格（需先开启两步验证）。", e);
        } catch (MessagingException e) {
            if (e.getCause() instanceof SocketTimeoutException) {
                throw new IllegalStateException(
                        "连接超时：当前网络可能无法直连 smtp.gmail.com:587，需代理或换 SMTP 服务。", e);
            }
            throw e;
        }
    }

    private static Properties config() {
        if (!Files.isRegularFile(CONFIG_FILE)) {
            throw new IllegalStateException("缺少 " + CONFIG_FILE.toAbsolutePath()
                    + "：复制 gmail.properties.example 为 gmail.properties 并填入真实值。");
        }
        try {
            Properties cfg = new Properties();
            cfg.load(Files.newBufferedReader(CONFIG_FILE));
            if (cfg.getProperty("from", "").isBlank() || cfg.getProperty("appPassword", "").isBlank()
                    || cfg.getProperty("to", "").isBlank()) {
                throw new IllegalStateException(
                        CONFIG_FILE + " 缺字段：需填齐 from / appPassword / to。");
            }
            return cfg;
        } catch (IOException e) {
            throw new UncheckedIOException("读取 " + CONFIG_FILE + " 失败", e);
        }
    }
}
