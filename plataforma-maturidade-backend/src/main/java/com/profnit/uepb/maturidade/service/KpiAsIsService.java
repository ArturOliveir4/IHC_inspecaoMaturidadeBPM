package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.CasoAmostraAsIs;
import com.profnit.uepb.maturidade.domain.IndicadorKpiAsIs;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.repository.IndicadorKpiAsIsRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.web.dto.CasoAmostraDTO;
import com.profnit.uepb.maturidade.web.dto.KpiAsIsRequestDTO;
import com.profnit.uepb.maturidade.web.dto.KpiAsIsResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class KpiAsIsService {

    private final ProcessoRepository processoRepository;
    private final IndicadorKpiAsIsRepository indicadorRepository;

    public KpiAsIsService(ProcessoRepository processoRepository,
                          IndicadorKpiAsIsRepository indicadorRepository) {
        this.processoRepository = processoRepository;
        this.indicadorRepository = indicadorRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public KpiAsIsResponseDTO cadastrar(Long processoId, KpiAsIsRequestDTO request, String usuario) {
        validarRequestGuardrails(request);
        Processo processo = buscarProcesso(processoId);

        if (indicadorRepository.existsByProcessoIdAndCicloAvaliacaoId(processoId, request.getCicloAvaliacaoId())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Já existem KPIs AS-IS cadastrados para este processo neste ciclo de avaliação."
            );
        }

        IndicadorKpiAsIs indicador = new IndicadorKpiAsIs();
        indicador.setProcesso(processo);
        indicador.setCicloAvaliacaoId(request.getCicloAvaliacaoId());
        indicador.setCriadoPor(usuario);

        preencherEDeferirCalculos(indicador, request);

        return KpiAsIsResponseDTO.from(indicadorRepository.save(indicador));
    }

    @Transactional(rollbackFor = Exception.class)
    public KpiAsIsResponseDTO editar(Long processoId, Long indicadorId, KpiAsIsRequestDTO request, String usuario) {
        validarRequestGuardrails(request);
        IndicadorKpiAsIs indicador = indicadorRepository.findById(indicadorId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "KPIs AS-IS não encontrados."));

        if (!indicador.getProcesso().getId().equals(processoId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Indicador não pertence ao processo informado.");
        }
        if (!indicador.getCicloAvaliacaoId().equals(request.getCicloAvaliacaoId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O ciclo de avaliação não pode ser alterado na edição.");
        }

        indicador.setAtualizadoPor(usuario);
        preencherEDeferirCalculos(indicador, request);

        return KpiAsIsResponseDTO.from(indicadorRepository.save(indicador));
    }

    @Transactional(readOnly = true)
    public KpiAsIsResponseDTO buscarPorProcessoECiclo(Long processoId, Long cicloAvaliacaoId) {
        IndicadorKpiAsIs indicador = indicadorRepository
            .findByProcessoIdAndCicloAvaliacaoId(processoId, cicloAvaliacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "KPIs AS-IS não encontrados."));
        return KpiAsIsResponseDTO.from(indicador);
    }

    // Motor de Cálculo e Preenchimento das Entidades
    private void preencherEDeferirCalculos(IndicadorKpiAsIs indicador, KpiAsIsRequestDTO request) {
        indicador.setSetorResponsavel(
            request.getSetorResponsavel() != null && !request.getSetorResponsavel().isBlank()
                ? request.getSetorResponsavel() : "CRPA / PROGRAD"
        );
        indicador.setDataMedicao(request.getDataMedicao());
        indicador.setResponsavelAnalise(request.getResponsavelAnalise());
        indicador.setMotivoPriorizacao(request.getMotivoPriorizacao());
        indicador.setDataInicioAmostra(request.getDataInicioAmostra());
        indicador.setDataFimAmostra(request.getDataFimAmostra());
        indicador.setUnidadeTmc(normalizarUnidadeTmc(request.getUnidadeTmc()));
        indicador.setNotaAgilidade(request.getNotaAgilidade());
        indicador.setNotaClareza(request.getNotaClareza());

        // Atualizar lista de amostras (casos)
        indicador.limparCasos();
        List<CasoAmostraDTO> casosDTO = request.getCasos();
        int n = casosDTO.size();
        indicador.setNumeroCasos(n);

        BigDecimal somaTempoTotal = BigDecimal.ZERO;
        long casosComRetrabalho = 0;

        for (CasoAmostraDTO cDto : casosDTO) {
            CasoAmostraAsIs casoEntity = new CasoAmostraAsIs();
            casoEntity.setIdentificadorCaso(cDto.getIdentificadorCaso());
            casoEntity.setDataInicio(cDto.getDataInicio());
            casoEntity.setDataFim(cDto.getDataFim());
            casoEntity.setTempoTotal(cDto.getTempoTotal());
            casoEntity.setHouveRetrabalho(cDto.getHouveRetrabalho());
            casoEntity.setObservacao(cDto.getObservacao());

            indicador.adicionarCaso(casoEntity);

            somaTempoTotal = somaTempoTotal.add(cDto.getTempoTotal());
            if (Boolean.TRUE.equals(cDto.getHouveRetrabalho())) {
                casosComRetrabalho++;
            }
        }

        // MOTOR DE CÁLCULO DE KPIS AUTOMÁTICOS (Seção 3 da especificação)
        
        // KPI 1.1 - TMC = Sum(Tempo Total) / N
        BigDecimal tmcCalculado = somaTempoTotal.divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
        indicador.setTmc(tmcCalculado);

        // KPI 2.1 - TR = (Contagem("Sim") / N) * 100
        BigDecimal trCalculada = BigDecimal.valueOf(casosComRetrabalho)
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(n), 2, RoundingMode.HALF_UP);
        indicador.setTr(trCalculada);

        // KPI 3.1 - NS = (Nota_Agilidade + Nota_Clareza) / 2
        double mediaSatisfacao = (request.getNotaAgilidade() + request.getNotaClareza()) / 2.0;
        indicador.setNs(BigDecimal.valueOf(mediaSatisfacao).setScale(2, RoundingMode.HALF_UP));
    }

    // GUARDRAILS E VALIDAÇÕES DO SISTEMA (Seção 4 da especificação)
    private void validarRequestGuardrails(KpiAsIsRequestDTO request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe os dados da Ficha AS-IS.");
        }
        if (request.getCicloAvaliacaoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O ciclo de avaliação é obrigatório.");
        }
        if (request.getResponsavelAnalise() == null || request.getResponsavelAnalise().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O responsável pela análise é obrigatório.");
        }
        if (request.getMotivoPriorizacao() == null || request.getMotivoPriorizacao().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o motivo da priorização.");
        }

        // Consistência do período opcional da amostra
        if ((request.getDataInicioAmostra() == null) != (request.getDataFimAmostra() == null)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe as duas datas do período da amostra ou deixe ambas em branco."
            );
        }
        if (request.getDataInicioAmostra() != null && request.getDataFimAmostra() != null
                && request.getDataFimAmostra().isBefore(request.getDataInicioAmostra())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A Data Fim da amostra não pode ser anterior à Data Início da amostra."
            );
        }

        // Integridade das Amostras: Exigir N >= 1
        if (request.getCasos() == null || request.getCasos().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A tabela de amostras deve possuir ao menos 1 caso (N ≥ 1).");
        }

        // Intervalo de Resposta: Notas de 1 a 5
        if (request.getNotaAgilidade() == null || request.getNotaAgilidade() < 1 || request.getNotaAgilidade() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nota de agilidade deve ser entre 1 e 5.");
        }
        if (request.getNotaClareza() == null || request.getNotaClareza() < 1 || request.getNotaClareza() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nota de clareza deve ser entre 1 e 5.");
        }

        // Validação linha a linha da tabela de casos
        for (CasoAmostraDTO caso : request.getCasos()) {
            if (caso.getDataInicio() == null || caso.getDataFim() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As datas de início e fim são obrigatórias em todos os casos.");
            }
            // Consistência de Período: Data Fim >= Data Início
            if (caso.getDataFim().isBefore(caso.getDataInicio())) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No caso " + caso.getIdentificadorCaso() + ", a Data Fim não pode ser menor do que a Data Início."
                );
            }
            if (request.getDataInicioAmostra() != null && request.getDataFimAmostra() != null
                    && (caso.getDataInicio().isBefore(request.getDataInicioAmostra())
                        || caso.getDataFim().isAfter(request.getDataFimAmostra()))) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No caso " + caso.getIdentificadorCaso() + ", as datas devem permanecer dentro do período da amostra."
                );
            }
            // Valores Não Negativos: Tempo Total >= 0
            if (caso.getTempoTotal() == null || caso.getTempoTotal().compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No caso " + caso.getIdentificadorCaso() + ", o Tempo Total deve ser maior ou igual a zero."
                );
            }
            if (caso.getHouveRetrabalho() == null) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe se houve retrabalho no caso " + caso.getIdentificadorCaso() + "."
                );
            }
        }
    }

    private Processo buscarProcesso(Long processoId) {
        return processoRepository.findById(processoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
    }

    private String normalizarUnidadeTmc(String unidadeTmc) {
        if (unidadeTmc == null || unidadeTmc.isBlank()) {
            return "DIAS";
        }
        String normalizada = unidadeTmc.trim().toUpperCase();
        if (!normalizada.equals("DIAS") && !normalizada.equals("HORAS")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unidade do TMC deve ser DIAS ou HORAS.");
        }
        return normalizada;
    }
}