package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.AlertaAcompanhamentoService;
import com.profnit.uepb.maturidade.web.dto.AlertaAcompanhamentoRequestDTO;
import com.profnit.uepb.maturidade.web.dto.AlertaAcompanhamentoResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de configuração de Alertas de Acompanhamento (US16).
 * Configuração e manutenção são restritas a Gestor/Admin (CA1/CA2);
 * a consulta é liberada também para Analista e Avaliador, que podem
 * precisar visualizar o calendário de governança do processo.
 */
@RestController
@RequestMapping("/api/processos/{processoId}/alertas")
public class AlertaAcompanhamentoController {

    private final AlertaAcompanhamentoService alertaService;

    public AlertaAcompanhamentoController(AlertaAcompanhamentoService alertaService) {
        this.alertaService = alertaService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<AlertaAcompanhamentoResponseDTO> criar(
            @PathVariable Long processoId,
            @RequestBody AlertaAcompanhamentoRequestDTO request,
            Authentication authentication
    ) {
        AlertaAcompanhamentoResponseDTO response = alertaService.criar(processoId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'ANALISTA', 'AVALIADOR')")
    public ResponseEntity<List<AlertaAcompanhamentoResponseDTO>> listarPorProcesso(@PathVariable Long processoId) {
        return ResponseEntity.ok(alertaService.listarPorProcesso(processoId));
    }

    @PutMapping("/{alertaId}")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<AlertaAcompanhamentoResponseDTO> atualizar(
            @PathVariable Long processoId,
            @PathVariable Long alertaId,
            @RequestBody AlertaAcompanhamentoRequestDTO request,
            Authentication authentication
    ) {
        AlertaAcompanhamentoResponseDTO response = alertaService.atualizar(processoId, alertaId, request, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{alertaId}")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<Void> excluir(@PathVariable Long processoId, @PathVariable Long alertaId) {
        alertaService.excluir(processoId, alertaId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{alertaId}/concluir")
    @PreAuthorize("hasAnyRole('GESTOR', 'ANALISTA', 'ADMIN', 'AVALIADOR')")
    public ResponseEntity<AlertaAcompanhamentoResponseDTO> concluirRevisao(
            @PathVariable Long processoId,
            @PathVariable Long alertaId) {
        
        // Passando "Sistema" ou pegando o nome do usuário logado se você usar o Principal do Security
        String usuarioLogado = "Gestor (via Sistema)"; 
        
        // 👇 AQUI ESTÁ A CORREÇÃO: Usando 'alertaService' como definido no topo do seu arquivo
        AlertaAcompanhamentoResponseDTO response = alertaService.concluirRevisao(processoId, alertaId, usuarioLogado);
        return ResponseEntity.ok(response);
    }
}
