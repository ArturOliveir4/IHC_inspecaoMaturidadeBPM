package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
    name = "respostas_questoes",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_avaliacao_principio_questao",
        columnNames = {"avaliacao_id", "numero_principio", "numero_questao"}
    )
)
public class RespostaQuestao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "avaliacao_id", nullable = false)
    private Avaliacao avaliacao;

    @Column(name = "numero_principio", nullable = false)
    private Integer numeroPrincipio;

    @Column(name = "numero_questao", nullable = false)
    private Integer numeroQuestao;

    @Column(name = "nota", nullable = false)
    private Integer nota;

    @Column(nullable = false, updatable = false)
    private LocalDateTime respondidoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    public RespostaQuestao() {}

    public RespostaQuestao(Avaliacao avaliacao, Integer numeroPrincipio, Integer numeroQuestao, Integer nota) {
        this.avaliacao = avaliacao;
        this.numeroPrincipio = numeroPrincipio;
        this.numeroQuestao = numeroQuestao;
        this.nota = nota;
    }

    @PrePersist
    private void prePersist() {
        this.respondidoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Avaliacao getAvaliacao() { return avaliacao; }
    public void setAvaliacao(Avaliacao avaliacao) { this.avaliacao = avaliacao; }
    public Integer getNumeroPrincipio() { return numeroPrincipio; }
    public void setNumeroPrincipio(Integer numeroPrincipio) { this.numeroPrincipio = numeroPrincipio; }
    public Integer getNumeroQuestao() { return numeroQuestao; }
    public void setNumeroQuestao(Integer numeroQuestao) { this.numeroQuestao = numeroQuestao; }
    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }
    public LocalDateTime getRespondidoEm() { return respondidoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RespostaQuestao that = (RespostaQuestao) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}