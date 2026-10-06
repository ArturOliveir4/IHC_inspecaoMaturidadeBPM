package com.profnit.uepb.maturidade.web.dto;

import java.math.BigDecimal;

public class KpiToBeRequestDTO {
    private Long cicloAvaliacaoId;
    private BigDecimal tmc;
    private String unidadeTmc;
    private BigDecimal tr;
    private Integer ns;

    // Getters e Setters comuns
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
}