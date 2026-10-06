package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.DashboardService;
import com.profnit.uepb.maturidade.web.dto.DashboardGerencialDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST para a US19 — Visualizar Dashboard Gerencial.
 *
 * Único endpoint de leitura, consolidando tudo o que o dashboard precisa em uma
 * única requisição (CA2 — renderização rápida) e restrito a perfis com visão
 * gerencial (CA3 — tela inicial do Gestor).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/gerencial
     *
     * Retorna o percentual geral de maturidade da avaliação mais recente, os dados
     * do radar dos dez princípios e os KPIs AS-IS/TO-BE consolidados dos processos.
     *
     * HTTP 200 OK — mesmo quando ainda não há avaliações concluídas ou KPIs
     * cadastrados; nesse caso os campos vêm com indicadores de estado vazio,
     * para a UI tratar de forma amigável em vez de reagir a um erro.
     */
    @GetMapping("/gerencial")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'AVALIADOR', 'MEMBER')")
    public ResponseEntity<DashboardGerencialDTO> obterDashboardGerencial() {
        return ResponseEntity.ok(dashboardService.gerarDashboardGerencial());
    }
}
