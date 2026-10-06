package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.IndicadorKpiToBe;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.repository.KpiToBeRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository; 
import com.profnit.uepb.maturidade.web.dto.KpiToBeRequestDTO;
import com.profnit.uepb.maturidade.web.dto.KpiToBeResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class KpiToBeService {

    private final KpiToBeRepository kpiToBeRepository;
    private final ProcessoRepository processoRepository;

    public KpiToBeService(KpiToBeRepository kpiToBeRepository, ProcessoRepository processoRepository) {
        this.kpiToBeRepository = kpiToBeRepository;
        this.processoRepository = processoRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public KpiToBeResponseDTO cadastrar(Long processoId, KpiToBeRequestDTO request, String usuarioLogado) {
        // Verifica se o processo correspondente existe (Garante o CA2)
        Processo processo = processoRepository.findById(processoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado"));

        // Verifica se já existe um cenário TO-BE para este processo e ciclo para evitar duplicidade
        kpiToBeRepository.findByProcessoIdAndCicloAvaliacaoId(processoId, request.getCicloAvaliacaoId())
                .ifPresent(kpi -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cenário TO-BE já cadastrado para este ciclo");
                });

        IndicadorKpiToBe kpiToBe = new IndicadorKpiToBe();
        kpiToBe.setProcesso(processo);
        kpiToBe.setCicloAvaliacaoId(request.getCicloAvaliacaoId());
        kpiToBe.setTmc(request.getTmc());
        kpiToBe.setUnidadeTmc(request.getUnidadeTmc());
        kpiToBe.setTr(request.getTr());
        kpiToBe.setNs(request.getNs());
        kpiToBe.setCriadoPor(usuarioLogado);

        IndicadorKpiToBe salvo = kpiToBeRepository.save(kpiToBe);
        return convertToDTO(salvo);
    }

    @Transactional(readOnly = true)
    public KpiToBeResponseDTO buscarPorProcessoECiclo(Long processoId, Long cicloAvaliacaoId) {
        IndicadorKpiToBe kpiToBe = kpiToBeRepository.findByProcessoIdAndCicloAvaliacaoId(processoId, cicloAvaliacaoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Indicadores TO-BE não encontrados para este ciclo"));
        
        return convertToDTO(kpiToBe);
    }

    private KpiToBeResponseDTO convertToDTO(IndicadorKpiToBe entidade) {
        KpiToBeResponseDTO dto = new KpiToBeResponseDTO();
        dto.setId(entidade.getId());
        dto.setProcessoId(entidade.getProcesso().getId());
        dto.setCicloAvaliacaoId(entidade.getCicloAvaliacaoId());
        dto.setTmc(entidade.getTmc());
        dto.setUnidadeTmc(entidade.getUnidadeTmc());
        dto.setTr(entidade.getTr());
        dto.setNs(entidade.getNs());
        dto.setCriadoEm(entidade.getCriadoEm());
        dto.setCriadoPor(entidade.getCriadoPor());
        dto.setAtualizadoEm(entidade.getAtualizadoEm());
        dto.setAtualizadoPor(entidade.getAtualizadoPor());
        return dto;
    }

    @Transactional(rollbackFor = Exception.class)
    public KpiToBeResponseDTO editar(Long processoId, Long indicadorId, KpiToBeRequestDTO request, String usuario) {
        // Busca o indicador existente no banco
        IndicadorKpiToBe indicador = kpiToBeRepository.findById(indicadorId)
                .orElseThrow(() -> new RuntimeException("Indicador TO-BE não encontrado"));

        // Garante que a ficha pertence mesmo ao processo da URL
        if (!indicador.getProcesso().getId().equals(processoId)) {
            throw new RuntimeException("O indicador não pertence ao processo informado");
        }

        // Atualiza os dados matemáticos da meta
        indicador.setCicloAvaliacaoId(request.getCicloAvaliacaoId());
        indicador.setTmc(request.getTmc());
        indicador.setUnidadeTmc(request.getUnidadeTmc());
        indicador.setTr(request.getTr());
        indicador.setNs(request.getNs());

        // Salva as alterações
        IndicadorKpiToBe salvo = kpiToBeRepository.save(indicador);
        
        // Converte e retorna usando o padrão do seu projeto
        return convertToDTO(salvo);
    }
}