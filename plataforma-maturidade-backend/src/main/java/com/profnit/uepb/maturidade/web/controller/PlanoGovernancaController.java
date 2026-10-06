package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.PlanoGovernancaService;
import com.profnit.uepb.maturidade.web.dto.PlanoGovernancaRequestDTO;
import com.profnit.uepb.maturidade.web.dto.PlanoGovernancaResponseDTO;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.profnit.uepb.maturidade.domain.ChecklistGovernanca;

@RestController
@RequestMapping("/api/planos-governanca")
@PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
public class PlanoGovernancaController {
    private final PlanoGovernancaService service;

    public PlanoGovernancaController(PlanoGovernancaService service) { this.service = service; }

    @GetMapping
    public List<PlanoGovernancaResponseDTO> listarVigentes() { return service.listarVigentes(); }

    @GetMapping("/processo/{processoId}/historico")
    public List<PlanoGovernancaResponseDTO> listarHistorico(@PathVariable Long processoId) {
        return service.listarHistorico(processoId);
    }

    @PostMapping
    public ResponseEntity<PlanoGovernancaResponseDTO> salvar(
        @RequestBody PlanoGovernancaRequestDTO request, Principal principal
    ) {
        String usuario = principal != null ? principal.getName() : "sistema";
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request, usuario));
    }

    @GetMapping("/checklist")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'ANALISTA', 'AVALIADOR')")
    public ResponseEntity<ChecklistGovernanca> buscarChecklist() {
        //  Trocado para 'service' (ou o nome que estiver no seu arquivo)
        return ResponseEntity.ok(service.buscarChecklistModulo());
    }

    @PutMapping("/checklist")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<ChecklistGovernanca> salvarChecklist(@RequestBody ChecklistGovernanca checklist) {
        //  Trocado para 'service' (ou o nome que estiver no seu arquivo)
        return ResponseEntity.ok(service.salvarChecklistModulo(checklist));
    }
}
