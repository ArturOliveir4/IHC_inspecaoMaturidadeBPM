// src/main/java/com/profnit/uepb/maturidade/web/controller/GlobalExceptionHandler.java
package com.profnit.uepb.maturidade.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Handler global de exceções — driver CONF-03.
 *
 * Garante que exceções conhecidas retornem mensagens descritivas e amigáveis
 * sem expor stack traces, detalhes de implementação ou HTTP 500 desnecessários.
 *
 * Tratamento coberto:
 *  - ResponseStatusException  (usado no AvaliacaoService para 404, 403, 409, 422)
 *  - Exception genérico       (fallback para erros inesperados → 500 mascarado)
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Trata ResponseStatusException lançadas explicitamente nos Services.
     * Retorna o status HTTP e a mensagem definidos no ponto de lançamento.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(
            ResponseStatusException ex
    ) {
        return buildErrorResponse(ex.getStatusCode().value(), ex.getReason());
    }

    /**
     * Fallback para qualquer exceção não tratada explicitamente.
     * Retorna HTTP 500 com mensagem genérica — nunca expõe stack trace (CONF-03).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Ocorreu um erro interno. Tente novamente em instantes."
        );
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(int status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status);
        body.put("error", message != null ? message : "Erro não especificado.");
        return ResponseEntity.status(status).body(body);
    }
}
