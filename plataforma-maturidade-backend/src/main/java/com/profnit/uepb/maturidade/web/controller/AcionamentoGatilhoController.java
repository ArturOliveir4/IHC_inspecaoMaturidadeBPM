package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.AcionamentoGatilhoService;
import com.profnit.uepb.maturidade.web.dto.AcionamentoGatilhoRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/processos/{processoId}/gatilhos")
public class AcionamentoGatilhoController {

    private final AcionamentoGatilhoService service;

    public AcionamentoGatilhoController(AcionamentoGatilhoService service) {
        this.service = service;
    }

    @PostMapping("/acionar")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    public ResponseEntity<Void> acionarGatilho(
            @PathVariable Long processoId,
            @RequestBody AcionamentoGatilhoRequestDTO request,
            Authentication authentication
    ) {
        service.acionarGatilho(processoId, request, authentication.getName());
        return ResponseEntity.ok().build();
    }
}