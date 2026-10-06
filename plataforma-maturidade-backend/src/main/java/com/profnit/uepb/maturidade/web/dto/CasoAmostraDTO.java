package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.CasoAmostraAsIs;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CasoAmostraDTO {
    private Long id;
    private String identificadorCaso;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private BigDecimal tempoTotal;
    private Boolean houveRetrabalho;
    private String observacao;

    public CasoAmostraDTO() {}

    public static CasoAmostraDTO from(CasoAmostraAsIs entity) {
        CasoAmostraDTO dto = new CasoAmostraDTO();
        dto.setId(entity.getId());
        dto.setIdentificadorCaso(entity.getIdentificadorCaso());
        dto.setDataInicio(entity.getDataInicio());
        dto.setDataFim(entity.getDataFim());
        dto.setTempoTotal(entity.getTempoTotal());
        dto.setHouveRetrabalho(entity.getHouveRetrabalho());
        dto.setObservacao(entity.getObservacao());
        return dto;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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