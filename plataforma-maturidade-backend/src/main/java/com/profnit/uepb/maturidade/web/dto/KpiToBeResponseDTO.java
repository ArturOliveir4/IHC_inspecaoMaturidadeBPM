package com.profnit.uepb.maturidade.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class KpiToBeResponseDTO {
    
    private Long id;
    private Long processoId;
    private Long cicloAvaliacaoId;
    private BigDecimal tmc;
    private String unidadeTmc;
    private BigDecimal tr;
    private Integer ns;
    private LocalDateTime criadoEm;
    private String criadoPor;
    private LocalDateTime atualizadoEm;
    private String atualizadoPor;

    public KpiToBeResponseDTO() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProcessoId() { return processoId; }
    public void setProcessoId(Long processoId) { this.processoId = processoId; }

    public Long getCicloAvaliacaoId() { return cicloAvaliacaoId; }
    public void setCicloAvaliacaoId(Long cicloAvaliacaoId) { this.cicloAvaliacaoId = cicloAvaliacaoId; }

    public BigDecimal getTmc() { return tmc; }
    public void setTmc(BigDecimal tmc) { this.tmc = tmc; }

    public String getUnidadeTmc() { return unidadeTmc; }
    public void setUnidadeTmc(String unidadeTmc) { this.unidadeTmc = unidadeTmc; }

    public BigDecimal getTr() { return tr; }
    public void setTr(BigDecimal tr) { this.tr = tr; }

    public Integer getNs() { return ns; }
    public void setNs(Integer ns) { this.ns = ns; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }

    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; }
}