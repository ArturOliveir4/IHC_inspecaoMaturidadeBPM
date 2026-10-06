package com.profnit.uepb.maturidade.web.dto;

import java.time.LocalDate;
import java.util.List;

public class KpiAsIsRequestDTO {
    private Long cicloAvaliacaoId;
    private String setorResponsavel;
    private LocalDate dataMedicao;
    private String responsavelAnalise;
    private String motivoPriorizacao;
    private LocalDate dataInicioAmostra;
    private LocalDate dataFimAmostra;
    private String unidadeTmc;
    private Integer notaAgilidade;
    private Integer notaClareza;
    private List<CasoAmostraDTO> casos;

    public KpiAsIsRequestDTO() {}

    // Getters e Setters
    public Long getCicloAvaliacaoId() { return cicloAvaliacaoId; }
    public void setCicloAvaliacaoId(Long cicloAvaliacaoId) { this.cicloAvaliacaoId = cicloAvaliacaoId; }
    public String getSetorResponsavel() { return setorResponsavel; }
    public void setSetorResponsavel(String setorResponsavel) { this.setorResponsavel = setorResponsavel; }
    public LocalDate getDataMedicao() { return dataMedicao; }
    public void setDataMedicao(LocalDate dataMedicao) { this.dataMedicao = dataMedicao; }
    public String getResponsavelAnalise() { return responsavelAnalise; }
    public void setResponsavelAnalise(String responsavelAnalise) { this.responsavelAnalise = responsavelAnalise; }
    public String getMotivoPriorizacao() { return motivoPriorizacao; }
    public void setMotivoPriorizacao(String motivoPriorizacao) { this.motivoPriorizacao = motivoPriorizacao; }
    public LocalDate getDataInicioAmostra() { return dataInicioAmostra; }
    public void setDataInicioAmostra(LocalDate dataInicioAmostra) { this.dataInicioAmostra = dataInicioAmostra; }
    public LocalDate getDataFimAmostra() { return dataFimAmostra; }
    public void setDataFimAmostra(LocalDate dataFimAmostra) { this.dataFimAmostra = dataFimAmostra; }
    public String getUnidadeTmc() { return unidadeTmc; }
    public void setUnidadeTmc(String unidadeTmc) { this.unidadeTmc = unidadeTmc; }
    public Integer getNotaAgilidade() { return notaAgilidade; }
    public void setNotaAgilidade(Integer notaAgilidade) { this.notaAgilidade = notaAgilidade; }
    public Integer getNotaClareza() { return notaClareza; }
    public void setNotaClareza(Integer notaClareza) { this.notaClareza = notaClareza; }
    public List<CasoAmostraDTO> getCasos() { return casos; }
    public void setCasos(List<CasoAmostraDTO> casos) { this.casos = casos; }
}