package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.DiagramaBpmnAsIs;
import java.time.LocalDateTime;

public class DiagramaBpmnResponseDTO {
    private Long id;
    private Long processoId;
    private String nome;
    private String formato;
    private String contentType;
    private Long tamanhoBytes;
    private LocalDateTime enviadoEm;

    public static DiagramaBpmnResponseDTO from(DiagramaBpmnAsIs entity) {
        DiagramaBpmnResponseDTO dto = new DiagramaBpmnResponseDTO();
        dto.id = entity.getId();
        dto.processoId = entity.getProcesso().getId();
        dto.nome = entity.getNomeOriginal();
        dto.formato = entity.getFormato();
        dto.contentType = entity.getContentType();
        dto.tamanhoBytes = entity.getTamanhoBytes();
        dto.enviadoEm = entity.getEnviadoEm();
        return dto;
    }

    public Long getId() { return id; }
    public Long getProcessoId() { return processoId; }
    public String getNome() { return nome; }
    public String getFormato() { return formato; }
    public String getContentType() { return contentType; }
    public Long getTamanhoBytes() { return tamanhoBytes; }
    public LocalDateTime getEnviadoEm() { return enviadoEm; }
}
