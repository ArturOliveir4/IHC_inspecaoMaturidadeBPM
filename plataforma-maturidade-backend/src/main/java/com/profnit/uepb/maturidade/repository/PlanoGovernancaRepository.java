package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.PlanoGovernanca;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanoGovernancaRepository extends JpaRepository<PlanoGovernanca, Long> {
    void deleteByProcessoId(Long processoId);
    Optional<PlanoGovernanca> findByProcessoIdAndVigenteTrue(Long processoId);
    List<PlanoGovernanca> findByVigenteTrueOrderByProcessoNomeAsc();
    List<PlanoGovernanca> findByProcessoIdOrderByVersaoDesc(Long processoId);
    long countByProcessoId(Long processoId);
}
