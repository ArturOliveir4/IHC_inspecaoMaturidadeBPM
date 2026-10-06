package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.IndicadorKpiAsIs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface IndicadorKpiAsIsRepository extends JpaRepository<IndicadorKpiAsIs, Long> {

    boolean existsByProcessoIdAndCicloAvaliacaoId(Long processoId, Long cicloAvaliacaoId);

    Optional<IndicadorKpiAsIs> findByProcessoIdAndCicloAvaliacaoId(Long processoId, Long cicloAvaliacaoId);

    Optional<IndicadorKpiAsIs> findTopByProcessoIdOrderByCriadoEmDesc(Long processoId);

    /**
     * Retorna, em uma única consulta, o indicador KPI AS-IS mais recente de CADA processo
     * cadastrado (o de maior ID, assumindo IDENTITY = ordem de criação).
     *
     * Usado pelo Dashboard Gerencial (US19 / CA1) para consolidar os KPIs de todos os
     * processos sem incorrer em N+1 queries (driver USA-03 / CA2 — resposta rápida).
     */
    @Query("""
        SELECT k FROM IndicadorKpiAsIs k
        WHERE k.id IN (
            SELECT MAX(k2.id) FROM IndicadorKpiAsIs k2 GROUP BY k2.processo.id
        )
        """)
    List<IndicadorKpiAsIs> findUltimoIndicadorDeCadaProcesso();
}
