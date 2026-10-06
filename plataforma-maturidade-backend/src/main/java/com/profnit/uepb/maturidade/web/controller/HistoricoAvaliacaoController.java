package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.HistoricoAvaliacaoService;
import com.profnit.uepb.maturidade.web.dto.HistoricoAvaliacaoDetalheDTO;
import com.profnit.uepb.maturidade.web.dto.HistoricoAvaliacaoResumoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/diagnostico/historico")
public class HistoricoAvaliacaoController {

    private final HistoricoAvaliacaoService historicoAvaliacaoService;

    public HistoricoAvaliacaoController(HistoricoAvaliacaoService historicoAvaliacaoService) {
        this.historicoAvaliacaoService = historicoAvaliacaoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<List<HistoricoAvaliacaoResumoDTO>> listarConcluidas() {
        return ResponseEntity.ok(historicoAvaliacaoService.listarConcluidas());
    }

    @GetMapping("/todos")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<List<HistoricoAvaliacaoResumoDTO>> listarTodas() {
        return ResponseEntity.ok(historicoAvaliacaoService.listarTodasParaGestor());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<HistoricoAvaliacaoDetalheDTO> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(historicoAvaliacaoService.detalhar(id));
    }
}
