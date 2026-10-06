package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.IndicadorKpiAsIs;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class KpiAsIsResponseDTO {
    private Long id;
    private Long processoId;
    private String processoNome;
    private Long cicloAvaliacaoId;
    private String setorResponsavel;
    private LocalDate dataMedicao;
    private String responsavelAnalise;
    private String motivoPriorizacao;
    private LocalDate dataInicioAmostra;
    private LocalDate dataFimAmostra;
    private Integer numeroCasos;
    private Integer notaAgilidade;
    private Integer notaClareza;
    private BigDecimal tmc;
    private String unidadeTmc;
    private BigDecimal tr;
    private BigDecimal ns;
    private List<CasoAmostraDTO> casos;
    private LocalDateTime criadoEm;
    private String criadoPor;
    private LocalDateTime atualizadoEm;
    private String atualizadoPor;

    public KpiAsIsResponseDTO() {}

    public static KpiAsIsResponseDTO from(IndicadorKpiAsIs entity) {
        KpiAsIsResponseDTO dto = new KpiAsIsResponseDTO();
        dto.setId(entity.getId());
        dto.setProcessoId(entity.getProcesso().getId());
        dto.setProcessoNome(entity.getProcesso().getNome());
        dto.setCicloAvaliacaoId(entity.getCicloAvaliacaoId());
        dto.setSetorResponsavel(entity.getSetorResponsavel());
        dto.setDataMedicao(entity.getDataMedicao());
        dto.setResponsavelAnalise(entity.getResponsavelAnalise());
        dto.setMotivoPriorizacao(entity.getMotivoPriorizacao());
        dto.setDataInicioAmostra(entity.getDataInicioAmostra());
        dto.setDataFimAmostra(entity.getDataFimAmostra());
        dto.setNumeroCasos(entity.getNumeroCasos());
        dto.setNotaAgilidade(entity.getNotaAgilidade());
        dto.setNotaClareza(entity.getNotaClareza());
        dto.setTmc(entity.getTmc());
        dto.setUnidadeTmc(entity.getUnidadeTmc());
        dto.setTr(entity.getTr());
        dto.setNs(entity.getNs());
        dto.setCriadoEm(entity.getCriadoEm());
        dto.setCriadoPor(entity.getCriadoPor());
        dto.setAtualizadoEm(entity.getAtualizadoEm());
        dto.setAtualizadoPor(entity.getAtualizadoPor());

        if (entity.getCasos() != null) {
            dto.setCasos(entity.getCasos().stream()
                .map(CasoAmostraDTO::from)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProcessoId() { return processoId; }
    public void setProcessoId(Long processoId) { this.processoId = processoId; }
    public String getProcessoNome() { return processoNome; }
    public void setProcessoNome(String processoNome) { this.processoNome = processoNome; }
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
    public Integer getNumeroCasos() { return numeroCasos; }
    public void setNumeroCasos(Integer numeroCasos) { this.numeroCasos = numeroCasos; }
    public Integer getNotaAgilidade() { return notaAgilidade; }
    public void setNotaAgilidade(Integer notaAgilidade) { this.notaAgilidade = notaAgilidade; }
    public Integer getNotaClareza() { return notaClareza; }
    public void setNotaClareza(Integer notaClareza) { this.notaClareza = notaClareza; }
    public BigDecimal getTmc() { return tmc; }
    public void setTmc(BigDecimal tmc) { this.tmc = tmc; }
    public String getUnidadeTmc() { return unidadeTmc; }
    public void setUnidadeTmc(String unidadeTmc) { this.unidadeTmc = unidadeTmc; }
    public BigDecimal getTr() { return tr; }
    public void setTr(BigDecimal tr) { this.tr = tr; }
    public BigDecimal getNs() { return ns; }
    public void setNs(BigDecimal ns) { this.ns = ns; }
    public List<CasoAmostraDTO> getCasos() { return casos; }
    public void setCasos(List<CasoAmostraDTO> casos) { this.casos = casos; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }
    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; }
}