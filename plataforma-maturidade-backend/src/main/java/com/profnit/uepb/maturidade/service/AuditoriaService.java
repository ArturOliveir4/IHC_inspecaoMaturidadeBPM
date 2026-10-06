package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.AuditoriaLog;
import com.profnit.uepb.maturidade.repository.AuditoriaLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    private final AuditoriaLogRepository auditoriaLogRepository;

    public AuditoriaService(AuditoriaLogRepository auditoriaLogRepository) {
        this.auditoriaLogRepository = auditoriaLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(String usuarioIdentificacao, String descricaoAcao) {
        AuditoriaLog log = new AuditoriaLog(
                usuarioIdentificacao != null ? usuarioIdentificacao : "ANONIMO",
                descricaoAcao
        );
        auditoriaLogRepository.save(log);
    }
}