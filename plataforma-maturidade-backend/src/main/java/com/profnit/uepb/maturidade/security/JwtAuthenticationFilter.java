package com.profnit.uepb.maturidade.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AuthenticationEntryPoint authenticationEntryPoint;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            AuthenticationEntryPoint authenticationEntryPoint
    ) {
        this.jwtService = jwtService;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null) {
            if (!authHeader.startsWith("Bearer ")) {
                rejeitar(request, response, "Cabeçalho Authorization inválido.");
                return;
            }

            String token = authHeader.substring(7).trim();
            if (token.isEmpty() || !jwtService.isTokenValido(token)) {
                SecurityContextHolder.clearContext();
                rejeitar(request, response, "Token expirado, adulterado ou inválido.");
                return;
            }

            String email = jwtService.extrairEmail(token);
            String perfil = jwtService.extrairPerfil(token);
            String authority = normalizarAuthority(perfil);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private void rejeitar(
            HttpServletRequest request,
            HttpServletResponse response,
            String mensagem
    ) throws IOException, ServletException {
        authenticationEntryPoint.commence(
                request,
                response,
                new InsufficientAuthenticationException(mensagem)
        );
    }

    private String normalizarAuthority(String perfil) {
        if (perfil == null || perfil.isBlank()) {
            return "ROLE_AVALIADOR";
        }
        return perfil.startsWith("ROLE_") ? perfil : "ROLE_" + perfil;
    }
}
