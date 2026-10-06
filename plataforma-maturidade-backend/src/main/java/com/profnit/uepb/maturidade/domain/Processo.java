package com.profnit.uepb.maturidade.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "processos")
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean priorizado = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    // 1. Apaga os diagramas vinculados
    @JsonIgnore
    @OneToMany(mappedBy = "processo", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<DiagramaBpmnAsIs> diagramasAsIs;

    // 2. Apaga as Fichas AS-IS vinculadas
    @JsonIgnore
    @OneToMany(mappedBy = "processo", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<IndicadorKpiAsIs> kpisAsIs;

    // 3. Apaga as Fichas TO-BE vinculadas
    @JsonIgnore
    @OneToMany(mappedBy = "processo", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<IndicadorKpiToBe> kpisToBe;

    // 4. SOLUÇÃO: Apaga os Alertas de Acompanhamento vinculados
    @JsonIgnore
    @OneToMany(mappedBy = "processo", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<AlertaAcompanhamento> alertasAcompanhamento;

    // 5. Apaga as versões do plano de governança vinculadas
    @JsonIgnore
    @OneToMany(mappedBy = "processo", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<PlanoGovernanca> planosGovernanca;

    public Processo() {}

    @PrePersist
    private void prePersist() {
        this.criadoEm = LocalDateTime.now();
        if (this.priorizado == null) this.priorizado = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Boolean getPriorizado() { return priorizado; }
    public void setPriorizado(Boolean priorizado) { this.priorizado = priorizado; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    
    public List<DiagramaBpmnAsIs> getDiagramasAsIs() { return diagramasAsIs; }
    public void setDiagramasAsIs(List<DiagramaBpmnAsIs> diagramasAsIs) { this.diagramasAsIs = diagramasAsIs; }

    public List<IndicadorKpiAsIs> getKpisAsIs() { return kpisAsIs; }
    public void setKpisAsIs(List<IndicadorKpiAsIs> kpisAsIs) { this.kpisAsIs = kpisAsIs; }

    public List<IndicadorKpiToBe> getKpisToBe() { return kpisToBe; }
    public void setKpisToBe(List<IndicadorKpiToBe> kpisToBe) { this.kpisToBe = kpisToBe; }

    public List<AlertaAcompanhamento> getAlertasAcompanhamento() { return alertasAcompanhamento; }
    public void setAlertasAcompanhamento(List<AlertaAcompanhamento> alertasAcompanhamento) { this.alertasAcompanhamento = alertasAcompanhamento; }

    public List<PlanoGovernanca> getPlanosGovernanca() { return planosGovernanca; }
    public void setPlanosGovernanca(List<PlanoGovernanca> planosGovernanca) { this.planosGovernanca = planosGovernanca; }
}