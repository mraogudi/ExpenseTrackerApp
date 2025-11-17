package com.gmrao.expenses.service;

import com.gmrao.expenses.entity.User;
import com.gmrao.expenses.repository.BlacklistedTokenRepository;
import com.gmrao.expenses.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UserRepository users;
    private final BlacklistedTokenRepository blacklistRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);
        try {
            var claims = jwt.parse(token);
            String jti = claims.getId();
            if (blacklistRepo.existsByToken(jti)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
            String userId = claims.getSubject();
            User u = users.findById(Long.parseLong(userId)).orElse(null);
            if (u != null) {
                var authority = new SimpleGrantedAuthority(u.getRole().getName());
                var auth = new UsernamePasswordAuthenticationToken(u, null, List.of(authority));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ignored) {
            System.out.println("JWT parsing failed: " + ignored.getMessage());
        }
        chain.doFilter(request, response);
    }
}
