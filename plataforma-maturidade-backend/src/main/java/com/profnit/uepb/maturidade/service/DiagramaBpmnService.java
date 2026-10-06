package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.DiagramaBpmnAsIs;
import com.profnit.uepb.maturidade.domain.Processo;
import com.profnit.uepb.maturidade.repository.DiagramaBpmnAsIsRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.web.dto.DiagramaBpmnResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class DiagramaBpmnService {

    private static final long LIMITE_BYTES = 10 * 1024 * 1024;
    private static final Set<String> FORMATOS_VALIDOS = Set.of("pdf", "png", "jpg", "jpeg");

    private final ProcessoRepository processoRepository;
    private final DiagramaBpmnAsIsRepository diagramaRepository;
    private final Path diretorioUpload;

    public DiagramaBpmnService(ProcessoRepository processoRepository,
                               DiagramaBpmnAsIsRepository diagramaRepository,
                               @Value("${app.uploads.bpmn-dir:uploads/bpmn}") String uploadDir) {
        this.processoRepository = processoRepository;
        this.diagramaRepository = diagramaRepository;
        this.diretorioUpload = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public DiagramaBpmnResponseDTO salvar(Long processoId, MultipartFile arquivo, String usuario) {
        Processo processo = processoRepository.findById(processoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Processo não encontrado."));
        validarArquivo(arquivo);

        String formato = extrairExtensao(arquivo.getOriginalFilename());
        String nomeArmazenado = UUID.randomUUID() + "." + formato;

        try {
            Files.createDirectories(diretorioUpload);
            Path destino = diretorioUpload.resolve(nomeArmazenado).normalize();
            arquivo.transferTo(destino.toFile());

            DiagramaBpmnAsIs diagrama = new DiagramaBpmnAsIs();
            diagrama.setProcesso(processo);
            diagrama.setNomeOriginal(arquivo.getOriginalFilename());
            diagrama.setNomeArmazenado(nomeArmazenado);
            diagrama.setFormato(formato.toUpperCase(Locale.ROOT));
            diagrama.setContentType(arquivo.getContentType());
            diagrama.setTamanhoBytes(arquivo.getSize());
            diagrama.setCaminhoArquivo(destino.toString());
            diagrama.setEnviadoPor(usuario);
            return DiagramaBpmnResponseDTO.from(diagramaRepository.save(diagrama));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao armazenar o diagrama BPMN.");
        }
    }

    @Transactional(readOnly = true)
    public DiagramaBpmnResponseDTO buscarUltimo(Long processoId) {
        return DiagramaBpmnResponseDTO.from(buscarUltimoEntity(processoId));
    }

    @Transactional(readOnly = true)
    public Resource carregarArquivo(Long processoId) {
        DiagramaBpmnAsIs diagrama = buscarUltimoEntity(processoId);
        try {
            Resource resource = new UrlResource(Path.of(diagrama.getCaminhoArquivo()).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo do diagrama não encontrado no servidor.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Caminho do diagrama inválido.");
        }
    }

    @Transactional(readOnly = true)
    public DiagramaBpmnAsIs buscarUltimoEntity(Long processoId) {
        return diagramaRepository.findTopByProcessoIdOrderByEnviadoEmDesc(processoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum diagrama BPMN foi enviado para este processo."));
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione um arquivo PDF, PNG ou JPEG.");
        }
        if (arquivo.getSize() > LIMITE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O arquivo excede o limite máximo de 10 MB.");
        }
        if (!FORMATOS_VALIDOS.contains(extrairExtensao(arquivo.getOriginalFilename()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato inválido. Envie PDF, PNG ou JPEG.");
        }
    }

    private String extrairExtensao(String nomeArquivo) {
        if (nomeArquivo == null || !nomeArquivo.contains(".")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O arquivo precisa possuir extensão PDF, PNG ou JPEG.");
        }
        return nomeArquivo.substring(nomeArquivo.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
