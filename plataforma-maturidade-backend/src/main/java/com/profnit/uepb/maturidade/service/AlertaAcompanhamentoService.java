package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.AlertaAcompanhamento;
import com.profnit.uepb.maturidade.domain.PeriodicidadeAlerta;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.repository.AlertaAcompanhamentoRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.web.dto.AlertaAcompanhamentoRequestDTO;
import com.profnit.uepb.maturidade.web.dto.AlertaAcompanhamentoResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Regras de negócio da US16 — Alertas de Acompanhamento.
 *
 * CA1: periodicidade (Mensal/Trimestral/Semestral/Anual) + gatilho textual,
 *      sempre vinculados a um processo existente.
 * CA2: edição e exclusão livres pelo gestor; listagem alimenta a futura tela
 *      de calendário (US17).
 * CA3: nenhuma integração externa ou disparo de e-mail — apenas CRUD de
 *      datas fixas configuradas manualmente.
 */
@Service
public class AlertaAcompanhamentoService {

    private final AlertaAcompanhamentoRepository alertaRepository;
    private final ProcessoRepository processoRepository;

    public AlertaAcompanhamentoService(AlertaAcompanhamentoRepository alertaRepository,
                                        ProcessoRepository processoRepository) {
        this.alertaRepository = alertaRepository;
        this.processoRepository = processoRepository;
    }

    @Transactional
    public AlertaAcompanhamentoResponseDTO criar(Long processoId, AlertaAcompanhamentoRequestDTO request, String usuarioLogado) {
        Processo processo = buscarProcesso(processoId);
        PeriodicidadeAlerta periodicidade = validarPeriodicidade(request.getPeriodicidade());
        validarCamposObrigatorios(request);

        AlertaAcompanhamento alerta = new AlertaAcompanhamento();
        alerta.setProcesso(processo);
        alerta.setTitulo(request.getTitulo().trim());
        alerta.setPeriodicidade(periodicidade);
        alerta.setDataReferencia(request.getDataReferencia());
        alerta.setGatilho(request.getGatilho().trim());
        alerta.setAtivo(request.getAtivo() == null || request.getAtivo());
        alerta.setCriadoPor(usuarioLogado);

        AlertaAcompanhamento salvo = alertaRepository.save(alerta);
        return converterParaDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<AlertaAcompanhamentoResponseDTO> listarPorProcesso(Long processoId) {
        buscarProcesso(processoId); // garante 404 caso o processo não exista
        return alertaRepository.findByProcessoIdOrderByDataReferenciaAsc(processoId)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos os alertas ativos de todos os processos — usada pela tela
     * de calendário de governança (US17).
     */
    @Transactional(readOnly = true)
    public List<AlertaAcompanhamentoResponseDTO> listarTodosAtivos() {
        return alertaRepository.findByAtivoTrueOrderByDataReferenciaAsc()
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertaAcompanhamentoResponseDTO atualizar(Long processoId, Long alertaId, AlertaAcompanhamentoRequestDTO request, String usuarioLogado) {
        AlertaAcompanhamento alerta = buscarAlertaDoProcesso(processoId, alertaId);
        PeriodicidadeAlerta periodicidade = validarPeriodicidade(request.getPeriodicidade());
        validarCamposObrigatorios(request);

        alerta.setTitulo(request.getTitulo().trim());
        alerta.setPeriodicidade(periodicidade);
        alerta.setDataReferencia(request.getDataReferencia());
        alerta.setGatilho(request.getGatilho().trim());
        if (request.getAtivo() != null) {
            alerta.setAtivo(request.getAtivo());
        }
        alerta.setAtualizadoPor(usuarioLogado);

        AlertaAcompanhamento salvo = alertaRepository.save(alerta);
        return converterParaDTO(salvo);
    }
    @Transactional
    public AlertaAcompanhamentoResponseDTO concluirRevisao(Long processoId, Long alertaId, String usuarioLogado) {
        AlertaAcompanhamento alerta = buscarAlertaDoProcesso(processoId, alertaId);
        
        // Pega a data de hoje
        LocalDate hoje = LocalDate.now();
        
        // Calcula o próximo ciclo somando os meses da periodicidade (Mensal = +1, Anual = +12)
        LocalDate proximoCiclo = hoje.plusMonths(alerta.getPeriodicidade().getIntervaloMeses());
        
        // Define a nova data para o futuro!
        alerta.setDataReferencia(proximoCiclo);
        alerta.setAtualizadoPor(usuarioLogado);
        
        AlertaAcompanhamento salvo = alertaRepository.save(alerta);
        return converterParaDTO(salvo);
    }

    @Transactional
    public void excluir(Long processoId, Long alertaId) {
        AlertaAcompanhamento alerta = buscarAlertaDoProcesso(processoId, alertaId);
        alertaRepository.delete(alerta);
    }

    private Processo buscarProcesso(Long processoId) {
        return processoRepository.findById(processoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
    }

    private AlertaAcompanhamento buscarAlertaDoProcesso(Long processoId, Long alertaId) {
        return alertaRepository.findByIdAndProcessoId(alertaId, processoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alerta de acompanhamento não encontrado para este processo."));
    }

    private PeriodicidadeAlerta validarPeriodicidade(String periodicidade) {
        if (periodicidade == null || periodicidade.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A periodicidade do alerta é obrigatória.");
        }
        try {
            return PeriodicidadeAlerta.valueOf(periodicidade.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Periodicidade inválida. Valores aceitos: MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL.");
        }
    }

    private void validarCamposObrigatorios(AlertaAcompanhamentoRequestDTO request) {
        if (request.getTitulo() == null || request.getTitulo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O título do alerta é obrigatório.");
        }
        if (request.getGatilho() == null || request.getGatilho().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O gatilho textual do alerta é obrigatório.");
        }
        if (request.getDataReferencia() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data de referência do alerta é obrigatória.");
        }
    }

    /**
     * Calcula a próxima data programada do alerta a partir da data de
     * referência e da periodicidade, avançando em intervalos fixos até
     * alcançar uma data igual ou posterior a hoje (CA3 — apenas cálculo de
     * calendário local, sem qualquer chamada externa).
     */
    private LocalDate calcularProximaOcorrencia(LocalDate dataReferencia, PeriodicidadeAlerta periodicidade) {
        if (dataReferencia == null || periodicidade == null) {
            return null;
        }
        LocalDate hoje = LocalDate.now();
        LocalDate proxima = dataReferencia;
        while (proxima.isBefore(hoje)) {
            proxima = proxima.plusMonths(periodicidade.getIntervaloMeses());
        }
        return proxima;
    }

    private AlertaAcompanhamentoResponseDTO converterParaDTO(AlertaAcompanhamento entidade) {
        AlertaAcompanhamentoResponseDTO dto = new AlertaAcompanhamentoResponseDTO();
        dto.setId(entidade.getId());
        dto.setProcessoId(entidade.getProcesso().getId());
        dto.setProcessoNome(entidade.getProcesso().getNome());
        dto.setTitulo(entidade.getTitulo());
        dto.setPeriodicidade(entidade.getPeriodicidade().name());
        dto.setDataReferencia(entidade.getDataReferencia());
        dto.setProximaOcorrencia(calcularProximaOcorrencia(entidade.getDataReferencia(), entidade.getPeriodicidade()));
        dto.setGatilho(entidade.getGatilho());
        dto.setAtivo(entidade.getAtivo());
        dto.setCriadoEm(entidade.getCriadoEm());
        dto.setCriadoPor(entidade.getCriadoPor());
        dto.setAtualizadoEm(entidade.getAtualizadoEm());
        dto.setAtualizadoPor(entidade.getAtualizadoPor());
        return dto;
    }
}
