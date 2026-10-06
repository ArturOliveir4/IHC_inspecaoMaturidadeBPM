package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "diagnosticos")
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    // Persiste as entradas originais do questionário (ID da Questão -> Nota de 1 a 5).
    @ElementCollection
    @CollectionTable(name = "respostas_originais", joinColumns = @JoinColumn(name = "diagnostico_id"))
    @MapKeyColumn(name = "questao_id")
    @Column(name = "nota", nullable = false)
    private Map<Integer, Integer> respostasOriginais = new HashMap<>();

    // Persiste o resultado calculado (ID do Princípio -> Percentual).
    @ElementCollection
    @CollectionTable(name = "resultados_principios", joinColumns = @JoinColumn(name = "diagnostico_id"))
    @MapKeyColumn(name = "principio_id")
    @Column(name = "percentual_maturidade", nullable = false)
    private Map<Integer, Double> resultadosPorPrincipio = new HashMap<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public Map<Integer, Integer> getRespostasOriginais() { return respostasOriginais; }
    public void setRespostasOriginais(Map<Integer, Integer> respostasOriginais) { this.respostasOriginais = respostasOriginais; }

    public Map<Integer, Double> getResultadosPorPrincipio() { return resultadosPorPrincipio; }
    public void setResultadosPorPrincipio(Map<Integer, Double> resultadosPorPrincipio) { this.resultadosPorPrincipio = resultadosPorPrincipio; }
}