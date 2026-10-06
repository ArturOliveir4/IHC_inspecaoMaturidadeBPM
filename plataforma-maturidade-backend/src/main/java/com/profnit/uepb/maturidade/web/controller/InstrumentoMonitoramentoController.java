package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.InstrumentoMonitoramentoService;
import com.profnit.uepb.maturidade.web.dto.InstrumentoMonitoramentoRequestDTO;
import com.profnit.uepb.maturidade.web.dto.InstrumentoMonitoramentoResponseDTO;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instrumentos-monitoramento")
public class InstrumentoMonitoramentoController {
    private final InstrumentoMonitoramentoService service;

    public InstrumentoMonitoramentoController(InstrumentoMonitoramentoService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'ANALISTA')")
    public List<InstrumentoMonitoramentoResponseDTO> listarPorProcesso(@RequestParam Long processoId) {
        return service.listarAtivosPorProcesso(processoId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'ANALISTA')")
    public ResponseEntity<InstrumentoMonitoramentoResponseDTO> cadastrar(
        @RequestBody InstrumentoMonitoramentoRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(request));
    }
}
