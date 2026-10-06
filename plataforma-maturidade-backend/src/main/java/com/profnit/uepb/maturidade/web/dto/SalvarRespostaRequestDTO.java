package com.profnit.uepb.maturidade.web.dto;

/**
 * Payload recebido pelo frontend a cada alteração de resposta (CA1).
 * Representa uma única questão sendo persistida automaticamente.
 */
public class SalvarRespostaRequestDTO {

    private Integer numeroPrincipio;
    private Integer numeroQuestao;
    private Integer nota;
    private Integer etapaAtual;

    public SalvarRespostaRequestDTO() {}

    public SalvarRespostaRequestDTO(Integer numeroPrincipio, Integer numeroQuestao, Integer nota, Integer etapaAtual) {
        this.numeroPrincipio = numeroPrincipio;
        this.numeroQuestao = numeroQuestao;
        this.nota = nota;
        this.etapaAtual = etapaAtual;
    }

    public Integer getNumeroPrincipio() { return numeroPrincipio; }
    public void setNumeroPrincipio(Integer numeroPrincipio) { this.numeroPrincipio = numeroPrincipio; }

    public Integer getNumeroQuestao() { return numeroQuestao; }
    public void setNumeroQuestao(Integer numeroQuestao) { this.numeroQuestao = numeroQuestao; }

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }

    public Integer getEtapaAtual() { return etapaAtual; }
    public void setEtapaAtual(Integer etapaAtual) { this.etapaAtual = etapaAtual; }
}