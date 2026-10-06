package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.KpiToBeService;
import com.profnit.uepb.maturidade.web.dto.KpiToBeRequestDTO;
import com.profnit.uepb.maturidade.web.dto.KpiToBeResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/processos/{processoId}/to-be/kpis")
public class KpiToBeController {

    private final KpiToBeService kpiToBeService;

    public KpiToBeController(KpiToBeService kpiToBeService) {
        this.kpiToBeService = kpiToBeService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN')")
    public ResponseEntity<KpiToBeResponseDTO> cadastrar(
            @PathVariable Long processoId,
            @RequestBody KpiToBeRequestDTO request,
            Authentication authentication
    ) {
        KpiToBeResponseDTO response = kpiToBeService.cadastrar(processoId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 👇 O MÉTODO QUE FALTAVA PARA PARAR DE DAR ERRO 404 NA EDIÇÃO
    @PutMapping("/{indicadorId}")
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN')")
    public ResponseEntity<KpiToBeResponseDTO> editar(
            @PathVariable Long processoId,
            @PathVariable Long indicadorId,
            @RequestBody KpiToBeRequestDTO request,
            Authentication authentication
    ) {
        // Certifique-se de que o método 'editar' exista no seu KpiToBeService!
        return ResponseEntity.ok(kpiToBeService.editar(processoId, indicadorId, request, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN')")
    public ResponseEntity<KpiToBeResponseDTO> buscar(
            @PathVariable Long processoId,
            @RequestParam Long cicloAvaliacaoId
    ) {
        return ResponseEntity.ok(kpiToBeService.buscarPorProcessoECiclo(processoId, cicloAvaliacaoId));
    }
}