package com.gmrao.expenses.config;

import com.gmrao.expenses.service.AuthService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class BlacklistCheckFilter implements Filter {

    private final AuthService tokenService;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        String auth = request.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            if (tokenService.isAccessTokenBlacklisted(token)) {
                ((HttpServletResponse) res).sendError(401, "Token blacklisted");
                return;
            }
        }
        chain.doFilter(req, res);
    }
}
