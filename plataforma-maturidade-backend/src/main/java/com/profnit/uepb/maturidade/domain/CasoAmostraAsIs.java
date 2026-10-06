package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "casos_amostra_as_is")
public class CasoAmostraAsIs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "indicador_kpi_id", nullable = false)
    private IndicadorKpiAsIs indicadorKpi;

    @Column(name = "identificador_caso", nullable = false, length = 50)
    private String identificadorCaso; // ex: "01", "02", "03"

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(name = "tempo_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal tempoTotal;

    @Column(name = "houve_retrabalho", nullable = false)
    private Boolean houveRetrabalho;

    @Column(length = 500)
    private String observacao;

    public CasoAmostraAsIs() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public IndicadorKpiAsIs getIndicadorKpi() { return indicadorKpi; }
    public void setIndicadorKpi(IndicadorKpiAsIs indicadorKpi) { this.indicadorKpi = indicadorKpi; }
    public String getIdentificadorCaso() { return identificadorCaso; }
    public void setIdentificadorCaso(String identificadorCaso) { this.identificadorCaso = identificadorCaso; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public LocalDate getDataFim() { return dataFim; }
    public void setDataFim(LocalDate dataFim) { this.dataFim = dataFim; }
    public BigDecimal getTempoTotal() { return tempoTotal; }
    public void setTempoTotal(BigDecimal tempoTotal) { this.tempoTotal = tempoTotal; }
    public Boolean getHouveRetrabalho() { return houveRetrabalho; }
    public void setHouveRetrabalho(Boolean houveRetrabalho) { this.houveRetrabalho = houveRetrabalho; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}