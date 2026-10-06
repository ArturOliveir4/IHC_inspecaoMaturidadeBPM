package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.InstrumentoMonitoramento;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.repository.InstrumentoMonitoramentoRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.web.dto.InstrumentoMonitoramentoRequestDTO;
import com.profnit.uepb.maturidade.web.dto.InstrumentoMonitoramentoResponseDTO;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class InstrumentoMonitoramentoService {
    
    private final InstrumentoMonitoramentoRepository repository;
    private final ProcessoRepository processoRepository;

    public InstrumentoMonitoramentoService(
        InstrumentoMonitoramentoRepository repository,
        ProcessoRepository processoRepository
    ) {
        this.repository = repository;
        this.processoRepository = processoRepository;
    }

    @Transactional(readOnly = true)
    public List<InstrumentoMonitoramentoResponseDTO> listarAtivosPorProcesso(Long processoId) {
        validarProcessoPriorizado(processoId);
        return repository.findByProcessoIdAndAtivoTrueOrderByNomeAsc(processoId).stream()
            .map(InstrumentoMonitoramentoResponseDTO::from)
            .toList();
    }

    @Transactional
    public InstrumentoMonitoramentoResponseDTO cadastrar(InstrumentoMonitoramentoRequestDTO request) {
        if (request == null || request.nome() == null || request.nome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do instrumento é obrigatório.");
        }
        Processo processo = validarProcessoPriorizado(request.processoId());
        InstrumentoMonitoramento instrumento = new InstrumentoMonitoramento();
        instrumento.setProcesso(processo);
        instrumento.setNome(request.nome().trim());
        instrumento.setDescricao(request.descricao() == null ? null : request.descricao().trim());
        instrumento.setAtivo(true);
        return InstrumentoMonitoramentoResponseDTO.from(repository.save(instrumento));
    }

    private Processo validarProcessoPriorizado(Long processoId) {
        if (processoId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O processo é obrigatório.");
        }
        Processo processo = processoRepository.findById(processoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
        if (!Boolean.TRUE.equals(processo.getPriorizado())) {
            throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "Instrumentos do Módulo 3 só podem ser associados a processos priorizados."
            );
        }
        return processo;
    }
}
