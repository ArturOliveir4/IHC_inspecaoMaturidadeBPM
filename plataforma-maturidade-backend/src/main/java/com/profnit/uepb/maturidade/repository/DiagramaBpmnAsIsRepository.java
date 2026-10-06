package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.DiagramaBpmnAsIs;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiagramaBpmnAsIsRepository extends JpaRepository<DiagramaBpmnAsIs, Long> {
    Optional<DiagramaBpmnAsIs> findTopByProcessoIdOrderByEnviadoEmDesc(Long processoId);
}
