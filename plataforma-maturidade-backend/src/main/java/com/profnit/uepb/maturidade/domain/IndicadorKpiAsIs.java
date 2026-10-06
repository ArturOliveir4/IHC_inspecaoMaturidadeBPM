package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "indicadores_kpi_as_is",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_kpi_processo_ciclo",
        columnNames = {"processo_id", "ciclo_avaliacao_id"}
    )
)
public class IndicadorKpiAsIs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @Column(name = "ciclo_avaliacao_id", nullable = false)
    private Long cicloAvaliacaoId;

    // Cabeçalho / Contexto
    @Column(name = "setor_responsavel", nullable = false, length = 120)
    private String setorResponsavel = "CRPA / PROGRAD";

    @Column(name = "data_medicao", nullable = false)
    private LocalDate dataMedicao;

    @Column(name = "responsavel_analise", nullable = false, length = 160)
    private String responsavelAnalise;

    @Column(name = "motivo_priorizacao", nullable = false, length = 100)
    private String motivoPriorizacao; // "Falta de Padronização", "Baixa Tecnologia", "Alta Complexidade"

    // Período da Amostra
    @Column(name = "data_inicio_amostra")
    private LocalDate dataInicioAmostra;

    @Column(name = "data_fim_amostra")
    private LocalDate dataFimAmostra;

    @Column(name = "numero_casos")
    private Integer numeroCasos = 0;

    // Enquete de Satisfação (1 a 5)
    @Column(name = "nota_agilidade", nullable = false)
    private Integer notaAgilidade;

    @Column(name = "nota_clareza", nullable = false)
    private Integer notaClareza;

    // KPIs Calculados
    @Column(name = "tmc", nullable = false, precision = 10, scale = 2)
    private BigDecimal tmc;

    @Column(name = "unidade_tmc", nullable = false, length = 10)
    private String unidadeTmc = "DIAS";

    @Column(name = "tr", nullable = false, precision = 5, scale = 2)
    private BigDecimal tr;

    @Column(name = "ns", nullable = false, precision = 3, scale = 2)
    private BigDecimal ns;

    // Amostras de Casos Reais
    @OneToMany(mappedBy = "indicadorKpi", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CasoAmostraAsIs> casos = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false, updatable = false)
    private String criadoPor;

    @Column
    private LocalDateTime atualizadoEm;

    @Column
    private String atualizadoPor;

    public IndicadorKpiAsIs() {}

    @PrePersist
    private void prePersist() {
        this.criadoEm = LocalDateTime.now();
        if (this.dataMedicao == null) {
            this.dataMedicao = LocalDate.now();
        }
    }

    @PreUpdate
    private void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    // Helper para manter sincronizado o relacionamento bidirecional
    public void adicionarCaso(CasoAmostraAsIs caso) {
        casos.add(caso);
        caso.setIndicadorKpi(this);
    }

    public void limparCasos() {
        casos.forEach(c -> c.setIndicadorKpi(null));
        casos.clear();
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Processo getProcesso() { return processo; }
    public void setProcesso(Processo processo) { this.processo = processo; }
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
    public List<CasoAmostraAsIs> getCasos() { return casos; }
    public void setCasos(List<CasoAmostraAsIs> casos) { this.casos = casos; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; }
}