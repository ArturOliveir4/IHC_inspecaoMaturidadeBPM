package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.AlertaAcompanhamentoService;
import com.profnit.uepb.maturidade.web.dto.AlertaAcompanhamentoResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Consulta consolidada (todos os processos) dos alertas de acompanhamento
 * ativos — CA2: base de dados que a tela de calendário de governança (US17)
 * vai consumir para exibir as datas programadas.
 */
@RestController
@RequestMapping("/api/alertas")
public class CalendarioAlertasController {

    private final AlertaAcompanhamentoService alertaService;

    public CalendarioAlertasController(AlertaAcompanhamentoService alertaService) {
        this.alertaService = alertaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'ANALISTA', 'AVALIADOR')")
    public ResponseEntity<List<AlertaAcompanhamentoResponseDTO>> listarTodosAtivos() {
        return ResponseEntity.ok(alertaService.listarTodosAtivos());
    }
}
