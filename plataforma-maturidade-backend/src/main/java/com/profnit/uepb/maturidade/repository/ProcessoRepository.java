package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.Processo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProcessoRepository extends JpaRepository<Processo, Long> {
    Optional<Processo> findByNomeIgnoreCase(String nome);
    List<Processo> findByPriorizadoTrueOrderByNomeAsc();
}
