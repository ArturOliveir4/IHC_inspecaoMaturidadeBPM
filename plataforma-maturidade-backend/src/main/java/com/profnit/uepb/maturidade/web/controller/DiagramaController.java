package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.domain.DiagramaBpmnAsIs;
import com.profnit.uepb.maturidade.service.DiagramaBpmnService;
import com.profnit.uepb.maturidade.web.dto.DiagramaBpmnResponseDTO;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/processos/{processoId}/as-is/diagrama")
public class DiagramaController {

    private final DiagramaBpmnService diagramaBpmnService;

    public DiagramaController(DiagramaBpmnService diagramaBpmnService) {
        this.diagramaBpmnService = diagramaBpmnService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'ADMIN')")
    public ResponseEntity<DiagramaBpmnResponseDTO> upload(
            @PathVariable Long processoId,
            @RequestParam("arquivo") MultipartFile arquivo,
            Authentication authentication
    ) {
        return ResponseEntity.ok(diagramaBpmnService.salvar(processoId, arquivo, authentication.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN', 'AVALIADOR')")
    public ResponseEntity<DiagramaBpmnResponseDTO> buscarUltimo(@PathVariable Long processoId) {
        return ResponseEntity.ok(diagramaBpmnService.buscarUltimo(processoId));
    }

    @GetMapping("/arquivo")
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN', 'AVALIADOR')")
    public ResponseEntity<Resource> visualizarArquivo(@PathVariable Long processoId) {
        DiagramaBpmnAsIs metadata = diagramaBpmnService.buscarUltimoEntity(processoId);
        Resource arquivo = diagramaBpmnService.carregarArquivo(processoId);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(metadata.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getNomeOriginal() + "\"")
            .body(arquivo);
    }
}
