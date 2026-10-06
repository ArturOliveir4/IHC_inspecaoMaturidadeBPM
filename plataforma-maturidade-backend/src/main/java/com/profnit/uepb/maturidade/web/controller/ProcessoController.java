package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.repository.InstrumentoMonitoramentoRepository;
import com.profnit.uepb.maturidade.repository.PlanoGovernancaRepository;
import com.profnit.uepb.maturidade.repository.AlertaAcompanhamentoRepository;
import com.profnit.uepb.maturidade.web.dto.ProcessoPriorizacaoRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/processos")
public class ProcessoController {

    private final ProcessoRepository processoRepository;
    private final InstrumentoMonitoramentoRepository instrumentoRepository;
    private final PlanoGovernancaRepository planoGovernancaRepository;
    private final AlertaAcompanhamentoRepository alertaRepository;

    // Construtor atualizado com os novos repositórios
    public ProcessoController(
            ProcessoRepository processoRepository,
            InstrumentoMonitoramentoRepository instrumentoRepository,
            PlanoGovernancaRepository planoGovernancaRepository,
            AlertaAcompanhamentoRepository alertaRepository) {
        this.processoRepository = processoRepository;
        this.instrumentoRepository = instrumentoRepository;
        this.planoGovernancaRepository = planoGovernancaRepository;
        this.alertaRepository = alertaRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN', 'AVALIADOR')")
    public ResponseEntity<List<Processo>> listarTodos() {
        return ResponseEntity.ok(processoRepository.findAll());
    }

    @GetMapping("/priorizados")
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN', 'AVALIADOR')")
    public ResponseEntity<List<Processo>> listarPriorizados() {
        return ResponseEntity.ok(processoRepository.findByPriorizadoTrueOrderByNomeAsc());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ANALISTA', 'GESTOR', 'ADMIN', 'AVALIADOR')")
    public ResponseEntity<Processo> buscarPorId(@PathVariable Long id) {
        Processo processo = processoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
        return ResponseEntity.ok(processo);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ANALISTA', 'ADMIN')")
    public ResponseEntity<Processo> cadastrar(@RequestBody Processo processo) {
        if (processo.getNome() == null || processo.getNome().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do processo é obrigatório.");
        }
        Processo novoProcesso = processoRepository.save(processo);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProcesso);
    }

    @PatchMapping("/{id}/priorizacao")
    @PreAuthorize("hasAnyRole('GESTOR', 'ANALISTA', 'ADMIN')")
    public ResponseEntity<Processo> atualizarPriorizacao(
        @PathVariable Long id,
        @RequestBody ProcessoPriorizacaoRequestDTO request
    ) {
        if (request == null || request.priorizado() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O status de priorização é obrigatório.");
        }
        Processo processo = processoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
        processo.setPriorizado(request.priorizado());
        return ResponseEntity.ok(processoRepository.save(processo));
    }

    // 👇 MÉTODO ATUALIZADO
    @Transactional
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ANALISTA', 'ADMIN')")
    public ResponseEntity<Void> deletarProcesso(@PathVariable Long id) {
        if (!processoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado.");
        }
        
        // 1. Limpa as dependências filhas na ordem reversa de criação para evitar bloqueios
        alertaRepository.deleteByProcessoId(id);
        planoGovernancaRepository.deleteByProcessoId(id);
        instrumentoRepository.deleteByProcessoId(id);
        
        // (Nota: se você tiver módulos AS-IS e TO-BE amarrados, talvez precise chamar as deleções deles aqui também!)

        // 2. Agora apaga o Processo principal com segurança
        processoRepository.deleteById(id);
        
        return ResponseEntity.noContent().build();
    }
}