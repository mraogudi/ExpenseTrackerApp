package com.gmrao.expenses.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromMail;

    private final JavaMailSender mailSender;

    public void sendMail(String to, String subject, String token) {

        String link = "http://localhost:5173/reset-password?token=" + token;

        String body = "Hello,\n\n"
                + "Use the link below to reset your password:\n"
                + link + "\n\n"
                + "This link is valid for 15 minutes.\n\n"
                + "Regards,\nSupport Team";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom(fromMail);

        mailSender.send(message);
    }

    public void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // <- true means HTML
            helper.setFrom("yourmail@gmail.com");

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email");
        }
    }

}
