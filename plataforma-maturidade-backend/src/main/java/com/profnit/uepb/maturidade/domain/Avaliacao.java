package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Cabeçalho de um ciclo de diagnóstico de maturidade BPM.
 * Representa a avaliação como um todo, controlando status e progresso de etapa.
 * Uma avaliação pertence a um único avaliador (identificado pelo e-mail do JWT).
 *
 * Regra CA3 / CONF-02: a constraint única sobre (email_avaliador, status=EM_ANDAMENTO)
 * é garantida em nível de serviço para evitar sessões duplicadas em andamento.
 */
@Entity
@Table(name = "avaliacoes")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email_avaliador", nullable = false)
    private String emailAvaliador;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAvaliacao status;

    @Column(name = "etapa_atual", nullable = false)
    private Integer etapaAtual = 1;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @OneToMany(mappedBy = "avaliacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RespostaQuestao> respostas = new ArrayList<>();

    public Avaliacao() {}

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmailAvaliador() { return emailAvaliador; }
    public void setEmailAvaliador(String emailAvaliador) { this.emailAvaliador = emailAvaliador; }

    public StatusAvaliacao getStatus() { return status; }
    public void setStatus(StatusAvaliacao status) { this.status = status; }

    public Integer getEtapaAtual() { return etapaAtual; }
    public void setEtapaAtual(Integer etapaAtual) { this.etapaAtual = etapaAtual; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }

    public List<RespostaQuestao> getRespostas() { return respostas; }
    public void setRespostas(List<RespostaQuestao> respostas) { this.respostas = respostas; }

    public void adicionarResposta(RespostaQuestao resposta) {
        respostas.add(resposta);
        resposta.setAvaliacao(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Avaliacao avaliacao = (Avaliacao) o;
        return Objects.equals(id, avaliacao.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}