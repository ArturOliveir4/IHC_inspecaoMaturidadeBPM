package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.AcionamentoGatilho;
import com.profnit.uepb.maturidade.domain.AuditoriaLog;
import com.profnit.uepb.maturidade.domain.Avaliacao;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.domain.StatusAvaliacao;
import com.profnit.uepb.maturidade.repository.AcionamentoGatilhoRepository;
import com.profnit.uepb.maturidade.repository.AuditoriaLogRepository;
import com.profnit.uepb.maturidade.repository.AvaliacaoRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.web.dto.AcionamentoGatilhoRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AcionamentoGatilhoService {

    private final AcionamentoGatilhoRepository acionamentoRepository;
    private final ProcessoRepository processoRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final AuditoriaLogRepository auditoriaLogRepository;

    public AcionamentoGatilhoService(AcionamentoGatilhoRepository acionamentoRepository, ProcessoRepository processoRepository, AvaliacaoRepository avaliacaoRepository, AuditoriaLogRepository auditoriaLogRepository) {
        this.acionamentoRepository = acionamentoRepository;
        this.processoRepository = processoRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.auditoriaLogRepository = auditoriaLogRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public void acionarGatilho(Long processoId, AcionamentoGatilhoRequestDTO request, String usuario) {
        Processo processo = processoRepository.findById(processoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
        
        AcionamentoGatilho acionamento = new AcionamentoGatilho();
        acionamento.setProcesso(processo);
        acionamento.setGatilho(request.getGatilho());
        acionamento.setJustificativa(request.getJustificativa());
        acionamento.setDataAcionamento(request.getDataAcionamento());
        acionamento.setCriadoPor(usuario);
        acionamentoRepository.save(acionamento);

        Avaliacao novaAvaliacao = new Avaliacao();
        novaAvaliacao.setEmailAvaliador(usuario);
        novaAvaliacao.setStatus(StatusAvaliacao.EM_ANDAMENTO);
        novaAvaliacao.setEtapaAtual(1);
        avaliacaoRepository.save(novaAvaliacao);

        auditoriaLogRepository.save(new AuditoriaLog(usuario, "Gatilho '" + request.getGatilho() + "' acionado para o processo " + processo.getNome() + ". Novo ciclo de maturidade iniciado."));
    }
}