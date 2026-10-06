package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.Avaliacao;
import com.profnit.uepb.maturidade.domain.StatusAvaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    @Query("""
        SELECT a FROM Avaliacao a
        WHERE a.emailAvaliador = :emailAvaliador
          AND a.status = :status
        ORDER BY a.atualizadoEm DESC
        """)
    Optional<Avaliacao> findPrimeiraByEmailAvaliadorEStatus(
        @Param("emailAvaliador") String emailAvaliador,
        @Param("status") StatusAvaliacao status
    );

    @Query("""
        SELECT a FROM Avaliacao a
        WHERE a.emailAvaliador = :emailAvaliador
          AND a.status = com.profnit.uepb.maturidade.domain.StatusAvaliacao.CONCLUIDA
        ORDER BY a.atualizadoEm DESC
        """)
    List<Avaliacao> findConcluidasByEmailAvaliador(@Param("emailAvaliador") String emailAvaliador);

    boolean existsByEmailAvaliadorAndStatus(String emailAvaliador, StatusAvaliacao status);

    List<Avaliacao> findByStatusOrderByAtualizadoEmDesc(StatusAvaliacao status);

    List<Avaliacao> findAllByOrderByAtualizadoEmDesc();

    Optional<Avaliacao> findFirstByEmailAvaliadorOrderByIdDesc(String email);
}
