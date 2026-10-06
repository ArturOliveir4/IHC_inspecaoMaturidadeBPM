package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "indicadores_kpi_to_be",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_kpi_to_be_processo_ciclo",
        columnNames = {"processo_id", "ciclo_avaliacao_id"}
    )
)
public class IndicadorKpiToBe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @Column(name = "ciclo_avaliacao_id", nullable = false)
    private Long cicloAvaliacaoId;

    @Column(name = "tmc", nullable = false, precision = 10, scale = 2)
    private BigDecimal tmc;

    @Column(name = "unidade_tmc", nullable = false, length = 10)
    private String unidadeTmc = "DIAS";

    @Column(name = "tr", nullable = false, precision = 5, scale = 2)
    private BigDecimal tr;

    @Column(name = "ns", nullable = false)
    private Integer ns;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false, updatable = false)
    private String criadoPor;

    @Column
    private LocalDateTime atualizadoEm;

    @Column
    private String atualizadoPor;

    public IndicadorKpiToBe() {}

    @PrePersist
    private void prePersist() { this.criadoEm = LocalDateTime.now(); }

    @PreUpdate
    private void preUpdate() { this.atualizadoEm = LocalDateTime.now(); }

    // Getters e Setters idênticos aos da entidade IndicadorKpiAsIs
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Processo getProcesso() { return processo; }
    public void setProcesso(Processo processo) { this.processo = processo; }
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
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String updatedPor) { this.atualizadoPor = updatedPor; }
}