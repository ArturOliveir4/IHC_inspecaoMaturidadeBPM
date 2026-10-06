package com.profnit.uepb.maturidade.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.profnit.uepb.maturidade.domain.AuditoriaLog;
import com.profnit.uepb.maturidade.repository.AuditoriaLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final AuditoriaLogRepository auditoriaLogRepository;

    public CustomAccessDeniedHandler(AuditoriaLogRepository auditoriaLogRepository) {
        this.auditoriaLogRepository = auditoriaLogRepository;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String user = (auth != null) ? auth.getName() : "ANONYMOUS";
        
        auditoriaLogRepository.save(new AuditoriaLog(user, "Tentativa de acesso não autorizado bloqueada (403) na rota: " + request.getRequestURI()));

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> data = new HashMap<>();
        data.put("status", 403);
        data.put("error", "Acesso Negado");
        data.put("message", "Você não tem permissão para acessar este recurso.");
        
        response.getWriter().write(new ObjectMapper().writeValueAsString(data));
    }
}