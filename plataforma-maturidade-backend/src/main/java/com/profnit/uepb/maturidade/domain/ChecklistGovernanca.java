package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "checklist_governanca")
public class ChecklistGovernanca {
    
    @Id
    private Long id = 1L; // ID fixo porque é um checklist único do módulo

    private Boolean tabelaPreenchida = false;
    
    @Column(length = 500)
    private String obsTabelaPreenchida = "";

    private Boolean donosConcordaram = false;
    
    @Column(length = 500)
    private String obsDonosConcordaram = "";

    private Boolean calendarioInserido = false;
    
    @Column(length = 500)
    private String obsCalendarioInserido = "";

    private Integer percentualConclusao = 0;

    // Construtor vazio padrão do JPA
    public ChecklistGovernanca() {}

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Boolean getTabelaPreenchida() { return tabelaPreenchida; }
    public void setTabelaPreenchida(Boolean tabelaPreenchida) { this.tabelaPreenchida = tabelaPreenchida; }
    public String getObsTabelaPreenchida() { return obsTabelaPreenchida; }
    public void setObsTabelaPreenchida(String obsTabelaPreenchida) { this.obsTabelaPreenchida = obsTabelaPreenchida; }
    public Boolean getDonosConcordaram() { return donosConcordaram; }
    public void setDonosConcordaram(Boolean donosConcordaram) { this.donosConcordaram = donosConcordaram; }
    public String getObsDonosConcordaram() { return obsDonosConcordaram; }
    public void setObsDonosConcordaram(String obsDonosConcordaram) { this.obsDonosConcordaram = obsDonosConcordaram; }
    public Boolean getCalendarioInserido() { return calendarioInserido; }
    public void setCalendarioInserido(Boolean calendarioInserido) { this.calendarioInserido = calendarioInserido; }
    public String getObsCalendarioInserido() { return obsCalendarioInserido; }
    public void setObsCalendarioInserido(String obsCalendarioInserido) { this.obsCalendarioInserido = obsCalendarioInserido; }
    public Integer getPercentualConclusao() { return percentualConclusao; }
    public void setPercentualConclusao(Integer percentualConclusao) { this.percentualConclusao = percentualConclusao; }
}