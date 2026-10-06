package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.InstrumentoMonitoramento;
import com.profnit.uepb.maturidade.domain.PlanoGovernanca;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.domain.ChecklistGovernanca; // Certifique-se de criar esta entidade!
import com.profnit.uepb.maturidade.repository.InstrumentoMonitoramentoRepository;
import com.profnit.uepb.maturidade.repository.PlanoGovernancaRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.repository.ChecklistGovernancaRepository; // Certifique-se de criar este repositório!
import com.profnit.uepb.maturidade.web.dto.PlanoGovernancaRequestDTO;
import com.profnit.uepb.maturidade.web.dto.PlanoGovernancaResponseDTO;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlanoGovernancaService {
    private final PlanoGovernancaRepository repository;
    private final ProcessoRepository processoRepository;
    private final InstrumentoMonitoramentoRepository instrumentoRepository;
    private final ChecklistGovernancaRepository checklistRepository; // NOVO

    public PlanoGovernancaService(
        PlanoGovernancaRepository repository,
        ProcessoRepository processoRepository,
        InstrumentoMonitoramentoRepository instrumentoRepository,
        ChecklistGovernancaRepository checklistRepository // NOVO
    ) {
        this.repository = repository;
        this.processoRepository = processoRepository;
        this.instrumentoRepository = instrumentoRepository;
        this.checklistRepository = checklistRepository;
    }

    @Transactional(readOnly = true)
    public List<PlanoGovernancaResponseDTO> listarVigentes() {
        return repository.findByVigenteTrueOrderByProcessoNomeAsc().stream()
            .map(PlanoGovernancaResponseDTO::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PlanoGovernancaResponseDTO> listarHistorico(Long processoId) {
        validarProcessoPriorizado(processoId);
        return repository.findByProcessoIdOrderByVersaoDesc(processoId).stream()
            .map(PlanoGovernancaResponseDTO::from)
            .toList();
    }

    @Transactional
    public PlanoGovernancaResponseDTO salvar(PlanoGovernancaRequestDTO request, String usuario) {
        validarRequest(request);
        Processo processo = validarProcessoPriorizado(request.processoId());
        InstrumentoMonitoramento instrumento = validarInstrumento(request.instrumentoMonitoramentoId(), processo.getId());

        repository.findByProcessoIdAndVigenteTrue(processo.getId()).ifPresent(anterior -> {
            anterior.setVigente(false);
            repository.save(anterior);
        });

        PlanoGovernanca novaVersao = new PlanoGovernanca();
        novaVersao.setProcesso(processo);
        novaVersao.setDonoProcesso(request.donoProcesso().trim());
        novaVersao.setInstrumentoMonitoramento(instrumento);
        novaVersao.setInstrumentoMonitoramentoNome(instrumento.getNome());
        novaVersao.setPeriodicidadeRevisao(request.periodicidadeRevisao());
        novaVersao.setGatilhosNovoCiclo(request.gatilhosNovoCiclo().trim());
        novaVersao.setVersao((int) repository.countByProcessoId(processo.getId()) + 1);
        novaVersao.setVigente(true);
        novaVersao.setCriadoPor(usuario == null || usuario.isBlank() ? "sistema" : usuario);
        return PlanoGovernancaResponseDTO.from(repository.save(novaVersao));
    }

    // 👇 NOVOS MÉTODOS DO CHECKLIST INJETADOS NO SERVICE (CA1 e CA3)
    @Transactional(readOnly = true)
    public ChecklistGovernanca buscarChecklistModulo() {
        return checklistRepository.findById(1L).orElse(new ChecklistGovernanca());
    }

    @Transactional
    public ChecklistGovernanca salvarChecklistModulo(ChecklistGovernanca checklist) {
        checklist.setId(1L); // Trava no ID 1 para ser global do Módulo 4
        
        // CA1: Cálculo automático antes de salvar
        int concluidos = 0;
        if (Boolean.TRUE.equals(checklist.getTabelaPreenchida())) concluidos++;
        if (Boolean.TRUE.equals(checklist.getDonosConcordaram())) concluidos++;
        if (Boolean.TRUE.equals(checklist.getCalendarioInserido())) concluidos++;
        
        checklist.setPercentualConclusao((concluidos * 100) / 3);

        return checklistRepository.save(checklist);
    }

    // ... MÉTODOS DE VALIDAÇÃO MANTIDOS ...
    private Processo validarProcessoPriorizado(Long processoId) {
        if (processoId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O processo é obrigatório.");
        }
        Processo processo = processoRepository.findById(processoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
        if (!Boolean.TRUE.equals(processo.getPriorizado())) {
            throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "O plano de governança só pode ser cadastrado para processos priorizados no Módulo 1."
            );
        }
        return processo;
    }

    private InstrumentoMonitoramento validarInstrumento(Long instrumentoId, Long processoId) {
        if (instrumentoId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O instrumento de monitoramento é obrigatório.");
        }
        InstrumentoMonitoramento instrumento = instrumentoRepository.findById(instrumentoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instrumento de monitoramento não encontrado."));
        if (!Boolean.TRUE.equals(instrumento.getAtivo())) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "O instrumento de monitoramento está inativo.");
        }
        if (!instrumento.getProcesso().getId().equals(processoId)) {
            throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                "O instrumento selecionado não pertence ao processo informado."
            );
        }
        return instrumento;
    }

    private void validarRequest(PlanoGovernancaRequestDTO request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Os dados do plano são obrigatórios.");
        }
        campoObrigatorio(request.donoProcesso(), "O dono do processo é obrigatório.");
        if (request.periodicidadeRevisao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A periodicidade de revisão é obrigatória.");
        }
        campoObrigatorio(request.gatilhosNovoCiclo(), "Os gatilhos para novo ciclo são obrigatórios.");
    }

    private void campoObrigatorio(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
        }
    }
}