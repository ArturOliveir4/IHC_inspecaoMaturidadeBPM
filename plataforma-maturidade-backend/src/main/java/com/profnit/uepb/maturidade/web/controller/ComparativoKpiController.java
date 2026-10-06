package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.ComparativoKpiService;
import com.profnit.uepb.maturidade.web.dto.ComparativoKpiDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/processos/{processoId}/comparativo")
public class ComparativoKpiController {

    private final ComparativoKpiService comparativoKpiService;

    public ComparativoKpiController(ComparativoKpiService comparativoKpiService) {
        this.comparativoKpiService = comparativoKpiService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN')")
    public ResponseEntity<List<ComparativoKpiDTO>> buscarComparativo(
            @PathVariable Long processoId,
            @RequestParam Long cicloAvaliacaoId
    ) {
        return ResponseEntity.ok(comparativoKpiService.calcularComparativo(processoId, cicloAvaliacaoId));
    }
}