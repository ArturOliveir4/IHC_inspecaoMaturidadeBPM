package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.ChecklistGovernanca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChecklistGovernancaRepository extends JpaRepository<ChecklistGovernanca, Long> {
}