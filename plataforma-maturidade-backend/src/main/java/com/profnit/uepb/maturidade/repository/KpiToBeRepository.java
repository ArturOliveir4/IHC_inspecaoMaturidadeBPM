package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.IndicadorKpiToBe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KpiToBeRepository extends JpaRepository<IndicadorKpiToBe, Long> {
    Optional<IndicadorKpiToBe> findByProcessoIdAndCicloAvaliacaoId(Long processoId, Long cicloAvaliacaoId);
}