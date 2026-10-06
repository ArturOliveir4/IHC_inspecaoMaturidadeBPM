// src/main/java/com/profnit/uepb/maturidade/repository/RespostaQuestaoRepository.java
package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.RespostaQuestao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RespostaQuestaoRepository extends JpaRepository<RespostaQuestao, Long> {

    /**
     * Busca a resposta específica de uma avaliação por princípio e questão.
     * Utilizado pelo Service para decidir entre INSERT e UPDATE (upsert manual).
     */
    // Busca resposta específica para fazer upsert (salvar ou atualizar)
    Optional<RespostaQuestao> findByAvaliacaoIdAndNumeroPrincipioAndNumeroQuestao(
        Long avaliacaoId,
        Integer numeroPrincipio,
        Integer numeroQuestao
    );

    /**
     * Retorna todas as respostas de uma avaliação, ordenadas por princípio e questão.
     * Utilizado para restaurar o estado do formulário ao retomar (CA2).
     */
    List<RespostaQuestao> findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(Long avaliacaoId);

    /**
     * Atualização direta da nota de uma resposta já existente via JPQL.
     * Evita carregar o objeto inteiro apenas para alterar um campo escalar.
     * Anotado com @Modifying para indicar operação de escrita ao JPA.
     */
    @Modifying
    @Query("""
        UPDATE RespostaQuestao r
        SET r.nota = :nota, r.atualizadoEm = CURRENT_TIMESTAMP
        WHERE r.avaliacao.id = :avaliacaoId
          AND r.numeroPrincipio = :numeroPrincipio
          AND r.numeroQuestao = :numeroQuestao
        """)
    int atualizarNota(
        @Param("avaliacaoId") Long avaliacaoId,
        @Param("numeroPrincipio") Integer numeroPrincipio,
        @Param("numeroQuestao") Integer numeroQuestao,
        @Param("nota") Integer nota
    );

    /**
     * Conta quantas respostas já foram registradas para uma avaliação.
     * Utilizado para verificar se todas as 20 questões foram respondidas.
     */
    long countByAvaliacaoId(Long avaliacaoId);
    // Busca todas as respostas de uma avaliação (para restaurar estado)
    List<RespostaQuestao> findByAvaliacaoId(Long avaliacaoId);
}
