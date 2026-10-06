package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.KpiAsIsService;
import com.profnit.uepb.maturidade.web.dto.KpiAsIsRequestDTO;
import com.profnit.uepb.maturidade.web.dto.KpiAsIsResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/processos/{processoId}/as-is/kpis")
public class KpiAsIsController {

    private final KpiAsIsService kpiAsIsService;

    public KpiAsIsController(KpiAsIsService kpiAsIsService) {
        this.kpiAsIsService = kpiAsIsService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'ADMIN')")
    public ResponseEntity<KpiAsIsResponseDTO> cadastrar(
            @PathVariable Long processoId,
            @RequestBody KpiAsIsRequestDTO request,
            Authentication authentication
    ) {
        KpiAsIsResponseDTO response = kpiAsIsService.cadastrar(processoId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{indicadorId}")
    @PreAuthorize("hasAnyRole('ANALISTA', 'ADMIN')")
    public ResponseEntity<KpiAsIsResponseDTO> editar(
            @PathVariable Long processoId,
            @PathVariable Long indicadorId,
            @RequestBody KpiAsIsRequestDTO request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(kpiAsIsService.editar(processoId, indicadorId, request, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN')")
    public ResponseEntity<KpiAsIsResponseDTO> buscar(
            @PathVariable Long processoId,
            @RequestParam Long cicloAvaliacaoId
    ) {
        return ResponseEntity.ok(kpiAsIsService.buscarPorProcessoECiclo(processoId, cicloAvaliacaoId));
    }
}
